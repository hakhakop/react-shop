"use client";

import { Download, FileJson, Power, Upload } from "lucide-react";
import { useState } from "react";
import {
  createYoothemeThemeSettings,
  type BuilderThemeSettings,
} from "@/lib/builderThemeSettings";
import {
  createYoothemeHeaderRecipe,
  type YoothemeHeaderImportMode,
} from "@/lib/yoothemeHeaderRecipe";

type Props = {
  themeSettings: BuilderThemeSettings;
  onImport: (settings: BuilderThemeSettings, headerMode: YoothemeHeaderImportMode) => void | Promise<void>;
  onExport: () => void;
  disabled?: boolean;
  embedded?: boolean;
};

export default function ThemeSettingsPanel({ themeSettings, onImport, onExport, disabled = false, embedded = false }: Props) {
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [headerMode, setHeaderMode] = useState<YoothemeHeaderImportMode>("settings-only");

  const handleFile = async (file?: File) => {
    if (!file) return;
    setReading(true);
    setMessage("");
    setError("");
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const imported = createYoothemeThemeSettings(parsed);
      if (!imported.themeId && !imported.sourceConfig.style) {
        throw new Error("This JSON does not look like a YOOtheme theme export.");
      }
      await onImport(imported, headerMode);
      const recipe = createYoothemeHeaderRecipe(imported);
      setMessage(
        headerMode === "settings-only"
          ? `${imported.displayName} settings imported; Header rows were preserved.`
          : `${imported.displayName} settings imported; ${recipe.report.createdRows} Header rows created.${recipe.report.omitted.length ? ` ${recipe.report.omitted.length} external menu resource${recipe.report.omitted.length === 1 ? "" : "s"} still need linking.` : ""}`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Theme settings import failed.");
    } finally {
      setReading(false);
    }
  };

  const pageCapabilities = themeSettings.capabilities.page.length;
  const headerCapabilities = themeSettings.capabilities.header.length;
  const globalCapabilities = themeSettings.capabilities.global.length;

  const content = (
    <div className="builder-design-editor-fields">
      <div className="builder-theme-settings-intro">
            <FileJson size={22} aria-hidden="true" />
            <div>
              <strong>Two authoritative YOOtheme sources</strong>
              <p>Theme Settings maps Header structure and behavior, while `_import.less` maps the corresponding UIkit presentation tokens. Both resolve into the normal WebPages Header and Global Styles documents.</p>
            </div>
          </div>

          <div className="builder-import-summary" aria-label="Theme settings coverage">
            <span>{pageCapabilities} page semantics</span>
            <span>{headerCapabilities} Header semantics</span>
            <span>{globalCapabilities} global tokens</span>
          </div>

          {themeSettings.active ? (
            <div className="builder-template-note">
              <strong>{themeSettings.displayName}</strong>
              <span>Adapter: {themeSettings.themeId ?? "custom YOOtheme"} · page {themeSettings.page.layout} · Header document and Navbar settings included</span>
            </div>
          ) : (
            <div className="builder-template-note">
              <strong>No provider theme is active</strong>
              <span>Import a full YOOtheme settings JSON to activate its adapter and semantic mapping.</span>
            </div>
          )}

          <label className="builder-field">
            <span>Import YOOtheme theme settings JSON</span>
            <span className="builder-theme-import-modes" role="radiogroup" aria-label="Header import behavior">
              <label>
                <input
                  type="radio"
                  name="header-import-mode"
                  value="settings-only"
                  checked={headerMode === "settings-only"}
                  onChange={() => setHeaderMode("settings-only")}
                />
                <span><strong>Apply settings only</strong><small>Recommended. Keeps every existing Header row, column, and element.</small></span>
              </label>
              <label>
                <input
                  type="radio"
                  name="header-import-mode"
                  value="replace-from-recipe"
                  checked={headerMode === "replace-from-recipe"}
                  onChange={() => setHeaderMode("replace-from-recipe")}
                />
                <span><strong>Create Header from recipe</strong><small>Explicitly replaces Header rows with ordinary Builder rows compiled from YOOtheme positions.</small></span>
              </label>
            </span>
            <span className="builder-file-button">
              <Upload size={14} /> Choose JSON file
              <input
                type="file"
                accept=".json,application/json"
                disabled={disabled || reading}
                onChange={(event) => void handleFile(event.target.files?.[0])}
              />
            </span>
            <small>Use the original YOOtheme Theme Settings export. LESS remains visual-token input; it never owns Header construction.</small>
          </label>

          <button type="button" className="builder-secondary-button" disabled={disabled || !themeSettings.active} onClick={onExport}>
            <Download size={14} /> Export current Theme Settings
          </button>

          {reading ? <p className="builder-shell-note" role="status">Resolving the theme adapter and semantic mappings…</p> : null}
          {message ? <p className="builder-shell-note" role="status">{message}</p> : null}
          {error ? <p className="builder-shell-note" role="alert">{error}</p> : null}
          {themeSettings.unsupported.length > 0 ? (
            <details className="builder-collapse">
              <summary>Preserved but not mapped ({themeSettings.unsupported.length})</summary>
              <div className="builder-import-report-list">
                {themeSettings.unsupported.slice(0, 80).map((item) => <div key={item}><code>{item}</code><span>The source value is retained in the Theme Settings document for a future adapter.</span></div>)}
              </div>
            </details>
          ) : null}
    </div>
  );

  if (embedded) return <div data-testid="theme-settings-panel">{content}</div>;

  return (
    <div className="builder-global-design-editor" data-testid="theme-settings-panel">
      <div className="builder-design-editor-header">
        <div className="builder-design-editor-title">
          <small>PROVIDER DOCUMENT</small>
          <strong>Theme Settings</strong>
        </div>
        <span className={`builder-theme-settings-status${themeSettings.active ? " is-active" : ""}`}>
          <Power size={13} /> {themeSettings.active ? "Active" : "Not active"}
        </span>
      </div>
      <div className="builder-design-editor-body">{content}</div>
    </div>
  );
}
