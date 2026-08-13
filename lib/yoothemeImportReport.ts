import {
  findYoothemeCapability,
  getYoothemeCapabilityEvidence,
  resolveYoothemeSourceCapability,
  type YoothemeCapabilityStatus,
  type YoothemeCapabilityEvidence,
  type YoothemeSemanticCapabilityRecord,
} from "@/lib/yoothemeCompatibilityRegistry";

export type YoothemeImportReportOccurrence = {
  sourcePath: string;
  sourceValue: unknown;
};

/**
 * The serializable reporting projection of the Phase 12 semantic registry.
 * Normalizers and renderers do not consume this type; it records their
 * existing result without introducing a second implementation path.
 */
export type YoothemeImportReportEntry = {
  sourceType: string;
  sourceField: string;
  capabilityKey: string;
  capabilityFamily: string;
  status: YoothemeCapabilityStatus;
  semanticMeaning: string;
  canonicalOwner: string | null;
  persistedDestination: string | null;
  inspectorLocation: string | null;
  runtimeConsumer: string | null;
  reason: string;
  futureOwnerOrPhase: string | null;
  fixtureIds: readonly string[];
  /** Evidence metadata does not create a second status vocabulary. */
  evidence: YoothemeCapabilityEvidence;
  occurrences: readonly YoothemeImportReportOccurrence[];
  occurrenceCount: number;
};

export type YoothemeImportReport = {
  entries: readonly YoothemeImportReportEntry[];
  byStatus: Readonly<Record<YoothemeCapabilityStatus, readonly YoothemeImportReportEntry[]>>;
  byCapabilityFamily: Readonly<Record<string, readonly YoothemeImportReportEntry[]>>;
};

type SourceNode = { type?: unknown; props?: unknown; children?: unknown };

const statuses: readonly YoothemeCapabilityStatus[] = [
  "SUPPORTED",
  "DEFERRED",
  "INTENTIONALLY_UNSUPPORTED",
  "UNHANDLED",
  "BLOCKED",
];

const meaningful = (value: unknown) => value !== undefined && value !== null && value !== "";

const sourceTypeForCapability = (sourceType: string) => sourceType.replace(/_item$/, "_item");

function canonicalSourceField(sourceType: string, sourceField: string) {
  if (sourceType === "panel-slider" && /^slider_width_(default|small|medium|large|xlarge)$/.test(sourceField)) return "slider_width";
  return sourceField;
}

function resolveCapability(sourceType: string, sourceField: string, sourceValue?: unknown): YoothemeSemanticCapabilityRecord | undefined {
  const canonicalField = canonicalSourceField(sourceType, sourceField);
  const valueCapability = resolveYoothemeSourceCapability(sourceTypeForCapability(sourceType), canonicalField, sourceValue);
  if (valueCapability) return valueCapability;
  return findYoothemeCapability(`${sourceTypeForCapability(sourceType)}.${canonicalField}`);
}

function unhandledRecord(sourceType: string, sourceField: string): YoothemeSemanticCapabilityRecord {
  return {
    key: `${sourceType}.${sourceField}`,
    sourceType,
    sourceField,
    semanticMeaning: `Unclassified YOOtheme ${sourceType} source field`,
    capabilityFamily: "Unclassified source semantics",
    canonicalOwner: null,
    normalizer: null,
    persistedDestination: null,
    inspectorLocation: null,
    runtimeConsumer: null,
    status: "UNHANDLED",
    statusReason: "No semantic capability registry record exists; this field was not silently discarded from reporting.",
    futureOwnerOrPhase: null,
    fixtureIds: [],
  };
}

function makeEntry(
  record: YoothemeSemanticCapabilityRecord,
  occurrence: YoothemeImportReportOccurrence,
  overrides: Partial<Pick<YoothemeImportReportEntry, "status" | "reason">> = {},
): YoothemeImportReportEntry {
  return {
    sourceType: record.sourceType,
    sourceField: record.sourceField,
    capabilityKey: record.key,
    capabilityFamily: record.capabilityFamily,
    status: overrides.status ?? record.status,
    semanticMeaning: record.semanticMeaning,
    canonicalOwner: record.canonicalOwner,
    persistedDestination: record.persistedDestination,
    inspectorLocation: record.inspectorLocation,
    runtimeConsumer: record.runtimeConsumer,
    reason: overrides.reason ?? record.statusReason,
    futureOwnerOrPhase: record.futureOwnerOrPhase,
    fixtureIds: record.fixtureIds,
    evidence: getYoothemeCapabilityEvidence(record),
    occurrences: [occurrence],
    occurrenceCount: 1,
  };
}

/** Groups repeated source occurrences without hiding different semantics. */
export function groupYoothemeImportReportEntries(
  entries: readonly YoothemeImportReportEntry[],
): YoothemeImportReport {
  const grouped = new Map<string, YoothemeImportReportEntry>();
  for (const entry of entries) {
    const existing = grouped.get(`${entry.status}:${entry.capabilityKey}`);
    if (existing) {
      const occurrences = [...existing.occurrences, ...entry.occurrences];
      grouped.set(`${entry.status}:${entry.capabilityKey}`, { ...existing, occurrences, occurrenceCount: occurrences.length });
    } else {
      grouped.set(`${entry.status}:${entry.capabilityKey}`, entry);
    }
  }
  const normalized = [...grouped.values()].sort((a, b) => a.capabilityFamily.localeCompare(b.capabilityFamily) || a.capabilityKey.localeCompare(b.capabilityKey));
  const byStatus = statuses.reduce<Record<YoothemeCapabilityStatus, readonly YoothemeImportReportEntry[]>>((result, status) => {
    result[status] = normalized.filter((entry) => entry.status === status);
    return result;
  }, {
    SUPPORTED: [],
    DEFERRED: [],
    INTENTIONALLY_UNSUPPORTED: [],
    UNHANDLED: [],
    BLOCKED: [],
  });
  const byCapabilityFamily = normalized.reduce<Record<string, YoothemeImportReportEntry[]>>((families, entry) => {
    (families[entry.capabilityFamily] ??= []).push(entry);
    return families;
  }, {});
  return { entries: normalized, byStatus, byCapabilityFamily };
}

function walkPageSource(
  value: unknown,
  path: string,
  output: YoothemeImportReportEntry[],
): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const node = value as SourceNode;
  const sourceType = typeof node.type === "string" ? node.type : null;
  const props = node.props && typeof node.props === "object" && !Array.isArray(node.props)
    ? node.props as Record<string, unknown>
    : {};
  if (sourceType) {
    for (const [sourceField, sourceValue] of Object.entries(props)) {
      if (!meaningful(sourceValue)) continue;
      const record = resolveCapability(sourceType, sourceField, sourceValue) ?? unhandledRecord(sourceType, sourceField);
      output.push(makeEntry(record, { sourcePath: `${path}.props.${sourceField}`, sourceValue }));
    }
  }
  if (Array.isArray(node.children)) node.children.forEach((child, index) => walkPageSource(child, `${path}.children.${index}`, output));
}

/**
 * Analysis-only page report. The caller's normalizer and legacy warning array
 * remain untouched; Batch 2 exposes the same encountered source fields as a
 * registry-backed structured result.
 */
export function createYoothemePageImportReport(source: unknown): YoothemeImportReport {
  const entries: YoothemeImportReportEntry[] = [];
  walkPageSource(source, "root", entries);
  return groupYoothemeImportReportEntries(entries);
}

export type YoothemeLessReportRow = {
  variable: string;
  source: string;
  rawValue: string;
  resolvedValue?: string;
  status: "mapped" | "unsupported" | "conflict";
  note?: string;
};

/** Same registry/status vocabulary for existing LESS mapping rows. */
export function createYoothemeLessImportReport(rows: readonly YoothemeLessReportRow[]): YoothemeImportReport {
  const entries = rows.map((row) => {
    const sourceField = row.variable.replace(/^@/, "");
    const record = resolveCapability("global-styles", sourceField) ?? unhandledRecord("global-styles", sourceField);
    const blocked = record.status === "SUPPORTED" && row.status === "unsupported";
    return makeEntry(record, {
      sourcePath: `${row.source}:${row.variable}`,
      sourceValue: row.resolvedValue ?? row.rawValue,
    }, blocked ? {
      status: "BLOCKED",
      reason: row.note ?? "The registered Global Styles semantic could not be resolved from this LESS expression.",
    } : row.status === "conflict" ? {
      reason: row.note ?? record.statusReason,
    } : {});
  });
  return groupYoothemeImportReportEntries(entries);
}

/** Readable compatibility bridge for legacy string[] consumers. */
export function formatYoothemeImportWarnings(report: YoothemeImportReport): string[] {
  return report.entries
    .filter((entry) => entry.status !== "SUPPORTED")
    .map((entry) => {
      const count = entry.occurrenceCount > 1 ? ` (${entry.occurrenceCount} occurrences)` : "";
      const location = entry.inspectorLocation ? ` · ${entry.inspectorLocation}` : "";
      const future = entry.futureOwnerOrPhase ? ` · ${entry.futureOwnerOrPhase}` : "";
      return `${entry.status}: ${entry.capabilityKey}${count} — ${entry.reason}${location}${future}`;
    });
}
