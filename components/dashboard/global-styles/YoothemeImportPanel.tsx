"use client";

import { unzipSync, strFromU8 } from "fflate";
import { useState } from "react";
import type { BuilderDesign } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveYoothemeLess, YOOTHEME_DEVSTACK_PRESETS, type YoothemeDevstackPresetId, type YoothemeImportRow, type YoothemeLessSource, type YoothemeSemanticPreset } from "@/lib/yoothemeLessImporter";

type Props = {
  design: BuilderDesign;
  shellSettings: BuilderShellSettings;
  updateDesign: (patch: Partial<BuilderDesign>) => void;
  updateShellSettings: (patch: Partial<BuilderShellSettings>) => void;
};

function findZipEntry(files: Record<string, Uint8Array>, suffix: string) {
  const entry = Object.entries(files).find(([name]) => name.endsWith(suffix));
  return entry ? strFromU8(entry[1]) : "";
}

async function readSources(fileList: File[], presetId: YoothemeDevstackPresetId): Promise<YoothemeLessSource[]> {
  if (!fileList?.length) return [];
  const direct = new Map<string, string>();
  let zipFiles: Record<string, Uint8Array> = {};
  for (const file of Array.from(fileList)) {
    if (file.name.toLowerCase().endsWith(".zip")) {
      zipFiles = unzipSync(new Uint8Array(await file.arrayBuffer()));
    } else if (file.name.toLowerCase().endsWith(".less")) {
      direct.set(file.name.toLowerCase(), await file.text());
    }
  }
  const preset = YOOTHEME_DEVSTACK_PRESETS.find((entry) => entry.id === presetId) ?? YOOTHEME_DEVSTACK_PRESETS[2];
  const presetFileName = preset.styleFile.split("/").pop() ?? "light-blue.less";
  const source = (name: string, fallbackSuffix: string) => direct.get(name) ?? findZipEntry(zipFiles, fallbackSuffix);
  const entries = [
    ["master-devstack/_import.less", source("_import.less", "master-devstack/_import.less"), 1],
    [preset.styleFile, source(presetFileName, preset.styleFile), 2],
    ["theme.less", source("theme.less", "yootheme/less/theme.less"), 3],
    ["style.less", source("style.less", "style.less"), 4],
  ] as const;
  return entries.flatMap(([name, content, precedence]) => content ? [{ name, content, precedence }] : []);
}

function StatusBadge({ row }: { row: YoothemeImportRow }) {
  return <span className={`builder-import-status is-${row.status}`}>{row.status}</span>;
}

export default function YoothemeImportPanel({ design, shellSettings, updateDesign, updateShellSettings }: Props) {
  const [preset, setPreset] = useState<YoothemeSemanticPreset | null>(null);
  const [presetId, setPresetId] = useState<YoothemeDevstackPresetId>("devstack-light-blue");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");

  const preview = async (files: File[] | null, selectedPresetId = presetId) => {
    setReading(true);
    setError("");
    try {
      const nextFiles = files ?? [];
      setSelectedFiles(nextFiles);
      const sources = await readSources(nextFiles, selectedPresetId);
      if (sources.length < 2) throw new Error("Select DevStack.zip or the required LESS layers before previewing.");
      setPreset(resolveYoothemeLess(sources, selectedPresetId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to read the LESS layers.");
      setPreset(null);
    } finally {
      setReading(false);
    }
  };

  const changePreset = async (nextPresetId: YoothemeDevstackPresetId) => {
    setPresetId(nextPresetId);
    if (selectedFiles.length) await preview(selectedFiles, nextPresetId);
  };

  const apply = () => {
    if (!preset) return;
    updateShellSettings({
      ...preset.shellSettings,
      globalStylePresetName: preset.name,
      globalStylePresetBackup: {
        design: { ...design },
        shellSettings: { ...shellSettings },
      },
    });
    updateDesign({ ...preset.design, preset: undefined });
  };

  const restore = () => {
    const backup = shellSettings.globalStylePresetBackup;
    if (!backup) return;
    updateDesign((backup.design ?? {}) as Partial<BuilderDesign>);
    const { globalStylePresetBackup: _discard, ...previousShell } = backup.shellSettings ?? {};
    updateShellSettings({ ...previousShell, globalStylePresetName: undefined, globalStylePresetBackup: undefined });
  };

  const rows = preset?.rows ?? [];
  return (
    <div className="builder-global-styles-group" data-testid="yootheme-import-panel">
      <div className="builder-card-title"><strong>YOOtheme Global Style Import</strong><span>semantic preview only</span></div>
      <p className="builder-shell-note">Choose DevStack.zip, or select the LESS layers. Home.json is intentionally not accepted by this importer.</p>
      <label className="builder-field"><span>DevStack style preset</span><select value={presetId} onChange={(event) => void changePreset(event.target.value as YoothemeDevstackPresetId)}>{YOOTHEME_DEVSTACK_PRESETS.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
      <label className="builder-field"><span>DevStack LESS files</span><input type="file" accept=".zip,.less" multiple onChange={(event) => void preview(Array.from(event.target.files ?? []))} /></label>
      {reading ? <p className="builder-shell-note">Resolving variables and LESS color functions…</p> : null}
      {error ? <p className="builder-shell-note" role="alert">{error}</p> : null}
      {preset ? (
        <>
          <div className="builder-card-title"><strong>{preset.name}</strong><span>{preset.sources.length} layers · {rows.length} mapped</span></div>
          <div className="builder-import-summary"><span>{rows.filter((row) => row.status === "mapped").length} mapped and rendered</span><span>{preset.conflicts.length} precedence conflicts</span><span>{preset.unsupported.length} intentionally unsupported/report-only</span></div>
          <div className="builder-import-table-wrap"><table className="builder-import-table"><thead><tr><th>Source variable</th><th>Resolved value</th><th>WebPages destination</th><th>Status</th></tr></thead><tbody>{rows.slice(0, 40).map((row) => <tr key={`${row.source}-${row.variable}`}><td><code>{row.variable}</code><small>{row.source}</small></td><td>{row.resolvedValue}</td><td>{row.destination}</td><td><StatusBadge row={row} /></td></tr>)}</tbody></table></div>
          {preset.unsupported.length > 0 ? <details className="builder-collapse"><summary>Unsupported and report-only variables ({preset.unsupported.length})</summary><div className="builder-import-report-list">{preset.unsupported.slice(0, 80).map((row) => <div key={`${row.source}-${row.variable}`}><code>{row.variable}</code><span>{row.note}</span></div>)}</div></details> : null}
          <button type="button" className="builder-global-preset-apply" onClick={apply}>Apply {preset.name}</button>
          {shellSettings.globalStylePresetBackup ? <><p className="builder-shell-note">A semantic rollback snapshot is retained in the Global Styles document.</p><button type="button" className="builder-secondary-button" onClick={restore}>Restore previous WebPages globals</button></> : null}
        </>
      ) : null}
      {!preset && shellSettings.globalStylePresetBackup ? (
        <div className="builder-import-rollback">
          <p className="builder-shell-note">A semantic rollback snapshot is retained in the Global Styles document.</p>
          <button type="button" className="builder-secondary-button" onClick={restore}>Restore previous WebPages globals</button>
        </div>
      ) : null}
    </div>
  );
}
