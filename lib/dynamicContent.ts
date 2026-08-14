/**
 * Canonical Dynamic Content contracts.
 *
 * Documents describe context and field bindings only. Provider execution and
 * raw API response shapes belong to provider adapters outside this module.
 */

export type DynamicContentScalar = string | number | boolean | null;
export type DynamicContentData =
  | DynamicContentScalar
  | DynamicContentData[]
  | { [key: string]: DynamicContentData };

export type DynamicContentContextDescriptor = {
  provider: string;
  source: string;
  mode: "single" | "collection";
  /** Provider-specific query details remain inert document data. */
  query?: Record<string, DynamicContentData>;
};

export type DynamicContentValueType =
  | "string"
  | "richText"
  | "number"
  | "url"
  | "media"
  | "identifier"
  | "metadata";

export type DynamicMediaValue = {
  url: string;
  id?: string | number;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, DynamicContentData>;
};

export type DynamicContentValueMap = {
  string: string;
  richText: string;
  number: number;
  url: string;
  media: DynamicMediaValue;
  identifier: string | number;
  metadata: Record<string, DynamicContentData>;
};

export type DynamicItemContextValue<
  Type extends DynamicContentValueType = DynamicContentValueType,
> = Type extends DynamicContentValueType
  ? { type: Type; value: DynamicContentValueMap[Type] }
  : never;

/** Provider-independent, path-addressable values produced by an adapter. */
export type DynamicItemContext = {
  id?: string | number;
  fields: Readonly<Record<string, DynamicItemContextValue>>;
};

export type DynamicFieldBinding = {
  /** Path/key in the normalized item context. */
  path: string;
  /** Optional runtime guard for destinations that require a specific type. */
  valueType?: DynamicContentValueType;
  transform?: DynamicFieldTransform;
};

/** Explicit, non-executable transforms supported by the shared resolver. */
export type DynamicFieldTransform = {
  kind: "dateFormat";
  format: string;
};

export const SUPPORTED_DYNAMIC_DATE_FORMATS = ["d F, Y"] as const;

export type DynamicFieldBindings<Field extends string = string> = Partial<
  Record<Field, DynamicFieldBinding>
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isValidValue = <Type extends DynamicContentValueType>(
  type: Type,
  value: unknown,
): value is DynamicContentValueMap[Type] => {
  if (type === "string" || type === "richText" || type === "url") {
    return typeof value === "string";
  }
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "identifier") {
    return (typeof value === "string" && value.length > 0) ||
      (typeof value === "number" && Number.isFinite(value));
  }
  if (type === "metadata") return isRecord(value);
  if (type === "media") {
    return isRecord(value) && typeof value.url === "string" && value.url.length > 0;
  }
  return false;
};

/** Typed retrieval from normalized context; malformed adapter values fail closed. */
export function getDynamicItemContextValue<Type extends DynamicContentValueType>(
  context: DynamicItemContext | null | undefined,
  path: string,
  expectedType: Type,
): DynamicContentValueMap[Type] | undefined {
  const entry = context?.fields[path];
  if (!entry || entry.type !== expectedType || !isValidValue(expectedType, entry.value)) {
    return undefined;
  }
  return entry.value as DynamicContentValueMap[Type];
}

const getBoundValue = (
  context: DynamicItemContext | null | undefined,
  binding: DynamicFieldBinding,
): DynamicContentValueMap[DynamicContentValueType] | undefined => {
  const path = binding.path.trim();
  if (!path) return undefined;
  const entry = context?.fields[path];
  if (!entry) return undefined;
  if (binding.valueType && entry.type !== binding.valueType) return undefined;
  if (!isValidValue(entry.type, entry.value)) return undefined;
  return entry.value;
};

const DATE_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const DATE_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const formatDateValue = (value: string, format: string): string | undefined => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || !SUPPORTED_DYNAMIC_DATE_FORMATS.includes(format as never)) return undefined;
  const tokens: Record<string, string> = {
    d: String(date.getUTCDate()).padStart(2, "0"),
    D: DATE_WEEKDAYS[date.getUTCDay()],
    F: DATE_MONTHS[date.getUTCMonth()],
    j: String(date.getUTCDate()),
    m: String(date.getUTCMonth() + 1).padStart(2, "0"),
    n: String(date.getUTCMonth() + 1),
    Y: String(date.getUTCFullYear()),
    y: String(date.getUTCFullYear()).slice(-2),
  };
  return format.replace(/[dDjFmMnYy]/g, (token) => tokens[token]);
};

const applyDynamicTransform = (
  value: unknown,
  transform: DynamicFieldTransform | undefined,
): unknown => {
  if (!transform) return value;
  if (transform.kind !== "dateFormat" || typeof transform.format !== "string") return undefined;
  return typeof value === "string" ? formatDateValue(value, transform.format) : undefined;
};

/**
 * Resolve dynamic bindings over an authored static item. Missing or invalid
 * values retain the existing destination field as the static fallback.
 */
export function resolveDynamicItem<
  Item extends Record<string, unknown>,
  Field extends Extract<keyof Item, string> = Extract<keyof Item, string>,
>(
  staticItem: Item,
  context: DynamicItemContext | null | undefined,
  bindings: DynamicFieldBindings<Field> | null | undefined,
): Item {
  if (!context || !bindings) return staticItem;

  let resolved: Record<string, unknown> | null = null;
  for (const [destination, binding] of Object.entries(bindings) as Array<
    [Field, DynamicFieldBinding | undefined]
  >) {
    if (!binding) continue;
    const value = applyDynamicTransform(getBoundValue(context, binding), binding.transform);
    if (value === undefined) continue;
    resolved ??= { ...staticItem };
    resolved[destination] = value;
  }

  return (resolved ?? staticItem) as Item;
}
