"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import type { BuilderCustomGlobalStylePreset, BuilderShellSettings } from "@/lib/builderShell";
import {
  RESPONSIVE_BREAKPOINT_KEYS,
  parseResponsiveBreakpoint,
  validateResponsiveBreakpointSettings,
  type ResponsiveBreakpointKey,
} from "@/lib/responsiveBreakpointPolicy";
import { YOOTHEME_DEVSTACK_PRESETS } from "@/lib/yoothemeLessImporter";
import { resolveBundledYoothemeDevstackPreset } from "@/lib/yoothemeDevstackPresets";
import { GLOBAL_STYLE_TOKEN_DEFAULTS } from "@/lib/globalStyleTokens";
import { YoothemeColorPicker, YoothemeFontPicker, YoothemeLessImportModal } from "@/components/dashboard/global-styles/YoothemeStyleControls";

type Props = { shellSettings: BuilderShellSettings; updateShellSettings: (patch: Partial<BuilderShellSettings>) => void };
type Screen = "root" | "global" | "button" | "card" | "heading" | "accordion" | "background" | "base" | "visibility" | "section" | "container" | "grid" | "nav" | "navbar";
type Key = keyof BuilderShellSettings;

const labels: Record<string, string> = {
  small: "Small", default: "Default", medium: "Medium", large: "Large", xlarge: "Xlarge",
  none: "None", xs: "XS", sm: "Small", md: "Medium", lg: "Large", xl: "XL", "2xl": "2XL", "3xl": "3XL",
  primary: "Primary", secondary: "Secondary", text: "Text", muted: "Muted", danger: "Danger", visible: "Visible", hidden: "Hidden",
  natural: "Natural", square: "Square", portrait: "Portrait", cover: "Cover", contain: "Contain", fill: "Fill", lazy: "Lazy", eager: "Eager",
  rounded: "Rounded", circle: "Circle", pill: "Pill", left: "Left", center: "Center", right: "Right",
  chevron: "Chevron", "glass-circle": "Glass circle", "solid-dark": "Solid dark", "minimal-light": "Minimal light", overlay: "Overlay", outer: "Outside", bottom: "Bottom", top: "Top", "bottom-right": "Bottom right", "bottom-left": "Bottom left", "top-right": "Top right", "top-left": "Top left",
  "simple-dots": "Simple dots", "minimal-dots": "Minimal dots", "expanding-pills": "Expanding pills", fraction: "Fraction", progress: "Progress",
};

const supported: { id: Screen; label: string; description: string; enabled?: boolean }[] = [
  { id: "global", label: "Global", description: "Typography, colors, backgrounds, borders, spacing, and breakpoints" },
  { id: "background", label: "Background", description: "Default, muted, primary, and secondary semantic surfaces" },
  { id: "base", label: "Base", description: "Base typography and global rhythm" },
  { id: "visibility", label: "WebPages Visibility", description: "WebPages responsive visibility defaults" },
  { id: "button", label: "Button", description: "UIkit button colors, size, radius, and hover" },
  { id: "card", label: "Card", description: "UIkit card surfaces, variants, padding, and content rhythm" },
  { id: "heading", label: "Heading", description: "Heading scales, family, and weight" },
  { id: "accordion", label: "Accordion", description: "Title, icon, spacing, and row presentation" },
  { id: "nav", label: "Nav", description: "Navigation lists, variants, sublists, subtitles, and dividers" },
  { id: "section", label: "Section", description: "Section paddings, margins, and surface colors" },
  { id: "container", label: "Container", description: "Max widths for small, default, large, and xlarge containers" },
  { id: "grid", label: "Grid", description: "Gutter sizes, column gaps, and divider presentation" },
  { id: "navbar", label: "Navbar", description: "Height, background, and navigation item typography" },
];

const editorSections: Partial<Record<Screen, string[]>> = {
  global: ["Typography", "Primary", "Secondary", "Tertiary", "Colors", "Borders", "Box shadows", "Spacing", "Controls", "Z index", "Breakpoints"],
  button: ["Button", "Default", "Primary", "Secondary", "Danger", "Disabled", "Text", "Link", "Small", "Large"],
  card: ["Card", "Padding", "Hover", "Default", "Primary", "Secondary", "Content rhythm"],
  heading: ["Scale"],
  accordion: ["Title", "Icon and interaction", "Rows"],
  section: ["Padding", "Margin", "Backgrounds"],
  container: ["Container"],
  grid: ["Gutters"],
  nav: ["Sizing", "Default", "Primary", "Secondary", "Sublist and dividers"],
  navbar: ["Surface", "Navigation items", "Item line", "Toggle and subtitle", "Primary and sticky", "Dropdown", "Dropdown nav", "Responsive"],
  background: ["Background"],
  base: ["Base", "Selection", "Inline emphasis"],
  visibility: ["Desktop", "Tablet", "Mobile"],
};

function asString(value: unknown) { return value == null ? "" : String(value); }
function hex(value: unknown) { return /^#[0-9a-f]{6}$/i.test(asString(value)) ? asString(value) : "#000000"; }
function parseLength(value: unknown) {
  const match = asString(value).trim().match(/^(-?[\d.]+)\s*(px|rem|em|%|vh|vw)?$/i);
  return { number: match?.[1] ?? "", unit: match?.[2] ?? (match?.[1] ? "" : "px") };
}

function Select({ label, value, options, onChange, disabled = false }: { label: string; value: unknown; options: string[]; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="builder-design-control"><span>{label}</span><select disabled={disabled} value={asString(value)} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>;
}

function Color({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const current = asString(value);
  return <YoothemeColorPicker label={label} value={current} onChange={onChange} />;
}

function BackgroundPaint({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  return <YoothemeColorPicker label={label} value={asString(value)} onChange={onChange} allowGradient />;
}

function Gradient({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const raw = asString(value);
  const match = raw.match(/linear-gradient\(\s*(-?[\d.]+)deg,\s*([^,]+)\s+50%,\s*([^,]+)(?:\s+80%|\s+100%)?\s*\)/i);
  const angle = match?.[1] ?? "51";
  const first = hex(match?.[2]?.trim());
  const second = hex(match?.[3]?.trim());
  const emit = (nextAngle: string, nextFirst: string, nextSecond: string) => onChange(`linear-gradient(${nextAngle}deg, ${nextFirst} 50%, ${nextSecond} 100%)`);
  return <div className="builder-design-control builder-design-gradient"><span>{label}</span><div><input aria-label={`${label} angle`} type="number" value={angle} onChange={(event) => emit(event.target.value, first, second)} /><YoothemeColorPicker label={`${label} start`} value={first} onChange={(next) => emit(angle, next, second)} /><YoothemeColorPicker label={`${label} end`} value={second} onChange={(next) => emit(angle, first, next)} /></div><div className="builder-design-gradient-preview" style={{ background: raw || `linear-gradient(${angle}deg, ${first}, ${second})` }} /></div>;
}

function Length({ label, value, onChange, units = ["px", "rem", "%"] }: { label: string; value: unknown; onChange: (value: string) => void; units?: string[] }) {
  const parsed = parseLength(value);
  return <div className="builder-design-control builder-design-length"><span>{label}</span><div><input aria-label={`${label} value`} type="number" value={parsed.number} onChange={(event) => onChange(`${event.target.value}${parsed.unit}`)} /><select aria-label={`${label} unit`} value={parsed.unit} onChange={(event) => onChange(`${parsed.number || 0}${event.target.value}`)}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></div></div>;
}

function Breakpoint({ label, value, settings, onChange }: {
  label: string;
  value: unknown;
  settings: Pick<BuilderShellSettings, ResponsiveBreakpointKey>;
  onChange: (value: string) => void;
}) {
  const canonical = asString(value);
  const [raw, setRaw] = useState(canonical.replace(/\s*px\s*$/i, ""));
  const [error, setError] = useState("");
  useEffect(() => setRaw(canonical.replace(/\s*px\s*$/i, "")), [canonical]);

  const commit = (next: string) => {
    const numeric = parseResponsiveBreakpoint(`${next}px`);
    const candidate = { ...settings, [labelToBreakpointKey(label)]: numeric == null ? `${next}px` : `${numeric}px` };
    const validation = validateResponsiveBreakpointSettings(candidate);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    setError("");
    onChange(`${numeric}px`);
  };

  return <label className="builder-design-control builder-design-length">
    <span>{label}</span>
    <div>
      <input
        aria-label={`${label} breakpoint value`}
        aria-invalid={Boolean(error)}
        min="1"
        step="1"
        type="number"
        value={raw}
        onChange={(event) => { const next = event.target.value; setRaw(next); commit(next); }}
        onBlur={() => { if (error) { setRaw(canonical.replace(/\s*px\s*$/i, "")); setError(""); } }}
      />
      <span className="builder-design-static-unit" aria-hidden="true">px</span>
    </div>
    {error ? <small role="alert">{error}</small> : null}
  </label>;
}

function labelToBreakpointKey(label: string): ResponsiveBreakpointKey {
  return `breakpoint${label.replace(/[^a-z]/gi, "")}` as ResponsiveBreakpointKey;
}

type ShadowParts = { x: string; y: string; blur: string; spread: string; color: string; inset: boolean; rest: string };

function splitShadowLayers(value: string) {
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === "(") depth += 1;
    if (value[index] === ")") depth = Math.max(0, depth - 1);
    if (value[index] === "," && depth === 0) {
      layers.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (value.slice(start).trim()) layers.push(value.slice(start).trim());
  return layers;
}

function parseShadow(value: string): ShadowParts {
  const layers = splitShadowLayers(value);
  const match = layers[0]?.match(/^\s*(inset\s+)?(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?\s*(.*)$/i);
  if (!match) return { x: "0", y: "4", blur: "16", spread: "0", color: "rgba(0,0,0,.15)", inset: false, rest: "" };
  return {
    x: match[2],
    y: match[3],
    blur: match[4],
    spread: match[5] ?? "0",
    color: match[6].trim() || "rgba(0,0,0,.15)",
    inset: Boolean(match[1]),
    rest: layers.slice(1).join(", "),
  };
}

function Shadow({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const raw = asString(value);
  const parts = parseShadow(raw);
  const set = (name: keyof ShadowParts, next: string | boolean) => {
    const nextParts = { ...parts, [name]: next };
    const first = `${nextParts.inset ? "inset " : ""}${nextParts.x}px ${nextParts.y}px ${nextParts.blur}px ${nextParts.spread}px ${nextParts.color}`;
    onChange(nextParts.rest ? `${first}, ${nextParts.rest}` : first);
  };
  return <details className="builder-design-control builder-design-shadow">
    <summary className="builder-design-shadow-summary"><span>{label}</span><span className="builder-design-shadow-swatch" aria-label={`${label} preview`} style={{ boxShadow: raw || "0 4px 16px rgba(0,0,0,.15)" }} /></summary>
    <div className="builder-design-shadow-popover">
      <div className="builder-design-shadow-fields">
        <label><span>X</span><input aria-label={`${label} x`} type="number" value={parts.x} onChange={(event) => set("x", event.target.value)} /></label>
        <label><span>Y</span><input aria-label={`${label} y`} type="number" value={parts.y} onChange={(event) => set("y", event.target.value)} /></label>
        <label><span>BLUR</span><input aria-label={`${label} blur`} type="number" value={parts.blur} onChange={(event) => set("blur", event.target.value)} /></label>
        <label><span>SPREAD</span><input aria-label={`${label} spread`} type="number" value={parts.spread} onChange={(event) => set("spread", event.target.value)} /></label>
        <label className="builder-design-shadow-inset"><span>INSET</span><input aria-label={`${label} inset`} type="checkbox" checked={parts.inset} onChange={(event) => set("inset", event.target.checked)} /></label>
      </div>
      <YoothemeColorPicker label={`${label} color`} value={parts.color} onChange={(next) => set("color", next)} />
      <div className="builder-design-shadow-preview" style={{ boxShadow: raw || "0 4px 16px rgba(0,0,0,.15)" }} />
    </div>
  </details>;
}

function Group({ title, children }: { title: string; children: ReactNode }) { return <section id={`design-group-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="builder-design-group"><h3>{title}</h3><div className="builder-design-grid">{children}</div></section>; }

export default function CanonicalGlobalStylesPanel({ shellSettings, updateShellSettings }: Props) {
  const [screen, setScreen] = useState<Screen>("root");
  const [navQuery, setNavQuery] = useState("");
  const [draft, setDraft] = useState<BuilderShellSettings>(shellSettings);
  const legacyPresetAliases: Record<string, string> = {
    DevStack: "DevStack Light Blue",
    Default: "DevStack Light Blue",
    Dark: "DevStack Dark Purple",
    Soft: "DevStack Light Orange",
  };
  const [snapshot, setSnapshot] = useState<BuilderShellSettings>(shellSettings);
  const [isLessModalOpen, setIsLessModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [customPresetName, setCustomPresetName] = useState("");
  useEffect(() => {
    setDraft(shellSettings);
    if (screen === "root") setSnapshot(shellSettings);
  }, [screen, shellSettings]);

  const open = (next: Screen) => { setDraft({ ...shellSettings }); setSnapshot({ ...shellSettings }); setScreen(next); };
  const set = (key: Key, value: string) => { const next = { ...draft, [key]: value }; setDraft(next); updateShellSettings({ [key]: value }); };
  const applyDevstackPreset = (presetName: string) => {
    const preset = YOOTHEME_DEVSTACK_PRESETS.find((item) => item.name === presetName);
    if (!preset) return;
    const resolved = resolveBundledYoothemeDevstackPreset(preset.id);
    const patch: Partial<BuilderShellSettings> = {
      ...resolved.shellSettings,
      // Presets are replacements for the previous semantic theme. Clear
      // size-specific radii that the prior theme may have authored so the
      // active preset can inherit its own main button radius immediately.
      buttonSmallRadius: resolved.shellSettings.buttonSmallRadius,
      buttonLargeRadius: resolved.shellSettings.buttonLargeRadius,
      globalStylePresetName: preset.name,
    };
    setDraft({ ...draft, ...patch });
    updateShellSettings(patch);
  };
  const applyCustomPreset = (preset: BuilderCustomGlobalStylePreset) => {
    const patch: Partial<BuilderShellSettings> = { ...preset.shellSettings as Partial<BuilderShellSettings>, globalStylePresetName: preset.name };
    setDraft((current) => ({ ...current, ...patch }));
    updateShellSettings(patch);
    setIsPresetModalOpen(false);
  };
  const saveCurrentPreset = () => {
    const name = customPresetName.trim();
    if (!name) return;
    const { customGlobalStylePresets: _presets, globalStylePresetBackup: _backup, ...currentStyle } = draft;
    const savedPreset: BuilderCustomGlobalStylePreset = {
      id: `yootheme-less-${Date.now()}`,
      name,
      shellSettings: currentStyle as Record<string, unknown>,
      source: "yootheme-less",
      createdAt: new Date().toISOString(),
    };
    const existing = shellSettings.customGlobalStylePresets ?? [];
    const customGlobalStylePresets = [...existing.filter((entry) => entry.name.toLocaleLowerCase() !== name.toLocaleLowerCase()), savedPreset];
    setDraft((current) => ({ ...current, customGlobalStylePresets }));
    updateShellSettings({ customGlobalStylePresets });
    setCustomPresetName("");
    setIsSavePresetOpen(false);
  };
  const deleteCustomPreset = (id: string) => {
    const customGlobalStylePresets = (shellSettings.customGlobalStylePresets ?? []).filter((preset) => preset.id !== id);
    setDraft((current) => ({ ...current, customGlobalStylePresets }));
    updateShellSettings({ customGlobalStylePresets });
  };
  const setVisibility = (key: "visibilityDesktop" | "visibilityTablet" | "visibilityMobile", value: boolean) => { const next = { ...draft, [key]: value }; setDraft(next); updateShellSettings({ [key]: value }); };
  const cancel = () => { setDraft(snapshot); updateShellSettings(snapshot); setScreen("root"); };
  const save = () => { setSnapshot(draft); setScreen("root"); };
  const generalItems = supported.filter((item) => item.id === "global");
  const componentOrder: Screen[] = ["accordion", "background", "base", "button", "card", "container", "grid", "heading", "nav", "navbar", "section", "visibility"];
  const componentItems = componentOrder.map((id) => supported.find((item) => item.id === id)).filter((item): item is typeof supported[number] => Boolean(item));
  const matchesNav = (item: { label: string; description: string }) => {
    const query = navQuery.trim().toLowerCase();
    return !query || `${item.label} ${item.description}`.toLowerCase().includes(query);
  };

  if (screen !== "root") {
    return <div className="builder-global-design-editor" data-testid={`global-editor-${screen}`}>
      <div className="builder-design-editor-header"><button type="button" className="builder-design-back" onClick={cancel}>← <span>Back</span></button><div className="builder-design-editor-title"><small>STYLE / COMPONENT</small><strong>{supported.find((item) => item.id === screen)?.label ?? "Global"}</strong></div><div className="builder-design-editor-actions"><button type="button" onClick={cancel}>Cancel</button><button type="button" className="is-primary" onClick={save}>Save</button></div></div>
      <div className="builder-design-inheritance-banner" data-token-inheritance="global-component-local"><strong>Appearance ownership</strong><span>Global Style → Component Default → Current Element Override</span><small>These controls define the global layer. Element inspectors only override values intentionally owned by that instance.</small></div>
      <div className="builder-design-editor-body">
        <div className="builder-design-in-page-index" aria-label="Editor sections"><span>Sections</span>{(editorSections[screen] ?? []).map((label) => <a key={label} href={`#design-group-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{label}</a>)}</div>
        <div className="builder-design-editor-fields">
          {screen === "global" && <GlobalEditor draft={draft} set={set} />}
          {screen === "button" && <SemanticButtonEditor draft={draft} set={set} />}
          {screen === "card" && <CardEditor draft={draft} set={set} />}
          {screen === "heading" && <HeadingEditor draft={draft} set={set} />}
          {screen === "background" && <SemanticBackgroundEditor draft={draft} set={set} />}
          {screen === "base" && <><Group title="Base"><Length label="Base font size" value={draft.baseFontSize} onChange={(value) => set("baseFontSize", value)} /><Length label="Base line height" value={draft.baseLineHeight} onChange={(value) => set("baseLineHeight", value)} units={["", "px", "rem"]} /><Select label="Font weight" value={draft.headingFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("headingFontWeight", value)} /></Group><Group title="Selection"><Color label="Selection background" value={draft.selectionBackground} onChange={(value) => set("selectionBackground", value)} /><Color label="Selection text" value={draft.selectionColor} onChange={(value) => set("selectionColor", value)} /></Group><Group title="Inline emphasis"><Color label="Inserted background" value={draft.baseInsBackground} onChange={(value) => set("baseInsBackground", value)} /><Color label="Inserted text" value={draft.baseInsColor} onChange={(value) => set("baseInsColor", value)} /><Color label="Marked background" value={draft.baseMarkBackground} onChange={(value) => set("baseMarkBackground", value)} /><Color label="Marked text" value={draft.baseMarkColor} onChange={(value) => set("baseMarkColor", value)} /></Group></>}
          {screen === "visibility" && <VisibilityEditor draft={draft} setVisibility={setVisibility} />}
          {screen === "accordion" && <AccordionEditor draft={draft} set={set} />}
          {screen === "section" && <SectionGlobalEditor draft={draft} set={set} />}
          {screen === "container" && <ContainerGlobalEditor draft={draft} set={set} />}
          {screen === "grid" && <GridGlobalEditor draft={draft} set={set} />}
          {screen === "nav" && <NavGlobalEditor draft={draft} set={set} />}
          {screen === "navbar" && <NavbarGlobalEditor draft={draft} set={set} />}
        </div>
      </div>
    </div>;
  }

  return <div className="builder-global-design-root" data-testid="global-design-root">
    <div className="builder-design-root-heading"><div><small>DESIGN SYSTEM</small><span>STYLE</span></div><p>WebPages semantic design system</p></div>
    
    <div style={{ padding: "0 16px 12px 16px" }}>
      <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--builder-ui-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Theme Preset</label>
      <button type="button" onClick={() => setIsPresetModalOpen(true)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--builder-ui-border)", fontSize: "13px", fontWeight: 600, backgroundColor: "var(--builder-ui-panel-solid)", color: "var(--builder-ui-text)", textAlign: "left", cursor: "pointer" }}>{legacyPresetAliases[draft.globalStylePresetName ?? ""] ?? draft.globalStylePresetName ?? "Choose theme preset"}</button>
    </div>

    <div className="builder-design-inheritance-banner" data-token-inheritance="global-component-local"><strong>Canonical token source</strong><span>Global Style → Component Default → Current Element Override</span><small>Builder and published frontend consume the same generated UIkit variables.</small></div>
    <label className="builder-design-nav-search"><Search size={16} aria-hidden="true" /><input value={navQuery} onChange={(event) => setNavQuery(event.target.value)} placeholder="Search styles and components" aria-label="Search styles and components" /></label>
    <div className="builder-design-root-layout is-preview-off"><nav className="builder-design-nav">
      <div className="builder-design-nav-section"><h3>General <small>{generalItems.length}</small></h3>{generalItems.filter(matchesNav).map((item, index) => <NavItem key={`${item.label}-${index}`} item={item} onClick={open} />)}</div>
      <div className="builder-design-nav-section"><h3>Components <small>{componentItems.filter(matchesNav).length}</small></h3>{componentItems.filter(matchesNav).map((item) => <NavItem key={item.id} item={item} onClick={open} />)}</div>
    </nav></div>

    {/* YOOtheme Master Action Buttons */}
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--builder-ui-border)", marginTop: "16px" }}>
      <button
        type="button"
        onClick={() => {
          updateShellSettings(draft);
        }}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "var(--builder-ui-accent)", color: "#ffffff", fontWeight: 700, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}
      >
        RECOMPILE STYLE
      </button>
      <button
        type="button"
        onClick={() => setIsLessModalOpen(true)}
        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--builder-ui-accent)", backgroundColor: "transparent", color: "var(--builder-ui-accent)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}
      >
        IMPORT YOOTHEME LESS
      </button>
      <button type="button" onClick={() => setIsSavePresetOpen(true)} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--builder-ui-border-strong)", backgroundColor: "transparent", color: "var(--builder-ui-text)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}>SAVE CURRENT AS PRESET</button>
      <button
        type="button"
        onClick={() => {
          const resetPatch: Partial<BuilderShellSettings> = { ...GLOBAL_STYLE_TOKEN_DEFAULTS };
          setDraft({ ...draft, ...resetPatch });
          updateShellSettings(resetPatch);
        }}
        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--builder-ui-border)", backgroundColor: "transparent", color: "var(--builder-ui-muted)", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}
      >
        RESET TO DEFAULTS
      </button>
    </div>

    <YoothemeLessImportModal
      isOpen={isLessModalOpen}
      onClose={() => setIsLessModalOpen(false)}
      onImport={(importedPatch) => {
        const containsBreakpoint = RESPONSIVE_BREAKPOINT_KEYS.some((key) => key in importedPatch);
        const next = { ...draft, ...importedPatch };
        const breakpointValidation = validateResponsiveBreakpointSettings(next);
        if (containsBreakpoint && !breakpointValidation.valid) {
          return `YOOtheme breakpoint import rejected: ${breakpointValidation.message}`;
        }
        setDraft(next);
        updateShellSettings(importedPatch);
      }}
    />
    <ThemePresetModal isOpen={isPresetModalOpen} onClose={() => setIsPresetModalOpen(false)} builtIns={YOOTHEME_DEVSTACK_PRESETS.map((preset) => ({ name: preset.name, colors: presetColors(preset.id) }))} customPresets={shellSettings.customGlobalStylePresets ?? []} onApplyBuiltIn={(name) => { applyDevstackPreset(name); setIsPresetModalOpen(false); }} onApplyCustom={applyCustomPreset} onDeleteCustom={deleteCustomPreset} />
    <SavePresetModal isOpen={isSavePresetOpen} name={customPresetName} onNameChange={setCustomPresetName} onClose={() => setIsSavePresetOpen(false)} onSave={saveCurrentPreset} />
  </div>;
}

function presetColors(id: string) {
  const settings = resolveBundledYoothemeDevstackPreset(id as Parameters<typeof resolveBundledYoothemeDevstackPreset>[0]).shellSettings;
  return [settings.backgroundColor, settings.primaryColor, settings.textColor].filter((color): color is string => typeof color === "string" && color.length > 0);
}

function ThemePresetModal({ isOpen, onClose, builtIns, customPresets, onApplyBuiltIn, onApplyCustom, onDeleteCustom }: { isOpen: boolean; onClose: () => void; builtIns: { name: string; colors: string[] }[]; customPresets: BuilderCustomGlobalStylePreset[]; onApplyBuiltIn: (name: string) => void; onApplyCustom: (preset: BuilderCustomGlobalStylePreset) => void; onDeleteCustom: (id: string) => void }) {
  if (!isOpen) return null;
  return createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 999999, background: "rgba(2,6,23,.76)", padding: "24px", overflowY: "auto" }}><div style={{ width: "min(860px, 100%)", margin: "40px auto", padding: "20px", borderRadius: "14px", background: "#0f172a", color: "#f8fafc", border: "1px solid #334155" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}><div><strong>Theme presets</strong><p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "12px" }}>Choose a built-in YOOtheme mapping or a saved custom preset.</p></div><button type="button" onClick={onClose} style={{ border: 0, background: "transparent", color: "#cbd5e1", cursor: "pointer" }}>Close</button></div><PresetCards title="YOOtheme presets" entries={builtIns} onApply={(name) => onApplyBuiltIn(name)} />{customPresets.length > 0 ? <PresetCards title="Custom presets" entries={customPresets.map((preset) => ({ name: preset.name, colors: [preset.shellSettings.backgroundColor, preset.shellSettings.primaryColor, preset.shellSettings.textColor].filter((color): color is string => typeof color === "string") }))} onApply={(name) => { const preset = customPresets.find((entry) => entry.name === name); if (preset) onApplyCustom(preset); }} onDelete={(name) => { const preset = customPresets.find((entry) => entry.name === name); if (preset) onDeleteCustom(preset.id); }} /> : null}</div></div>, document.body);
}

function PresetCards({ title, entries, onApply, onDelete }: { title: string; entries: { name: string; colors: string[] }[]; onApply: (name: string) => void; onDelete?: (name: string) => void }) { return <section style={{ marginTop: "18px" }}><h3 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: ".08em", color: "#94a3b8" }}>{title}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>{entries.map((entry) => <div key={entry.name} style={{ border: "1px solid #334155", borderRadius: "10px", overflow: "hidden", background: "#172033" }}><button type="button" onClick={() => onApply(entry.name)} style={{ display: "block", width: "100%", border: 0, padding: "0", background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer" }}><div style={{ display: "flex", height: "82px" }}>{(entry.colors.length ? entry.colors : ["#334155"]).map((color, index) => <span key={`${color}-${index}`} style={{ flex: 1, background: color }} />)}</div><strong style={{ display: "block", padding: "10px 10px 4px", fontSize: "13px" }}>{entry.name}</strong><span style={{ display: "block", padding: "0 10px 10px", color: "#94a3b8", fontSize: "11px" }}>Apply preset</span></button>{onDelete ? <button type="button" onClick={() => onDelete(entry.name)} style={{ width: "calc(100% - 20px)", margin: "0 10px 10px", border: "1px solid #7f1d1d", borderRadius: "6px", background: "transparent", color: "#fca5a5", padding: "6px", fontSize: "11px", cursor: "pointer" }}>Delete</button> : null}</div>)}</div></section>; }

function SavePresetModal({ isOpen, name, onNameChange, onClose, onSave }: { isOpen: boolean; name: string; onNameChange: (name: string) => void; onClose: () => void; onSave: () => void }) { if (!isOpen) return null; return createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 1000000, background: "rgba(2,6,23,.76)", display: "grid", placeItems: "center", padding: "24px" }}><div style={{ width: "min(420px, 100%)", padding: "20px", borderRadius: "14px", background: "#0f172a", color: "#f8fafc", border: "1px solid #334155" }}><strong>Save current theme preset</strong><p style={{ margin: "6px 0 14px", color: "#94a3b8", fontSize: "12px" }}>This saves the current Global Styles values, including the imported LESS mapping.</p><input autoFocus value={name} onChange={(event) => onNameChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onSave(); }} placeholder="Preset name" style={{ boxSizing: "border-box", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#f8fafc" }} /><div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}><button type="button" onClick={onClose}>Cancel</button><button type="button" disabled={!name.trim()} onClick={onSave}>Save preset</button></div></div></div>, document.body); }

function NavItem({ item, onClick }: { item: { id: Screen; label: string; description: string; enabled?: boolean }; onClick: (screen: Screen) => void }) { return <button type="button" className={`builder-design-nav-item${item.enabled === false ? " is-disabled" : ""}`} disabled={item.enabled === false} onClick={() => onClick(item.id)}><strong>{item.label}</strong><span>{item.description}</span></button>; }

function GlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <>
  <Group title="Typography"><YoothemeFontPicker label="Base font family" value={draft.fontFamilyBody ?? "Manrope"} onChange={(value) => set("fontFamilyBody", value)} /><Length label="Base font size" value={draft.baseFontSize} onChange={(value) => set("baseFontSize", value)} /><Length label="Base line height" value={draft.baseLineHeight} onChange={(value) => set("baseLineHeight", value)} units={["", "px", "rem"]} />{([["fontSizeSmall", "Small"], ["fontSizeMedium", "Medium"], ["fontSizeLarge", "Large"], ["fontSizeXLarge", "Xlarge"], ["fontSize2XLarge", "2xlarge"]] as [Key, string][]).map(([key, label]) => <Length key={key} label={`${label} size`} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>
  <TypographyRoleGroup title="Primary" prefix="Primary" draft={draft} set={set} />
  <TypographyRoleGroup title="Secondary" prefix="Secondary" draft={draft} set={set} />
  <TypographyRoleGroup title="Tertiary" prefix="Tertiary" draft={draft} set={set} />
  <ColorGroup draft={draft} set={set} /><BorderGroup draft={draft} set={set} /><ShadowGroup draft={draft} set={set} /><ShellSpacingGroup draft={draft} set={set} /><SpacingGroup draft={draft} set={set} /><ControlGroup draft={draft} set={set} /><InfrastructureGroup draft={draft} set={set} /></>; }

function TypographyRoleGroup({ title, prefix, draft, set }: { title: string; prefix: "Primary" | "Secondary" | "Tertiary"; draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const family = `fontFamily${prefix}` as Key, style = `fontStyle${prefix}` as Key, weight = `fontWeight${prefix}` as Key, spacing = `letterSpacing${prefix}` as Key, transform = `textTransform${prefix}` as Key;
  return <Group title={title}><YoothemeFontPicker label="Font family" value={asString(draft[family] ?? "inherit")} onChange={(value) => set(family, value)} /><Select label="Font style" value={draft[style]} options={["inherit", "normal", "italic"]} onChange={(value) => set(style, value)} /><Select label="Font weight" value={draft[weight]} options={["inherit", "400", "500", "600", "700", "800"]} onChange={(value) => set(weight, value)} /><Length label="Letter spacing" value={draft[spacing]} onChange={(value) => set(spacing, value)} units={["", "px", "em"]} /><Select label="Text transform" value={draft[transform]} options={["inherit", "none", "uppercase", "lowercase", "capitalize"]} onChange={(value) => set(transform, value)} /></Group>;
}

function ColorGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Colors">{([["textColor", "Text"], ["emphasisColor", "Emphasis"], ["inverseColor", "Inverse"], ["mutedTextColor", "Muted text"], ["linkColor", "Link"], ["linkHoverColor", "Link hover"], ["successColor", "Success"], ["warningColor", "Warning"], ["dangerColor", "Danger"]] as [Key, string][]).map(([key, label]) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>; }
function BorderGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Borders"><Color label="Color" value={draft.borderColor} onChange={(value) => set("borderColor", value)} /><Length label="Radius" value={draft.borderRadius} onChange={(value) => set("borderRadius", value)} /><Length label="Width" value={draft.borderWidth} onChange={(value) => set("borderWidth", value)} /></Group>; }
function ShadowGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Box shadows">{([["shadowSmall", "Small"], ["shadowMedium", "Medium"], ["shadowLarge", "Large"], ["shadowXLarge", "Xlarge"]] as [Key, string][]).map(([key, label]) => <Shadow key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>; }
function ShellSpacingGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const fields: [Key, string][] = [
    ["sectionPaddingTop", "Section padding top"], ["sectionPaddingBottom", "Section padding bottom"],
    ["sectionMarginTop", "Section margin top"], ["sectionMarginBottom", "Section margin bottom"],
    ["rowPaddingTop", "Row padding top"], ["rowPaddingBottom", "Row padding bottom"],
    ["rowMarginTop", "Row margin top"], ["rowMarginBottom", "Row margin bottom"],
    ["rowGap", "Row gap"], ["columnGap", "Column gap"],
    ["elementPaddingTop", "Element padding top"], ["elementPaddingRight", "Element padding right"],
    ["elementPaddingBottom", "Element padding bottom"], ["elementPaddingLeft", "Element padding left"],
    ["elementMarginTop", "Element margin top"], ["elementMarginRight", "Element margin right"],
    ["elementMarginBottom", "Element margin bottom"], ["elementMarginLeft", "Element margin left"],
  ];
  const options = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
  return <Group title="Layout defaults">{fields.map(([key, label]) => <Select key={key} label={label} value={draft[key]} options={options} onChange={(value) => set(key, value)} />)}</Group>;
}
function SpacingGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Spacing">{([["marginSmall", "Small margin"], ["marginDefault", "Default margin"], ["marginMedium", "Medium margin"], ["marginLarge", "Large margin"], ["marginXLarge", "Xlarge margin"], ["gridGutterSmall", "Small gutter"], ["gridGutterDefault", "Default gutter"], ["gridGutterMedium", "Medium gutter"], ["gridGutterLarge", "Large gutter"]] as [Key, string][]).map(([key, label]) => <Length key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>; }
function ControlGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Controls"><Length label="Small height" value={draft.controlHeightSmall} onChange={(value) => set("controlHeightSmall", value)} /><Length label="Default height" value={draft.controlHeightDefault} onChange={(value) => set("controlHeightDefault", value)} /><Length label="Large height" value={draft.controlHeightLarge} onChange={(value) => set("controlHeightLarge", value)} /></Group>; }
function InfrastructureGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const breakpointSettings = Object.fromEntries(RESPONSIVE_BREAKPOINT_KEYS.map((key) => [key, draft[key]])) as Pick<BuilderShellSettings, ResponsiveBreakpointKey>;
  return <>
    <Group title="Z index"><Length label="Z index" value={draft.globalZIndex} onChange={(value) => set("globalZIndex", value)} units={[""]} /></Group>
    <Group title="Breakpoints">
      <div className="builder-import-readonly"><strong>Global responsive tiers</strong><span>These editable UIkit/YOOtheme thresholds are inherited by responsive capability selections. Runtime adoption remains Phase 10 Batch 2.</span></div>
      <Breakpoint label="Small" value={draft.breakpointSmall} settings={breakpointSettings} onChange={(value) => set("breakpointSmall", value)} />
      <Breakpoint label="Medium" value={draft.breakpointMedium} settings={breakpointSettings} onChange={(value) => set("breakpointMedium", value)} />
      <Breakpoint label="Large" value={draft.breakpointLarge} settings={breakpointSettings} onChange={(value) => set("breakpointLarge", value)} />
      <Breakpoint label="XLarge" value={draft.breakpointXLarge} settings={breakpointSettings} onChange={(value) => set("breakpointXLarge", value)} />
    </Group>
  </>;
}
function ContainerGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Containers">{([["containerSmall", "Small"], ["containerDefault", "Default"], ["containerLarge", "Large"], ["containerXLarge", "Xlarge"], ["pageContainerMaxWidth", "Page max width"]] as [Key, string][]).map(([key, label]) => <Length key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>; }

function ButtonEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <><Group title="Appearance"><Color label="Primary background" value={draft.buttonPrimaryBackground} onChange={(value) => set("buttonPrimaryBackground", value)} /><Color label="Primary text" value={draft.buttonPrimaryText} onChange={(value) => set("buttonPrimaryText", value)} /><Color label="Default background" value={draft.buttonDefaultBackground} onChange={(value) => set("buttonDefaultBackground", value)} /><Color label="Default text" value={draft.buttonDefaultText} onChange={(value) => set("buttonDefaultText", value)} /><Color label="Secondary background" value={draft.buttonSecondaryBackground} onChange={(value) => set("buttonSecondaryBackground", value)} /><Color label="Secondary text" value={draft.buttonSecondaryText} onChange={(value) => set("buttonSecondaryText", value)} /><Color label="Primary hover background" value={draft.buttonHoverBg} onChange={(value) => set("buttonHoverBg", value)} /><Color label="Primary hover text" value={draft.buttonHoverTextColor} onChange={(value) => set("buttonHoverTextColor", value)} /><Color label="Default hover background" value={draft.buttonDefaultHoverBackground} onChange={(value) => set("buttonDefaultHoverBackground", value)} /><Color label="Default hover text" value={draft.buttonDefaultHoverText} onChange={(value) => set("buttonDefaultHoverText", value)} /><Color label="Secondary hover background" value={draft.buttonSecondaryHoverBackground} onChange={(value) => set("buttonSecondaryHoverBackground", value)} /><Color label="Secondary hover text" value={draft.buttonSecondaryHoverText} onChange={(value) => set("buttonSecondaryHoverText", value)} /><Color label="Text hover" value={draft.buttonTextHoverColor} onChange={(value) => set("buttonTextHoverColor", value)} /><Color label="Primary gradient" value={draft.buttonPrimaryGradient} onChange={(value) => set("buttonPrimaryGradient", value)} /></Group><Group title="Typography"><Length label="Default font size" value={draft.buttonFontSize} onChange={(value) => set("buttonFontSize", value)} /><Length label="Large font size" value={draft.buttonLargeFontSize} onChange={(value) => set("buttonLargeFontSize", value)} /><Length label="Letter spacing" value={draft.buttonLetterSpacing} onChange={(value) => set("buttonLetterSpacing", value)} /><Select label="Font family" value={draft.fontFamilyBody} options={["inherit", "Manrope", "Inter", "system-ui"]} onChange={(value) => set("fontFamilyBody", value)} /><Select label="Weight" value={draft.headingFontWeight} options={["400", "500", "600", "700"]} onChange={(value) => set("headingFontWeight", value)} /></Group><Group title="Sizing"><Length label="Small height" value={draft.controlHeightSmall} onChange={(value) => set("controlHeightSmall", value)} /><Length label="Default height" value={draft.buttonHeight} onChange={(value) => set("buttonHeight", value)} /><Length label="Large height" value={draft.controlHeightLarge} onChange={(value) => set("controlHeightLarge", value)} /><Length label="Horizontal padding" value={draft.buttonPaddingX} onChange={(value) => set("buttonPaddingX", value)} /><Length label="Radius" value={draft.buttonRadius} onChange={(value) => set("buttonRadius", value)} /><Length label="Border width" value={draft.buttonBorderWidth} onChange={(value) => set("buttonBorderWidth", value)} /><Length label="Transition" value={draft.buttonTransitionDuration} onChange={(value) => set("buttonTransitionDuration", value)} units={["s", "ms"]} /></Group><Group title="Elevation"><Shadow label="Default shadow" value={draft.buttonDefaultShadow} onChange={(value) => set("buttonDefaultShadow", value)} /><Shadow label="Default hover shadow" value={draft.buttonDefaultHoverShadow} onChange={(value) => set("buttonDefaultHoverShadow", value)} /><Shadow label="Primary shadow" value={draft.buttonPrimaryShadow} onChange={(value) => set("buttonPrimaryShadow", value)} /><Shadow label="Primary hover shadow" value={draft.buttonPrimaryHoverShadow} onChange={(value) => set("buttonPrimaryHoverShadow", value)} /></Group></>; }
function SemanticButtonEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const color = (key: Key, label: string) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />;
  const paint = (key: Key, label: string) => <BackgroundPaint key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />;
  const shadow = (key: Key, label: string) => <Shadow key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />;
  return <>
    <Group title="Button"><Select label="Font family" value={draft.buttonFontFamily} options={["inherit", "Manrope", "Inter", "system-ui"]} onChange={(value) => set("buttonFontFamily", value)} /><Select label="Font style" value={draft.buttonFontStyle} options={["normal", "italic"]} onChange={(value) => set("buttonFontStyle", value)} /><Select label="Font weight" value={draft.buttonFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("buttonFontWeight", value)} /><Length label="Font size" value={draft.buttonFontSize} onChange={(value) => set("buttonFontSize", value)} /><Length label="Line height" value={draft.buttonLineHeight} onChange={(value) => set("buttonLineHeight", value)} units={["", "px", "rem"]} /><Length label="Letter spacing" value={draft.buttonLetterSpacing} onChange={(value) => set("buttonLetterSpacing", value)} /><Select label="Text transform" value={draft.buttonTextTransform} options={["none", "uppercase", "lowercase", "capitalize"]} onChange={(value) => set("buttonTextTransform", value)} /><Length label="Border radius" value={draft.buttonRadius} onChange={(value) => set("buttonRadius", value)} /><Length label="Border width" value={draft.buttonBorderWidth} onChange={(value) => set("buttonBorderWidth", value)} /><Select label="Border mode" value={draft.buttonBorderMode} options={["solid", "dashed", "dotted"]} onChange={(value) => set("buttonBorderMode", value)} /><Length label="Horizontal padding" value={draft.buttonPaddingX} onChange={(value) => set("buttonPaddingX", value)} /><Length label="Background size" value={draft.buttonBackgroundSize} onChange={(value) => set("buttonBackgroundSize", value)} units={["%", "px"]} /><Length label="Background position" value={draft.buttonBackgroundPosition} onChange={(value) => set("buttonBackgroundPosition", value)} units={["%", "px"]} /><Length label="Hover background position" value={draft.buttonHoverBackgroundPosition} onChange={(value) => set("buttonHoverBackgroundPosition", value)} units={["%", "px"]} /><Length label="Transition duration" value={draft.buttonTransitionDuration} onChange={(value) => set("buttonTransitionDuration", value)} units={["s", "ms"]} /></Group>
    <Group title="Default">{paint("buttonDefaultBackground", "Background")}{color("buttonDefaultText", "Color")}{color("buttonDefaultBorder", "Border")}{shadow("buttonDefaultShadow", "Box shadow")}{paint("buttonDefaultHoverBackground", "Hover background")}{color("buttonDefaultHoverText", "Hover color")}{color("buttonDefaultHoverBorder", "Hover border")}{shadow("buttonDefaultHoverShadow", "Hover box shadow")}{paint("buttonDefaultActiveBackground", "Active background")}{color("buttonDefaultActiveText", "Active color")}{color("buttonDefaultActiveBorder", "Border")}{shadow("buttonDefaultActiveShadow", "Active box shadow")}</Group>
    <Group title="Primary">{paint("buttonPrimaryBackground", "Background")}{color("buttonPrimaryText", "Color")}{shadow("buttonPrimaryShadow", "Box shadow")}{paint("buttonHoverBg", "Hover background")}{color("buttonPrimaryHoverText", "Hover color")}{color("buttonPrimaryHoverBorder", "Hover border")}{shadow("buttonPrimaryHoverShadow", "Hover box shadow")}{paint("buttonPrimaryActiveBackground", "Active background")}{color("buttonPrimaryActiveText", "Active color")}{color("buttonPrimaryActiveBorder", "Active border")}{shadow("buttonPrimaryActiveShadow", "Active box shadow")}</Group>
    <Group title="Secondary">{paint("buttonSecondaryBackground", "Background")}{color("buttonSecondaryText", "Color")}{color("buttonSecondaryBorder", "Border")}{shadow("buttonSecondaryShadow", "Box shadow")}{paint("buttonSecondaryHoverBackground", "Hover background")}{color("buttonSecondaryHoverText", "Hover color")}{color("buttonSecondaryHoverBorder", "Hover border")}{shadow("buttonSecondaryHoverShadow", "Hover box shadow")}{paint("buttonSecondaryActiveBackground", "Active background")}{color("buttonSecondaryActiveText", "Color")}{color("buttonSecondaryActiveBorder", "Border")}{shadow("buttonSecondaryActiveShadow", "Active box shadow")}</Group>
    <Group title="Danger">{paint("buttonDangerBackground", "Background")}{color("buttonDangerText", "Color")}{color("buttonDangerBorder", "Border")}{paint("buttonDangerHoverBackground", "Hover background")}{color("buttonDangerHoverText", "Hover color")}{color("buttonDangerHoverBorder", "Hover border")}{shadow("buttonDangerHoverShadow", "Hover box shadow")}{paint("buttonDangerActiveBackground", "Active background")}{color("buttonDangerActiveText", "Color")}{color("buttonDangerActiveBorder", "Active border")}{shadow("buttonDangerActiveShadow", "Active box shadow")}</Group>
    <Group title="Disabled">{paint("buttonDisabledBackground", "Background")}{color("buttonDisabledText", "Color")}{color("buttonDisabledBorder", "Border")}</Group>
    <Group title="Text">{color("buttonTextColorSemantic", "Color")}{paint("buttonTextBackground", "Background")}{color("buttonTextBorder", "Border")}{color("buttonTextHoverColor", "Hover color")}{color("buttonTextHoverBorder", "Hover border")}{color("buttonTextActiveColor", "Active color")}</Group>
    <Group title="Link">{color("buttonLinkColor", "Color")}{color("buttonLinkHoverColor", "Hover color")}</Group>
    <Group title="Small"><Length label="Font size" value={draft.buttonSmallFontSize} onChange={(value) => set("buttonSmallFontSize", value)} /><Length label="Line height" value={draft.buttonSmallLineHeight} onChange={(value) => set("buttonSmallLineHeight", value)} /><Length label="Horizontal padding" value={draft.buttonSmallPaddingX} onChange={(value) => set("buttonSmallPaddingX", value)} /><Length label="Border radius" value={draft.buttonSmallRadius} onChange={(value) => set("buttonSmallRadius", value)} /></Group>
    <Group title="Large"><Length label="Font size" value={draft.buttonLargeFontSize} onChange={(value) => set("buttonLargeFontSize", value)} /><Length label="Line height" value={draft.buttonLargeLineHeight} onChange={(value) => set("buttonLargeLineHeight", value)} /><Length label="Horizontal padding" value={draft.buttonLargePaddingX} onChange={(value) => set("buttonLargePaddingX", value)} /><Length label="Border radius" value={draft.buttonLargeRadius} onChange={(value) => set("buttonLargeRadius", value)} /></Group>
  </>;
}

function LegacyButtonGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const fields: [Key, string][] = [["buttonDefaultBackground", "Default background"], ["buttonDefaultText", "Default text"], ["buttonDefaultHoverBackground", "Default hover background"], ["buttonDefaultHoverText", "Default hover text"], ["buttonDefaultBorder", "Default border"], ["buttonDefaultHoverBorder", "Default hover border"], ["buttonDefaultActiveBackground", "Default active background"], ["buttonDefaultActiveText", "Default active text"], ["buttonDefaultActiveBorder", "Default active border"], ["buttonPrimaryBackground", "Primary background"], ["buttonPrimaryText", "Primary text"], ["buttonPrimaryHoverText", "Primary hover text"], ["buttonPrimaryActiveBackground", "Primary active background"], ["buttonPrimaryActiveText", "Primary active text"], ["buttonPrimaryActiveBorder", "Primary active border"], ["buttonSecondaryBackground", "Secondary background"], ["buttonSecondaryText", "Secondary text"], ["buttonSecondaryHoverBackground", "Secondary hover background"], ["buttonSecondaryHoverText", "Secondary hover text"], ["buttonSecondaryBorder", "Secondary border"], ["buttonSecondaryHoverBorder", "Secondary hover border"], ["buttonSecondaryActiveBackground", "Secondary active background"], ["buttonSecondaryActiveText", "Secondary active text"], ["buttonSecondaryActiveBorder", "Secondary active border"], ["buttonDangerBackground", "Danger background"], ["buttonDangerText", "Danger text"], ["buttonDangerHoverBackground", "Danger hover background"], ["buttonDangerHoverText", "Danger hover text"], ["buttonDangerBorder", "Danger border"], ["buttonDangerHoverBorder", "Danger hover border"], ["buttonDangerActiveBackground", "Danger active background"], ["buttonDangerActiveText", "Danger active text"], ["buttonDangerActiveBorder", "Danger active border"], ["buttonDisabledBackground", "Disabled background"], ["buttonDisabledText", "Disabled text"], ["buttonTextColorSemantic", "Text color"], ["buttonTextHoverColor", "Text hover color"], ["buttonTextHoverBorder", "Text hover border"], ["buttonLinkColor", "Link color"], ["buttonLinkHoverColor", "Link hover color"]];
  return <><Group title="Shared geometry and typography"><Select label="Font family" value={draft.buttonFontFamily} options={["inherit", "Manrope", "Inter", "system-ui"]} onChange={(value) => set("buttonFontFamily", value)} /><Select label="Font style" value={draft.buttonFontStyle} options={["normal", "italic"]} onChange={(value) => set("buttonFontStyle", value)} /><Select label="Font weight" value={draft.buttonFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("buttonFontWeight", value)} /><Select label="Text transform" value={draft.buttonTextTransform} options={["none", "uppercase", "lowercase", "capitalize"]} onChange={(value) => set("buttonTextTransform", value)} /><Length label="Font size" value={draft.buttonFontSize} onChange={(value) => set("buttonFontSize", value)} /><Length label="Line height" value={draft.buttonLineHeight} onChange={(value) => set("buttonLineHeight", value)} units={["", "px", "rem"]} /><Length label="Letter spacing" value={draft.buttonLetterSpacing} onChange={(value) => set("buttonLetterSpacing", value)} /><Select label="Border mode" value={draft.buttonBorderMode} options={["solid", "dashed", "dotted"]} onChange={(value) => set("buttonBorderMode", value)} /><Length label="Border radius" value={draft.buttonRadius} onChange={(value) => set("buttonRadius", value)} /><Length label="Border width" value={draft.buttonBorderWidth} onChange={(value) => set("buttonBorderWidth", value)} /><Length label="Transition duration" value={draft.buttonTransitionDuration} onChange={(value) => set("buttonTransitionDuration", value)} units={["s", "ms"]} /><Length label="Horizontal padding" value={draft.buttonPaddingX} onChange={(value) => set("buttonPaddingX", value)} /><Length label="Background size" value={draft.buttonBackgroundSize} onChange={(value) => set("buttonBackgroundSize", value)} units={["%", "px"]} /><Length label="Background position" value={draft.buttonBackgroundPosition} onChange={(value) => set("buttonBackgroundPosition", value)} units={["%", "px"]} /><Length label="Hover background position" value={draft.buttonHoverBackgroundPosition} onChange={(value) => set("buttonHoverBackgroundPosition", value)} units={["%", "px"]} /><Select label="Backdrop filter" value={draft.buttonBackdropFilter} options={["none", "blur(8px)", "blur(16px)"]} onChange={(value) => set("buttonBackdropFilter", value)} /></Group><Group title="Small size"><Length label="Small font size" value={draft.buttonSmallFontSize} onChange={(value) => set("buttonSmallFontSize", value)} /><Length label="Small line height" value={draft.buttonSmallLineHeight} onChange={(value) => set("buttonSmallLineHeight", value)} /><Length label="Small control height" value={draft.controlHeightSmall} onChange={(value) => set("controlHeightSmall", value)} /><Length label="Small padding" value={draft.buttonSmallPaddingX} onChange={(value) => set("buttonSmallPaddingX", value)} /><Length label="Small radius" value={draft.buttonSmallRadius} onChange={(value) => set("buttonSmallRadius", value)} /></Group><Group title="Large size"><Length label="Large font size" value={draft.buttonLargeFontSize} onChange={(value) => set("buttonLargeFontSize", value)} /><Length label="Large line height" value={draft.buttonLargeLineHeight} onChange={(value) => set("buttonLargeLineHeight", value)} /><Length label="Large control height" value={draft.controlHeightLarge} onChange={(value) => set("controlHeightLarge", value)} /><Length label="Large padding" value={draft.buttonLargePaddingX} onChange={(value) => set("buttonLargePaddingX", value)} /><Length label="Large radius" value={draft.buttonLargeRadius} onChange={(value) => set("buttonLargeRadius", value)} /></Group><Group title="Variant colors and borders">{fields.map(([key, label]) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group><Group title="Gradients"><Gradient label="Primary" value={draft.buttonPrimaryGradient} onChange={(value) => set("buttonPrimaryGradient", value)} /><Gradient label="Primary hover" value={draft.buttonPrimaryHoverGradient} onChange={(value) => set("buttonPrimaryHoverGradient", value)} /><Gradient label="Primary active" value={draft.buttonPrimaryActiveGradient} onChange={(value) => set("buttonPrimaryActiveGradient", value)} /><Gradient label="Secondary hover" value={draft.buttonSecondaryHoverGradient} onChange={(value) => set("buttonSecondaryHoverGradient", value)} /><Gradient label="Secondary active" value={draft.buttonSecondaryActiveGradient} onChange={(value) => set("buttonSecondaryActiveGradient", value)} /></Group><Group title="Shadows"><Shadow label="Default" value={draft.buttonDefaultShadow} onChange={(value) => set("buttonDefaultShadow", value)} /><Shadow label="Default hover" value={draft.buttonDefaultHoverShadow} onChange={(value) => set("buttonDefaultHoverShadow", value)} /><Shadow label="Default active" value={draft.buttonDefaultActiveShadow} onChange={(value) => set("buttonDefaultActiveShadow", value)} /><Shadow label="Primary" value={draft.buttonPrimaryShadow} onChange={(value) => set("buttonPrimaryShadow", value)} /><Shadow label="Primary hover" value={draft.buttonPrimaryHoverShadow} onChange={(value) => set("buttonPrimaryHoverShadow", value)} /><Shadow label="Primary active" value={draft.buttonPrimaryActiveShadow} onChange={(value) => set("buttonPrimaryActiveShadow", value)} /><Shadow label="Secondary" value={draft.buttonSecondaryShadow} onChange={(value) => set("buttonSecondaryShadow", value)} /><Shadow label="Secondary hover" value={draft.buttonSecondaryHoverShadow} onChange={(value) => set("buttonSecondaryHoverShadow", value)} /><Shadow label="Secondary active" value={draft.buttonSecondaryActiveShadow} onChange={(value) => set("buttonSecondaryActiveShadow", value)} /><Shadow label="Danger hover" value={draft.buttonDangerHoverShadow} onChange={(value) => set("buttonDangerHoverShadow", value)} /><Shadow label="Danger active" value={draft.buttonDangerActiveShadow} onChange={(value) => set("buttonDangerActiveShadow", value)} /></Group></>;
}

function CardEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  return <>
    <Group title="Card"><Length label="Border width" value={draft.cardBorderWidth} onChange={(value) => set("cardBorderWidth", value)} /><Length label="Border radius" value={draft.cardBorderRadius} onChange={(value) => set("cardBorderRadius", value)} /><Length label="Transition duration" value={draft.cardTransitionDuration} onChange={(value) => set("cardTransitionDuration", value)} units={["s", "ms"]} /></Group>
    <Group title="Padding"><Length label="Small" value={draft.cardPaddingSmall} onChange={(value) => set("cardPaddingSmall", value)} /><Length label="Default" value={draft.cardPaddingDefault} onChange={(value) => set("cardPaddingDefault", value)} /><Length label="Large" value={draft.cardPaddingLarge} onChange={(value) => set("cardPaddingLarge", value)} /></Group>
    <Group title="Hover"><Shadow label="Box shadow" value={draft.cardHoverShadow} onChange={(value) => set("cardHoverShadow", value)} /></Group>
    <Group title="Default"><BackgroundPaint label="Background" value={draft.cardBackground} onChange={(value) => set("cardBackground", value)} /><Color label="Text" value={draft.cardDefaultText} onChange={(value) => set("cardDefaultText", value)} /><Color label="Title" value={draft.cardDefaultTitle} onChange={(value) => set("cardDefaultTitle", value)} /><Color label="Border" value={draft.cardDefaultBorder} onChange={(value) => set("cardDefaultBorder", value)} /><Shadow label="Box shadow" value={draft.cardShadow} onChange={(value) => set("cardShadow", value)} /><BackgroundPaint label="Hover background" value={draft.cardDefaultHoverBackground} onChange={(value) => set("cardDefaultHoverBackground", value)} /><Color label="Hover text" value={draft.cardDefaultHoverText} onChange={(value) => set("cardDefaultHoverText", value)} /><Color label="Hover title" value={draft.cardDefaultHoverTitle} onChange={(value) => set("cardDefaultHoverTitle", value)} /><Color label="Hover border" value={draft.cardDefaultHoverBorder} onChange={(value) => set("cardDefaultHoverBorder", value)} /><Shadow label="Hover box shadow" value={draft.cardShadowHover} onChange={(value) => set("cardShadowHover", value)} /></Group>
    <Group title="Primary"><BackgroundPaint label="Background" value={draft.cardPrimaryBackground} onChange={(value) => set("cardPrimaryBackground", value)} /><Color label="Text" value={draft.cardPrimaryText} onChange={(value) => set("cardPrimaryText", value)} /><Color label="Title" value={draft.cardPrimaryTitle} onChange={(value) => set("cardPrimaryTitle", value)} /><Color label="Border" value={draft.cardPrimaryBorder} onChange={(value) => set("cardPrimaryBorder", value)} /><Shadow label="Box shadow" value={draft.cardPrimaryShadow} onChange={(value) => set("cardPrimaryShadow", value)} /><BackgroundPaint label="Hover background" value={draft.cardPrimaryHoverBackground} onChange={(value) => set("cardPrimaryHoverBackground", value)} /><Color label="Hover text" value={draft.cardPrimaryHoverText} onChange={(value) => set("cardPrimaryHoverText", value)} /><Color label="Hover title" value={draft.cardPrimaryHoverTitle} onChange={(value) => set("cardPrimaryHoverTitle", value)} /><Color label="Hover border" value={draft.cardPrimaryHoverBorder} onChange={(value) => set("cardPrimaryHoverBorder", value)} /><Shadow label="Hover box shadow" value={draft.cardPrimaryHoverShadow} onChange={(value) => set("cardPrimaryHoverShadow", value)} /></Group>
    <Group title="Secondary"><BackgroundPaint label="Background" value={draft.cardSecondaryBackground} onChange={(value) => set("cardSecondaryBackground", value)} /><Color label="Text" value={draft.cardSecondaryText} onChange={(value) => set("cardSecondaryText", value)} /><Color label="Title" value={draft.cardSecondaryTitle} onChange={(value) => set("cardSecondaryTitle", value)} /><Color label="Border" value={draft.cardSecondaryBorder} onChange={(value) => set("cardSecondaryBorder", value)} /><Shadow label="Box shadow" value={draft.cardSecondaryShadow} onChange={(value) => set("cardSecondaryShadow", value)} /><BackgroundPaint label="Hover background" value={draft.cardSecondaryHoverBackground} onChange={(value) => set("cardSecondaryHoverBackground", value)} /><Color label="Hover text" value={draft.cardSecondaryHoverText} onChange={(value) => set("cardSecondaryHoverText", value)} /><Color label="Hover title" value={draft.cardSecondaryHoverTitle} onChange={(value) => set("cardSecondaryHoverTitle", value)} /><Color label="Hover border" value={draft.cardSecondaryHoverBorder} onChange={(value) => set("cardSecondaryHoverBorder", value)} /><Shadow label="Hover box shadow" value={draft.cardSecondaryHoverShadow} onChange={(value) => set("cardSecondaryHoverShadow", value)} /></Group>
    <Group title="Content rhythm"><Length label="Image to body spacing" value={draft.cardImageBodySpacing} onChange={(value) => set("cardImageBodySpacing", value)} /><Length label="Title spacing" value={draft.cardTitleSpacing} onChange={(value) => set("cardTitleSpacing", value)} /><Length label="Meta spacing" value={draft.cardMetaSpacing} onChange={(value) => set("cardMetaSpacing", value)} /><Length label="Header spacing" value={draft.cardHeaderSpacing} onChange={(value) => set("cardHeaderSpacing", value)} /><Length label="Footer spacing" value={draft.cardFooterSpacing} onChange={(value) => set("cardFooterSpacing", value)} /></Group>
  </>;
}
function HeadingEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <><Group title="Scale"><Select label="Font family" value={draft.fontFamilyHeading} options={["inherit", "Manrope", "Inter", "Georgia"]} onChange={(value) => set("fontFamilyHeading", value)} /><Select label="Weight" value={draft.headingFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("headingFontWeight", value)} /><Select label="Small weight" value={draft.headingSmallFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("headingSmallFontWeight", value)} /><Select label="Medium weight" value={draft.headingMediumFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("headingMediumFontWeight", value)} />{([["headingSmallFontSize", "Small"], ["headingMediumFontSize", "Medium"], ["headingLargeFontSize", "Large"], ["headingXLargeFontSize", "Xlarge"], ["headingSmallFontSizeResponsive", "Small responsive"], ["headingMediumFontSizeResponsive", "Medium responsive"]] as [Key, string][]).map(([key, label]) => <Length key={key} label={`${label} size`} value={draft[key]} onChange={(value) => set(key, value)} />)}<Length label="Medium line height" value={draft.headingMediumLineHeight} onChange={(value) => set("headingMediumLineHeight", value)} units={["", "px"]} /></Group></>; }
function VisibilityEditor({ draft, setVisibility }: { draft: BuilderShellSettings; setVisibility: (key: "visibilityDesktop" | "visibilityTablet" | "visibilityMobile", value: boolean) => void }) {
  const fields: ["visibilityDesktop" | "visibilityTablet" | "visibilityMobile", string][] = [
    ["visibilityDesktop", "Desktop"],
    ["visibilityTablet", "Tablet"],
    ["visibilityMobile", "Mobile"],
  ];
  return <Group title="Global defaults"><div className="builder-import-readonly"><strong>Inherited by sections and content elements</strong><span>Elements remain inherited until their local inspector explicitly selects Visible or Hidden.</span></div>{fields.map(([key, label]) => <label key={key} className="builder-design-control builder-design-checkbox"><span>{label}</span><input aria-label={`${label} visibility default`} type="checkbox" checked={draft[key] !== false} onChange={(event) => setVisibility(key, event.target.checked)} /><small>{draft[key] === false ? "Hidden" : "Visible"}</small></label>)}</Group>;
}
function AccordionEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <><Group title="Title"><Length label="Font size" value={draft.accordionTitleFontSize} onChange={(value) => set("accordionTitleFontSize", value)} /><Select label="Weight" value={draft.accordionTitleFontWeight} options={["400", "500", "600", "700"]} onChange={(value) => set("accordionTitleFontWeight", value)} /><Length label="Letter spacing" value={draft.accordionTitleLetterSpacing} onChange={(value) => set("accordionTitleLetterSpacing", value)} /></Group><Group title="Icon and interaction"><Color label="Icon color" value={draft.accordionIconColor} onChange={(value) => set("accordionIconColor", value)} /><Color label="Hover color" value={draft.accordionTitleHoverColor} onChange={(value) => set("accordionTitleHoverColor", value)} /><Length label="Title vertical padding" value={draft.accordionTitlePaddingVertical} onChange={(value) => set("accordionTitlePaddingVertical", value)} /><Length label="Content top spacing" value={draft.accordionContentMarginTop} onChange={(value) => set("accordionContentMarginTop", value)} /></Group><Group title="Rows"><Length label="Border width" value={draft.accordionItemBorderWidth} onChange={(value) => set("accordionItemBorderWidth", value)} /><Color label="Border color" value={draft.accordionItemBorder} onChange={(value) => set("accordionItemBorder", value)} /><Shadow label="Row shadow" value={draft.accordionItemBoxShadow} onChange={(value) => set("accordionItemBoxShadow", value)} /></Group></>; }
function SemanticBackgroundEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Background"><BackgroundPaint label="Default background" value={draft.backgroundDefault} onChange={(value) => set("backgroundDefault", value)} /><BackgroundPaint label="Muted background" value={draft.backgroundMuted} onChange={(value) => set("backgroundMuted", value)} /><BackgroundPaint label="Primary background" value={draft.backgroundPrimary} onChange={(value) => set("backgroundPrimary", value)} /><BackgroundPaint label="Secondary background" value={draft.backgroundSecondary} onChange={(value) => set("backgroundSecondary", value)} /></Group>; }
function SectionGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <><Group title="Padding"><Length label="Xsmall padding" value={draft.sectionPaddingXSmall} onChange={(value) => set("sectionPaddingXSmall", value)} /><Length label="Small padding" value={draft.sectionPaddingSmall} onChange={(value) => set("sectionPaddingSmall", value)} /><Length label="Default padding" value={draft.sectionPaddingDefault} onChange={(value) => set("sectionPaddingDefault", value)} /><Length label="Medium padding" value={draft.sectionPaddingMedium} onChange={(value) => set("sectionPaddingMedium", value)} /><Length label="Large padding" value={draft.sectionPaddingLarge} onChange={(value) => set("sectionPaddingLarge", value)} /><Length label="Xlarge padding" value={draft.sectionPaddingXLarge} onChange={(value) => set("sectionPaddingXLarge", value)} /></Group><SemanticBackgroundEditor draft={draft} set={set} /></>; }
function ContainerGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Container"><Length label="Default max width" value={draft.containerDefault} onChange={(value) => set("containerDefault", value)} /><Length label="Padding horizontal" value={draft.containerPaddingHorizontal} onChange={(value) => set("containerPaddingHorizontal", value)} /><Length label="@s padding horizontal" value={draft.containerPaddingHorizontalSmall} onChange={(value) => set("containerPaddingHorizontalSmall", value)} /><Length label="@m padding horizontal" value={draft.containerPaddingHorizontalMedium} onChange={(value) => set("containerPaddingHorizontalMedium", value)} /><Length label="Xsmall max width" value={draft.containerXSmall} onChange={(value) => set("containerXSmall", value)} /><Length label="Small max width" value={draft.containerSmall} onChange={(value) => set("containerSmall", value)} /><Length label="Large max width" value={draft.containerLarge} onChange={(value) => set("containerLarge", value)} /><Length label="Xlarge max width" value={draft.containerXLarge} onChange={(value) => set("containerXLarge", value)} /><Length label="Page max width" value={draft.pageContainerMaxWidth} onChange={(value) => set("pageContainerMaxWidth", value)} /></Group>; }
function GridGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Gutters"><Length label="Small gutter" value={draft.gridGutterSmall} onChange={(value) => set("gridGutterSmall", value)} /><Length label="Default gutter" value={draft.gridGutterDefault} onChange={(value) => set("gridGutterDefault", value)} /><Length label="Medium gutter" value={draft.gridGutterMedium} onChange={(value) => set("gridGutterMedium", value)} /><Length label="Large gutter" value={draft.gridGutterLarge} onChange={(value) => set("gridGutterLarge", value)} /></Group>; }
function NavGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  return <>
    <Group title="Sizing"><Length label="Default font size" value={draft.navDefaultFontSize} onChange={(value) => set("navDefaultFontSize", value)} /><Length label="Medium line height" value={draft.navMediumLineHeight} onChange={(value) => set("navMediumLineHeight", value)} /><Length label="Medium font size @L" value={draft.navMediumFontSizeResponsive} onChange={(value) => set("navMediumFontSizeResponsive", value)} /></Group>
    <Group title="Default"><Color label="Item" value={draft.navDefaultItemColor} onChange={(value) => set("navDefaultItemColor", value)} /><Color label="Item hover" value={draft.navDefaultItemHoverColor} onChange={(value) => set("navDefaultItemHoverColor", value)} /><Color label="Item active" value={draft.navDefaultItemActiveColor} onChange={(value) => set("navDefaultItemActiveColor", value)} /><Length label="Subtitle font size" value={draft.navDefaultSubtitleFontSize} onChange={(value) => set("navDefaultSubtitleFontSize", value)} /><Color label="Subtitle" value={draft.navDefaultSubtitleColor} onChange={(value) => set("navDefaultSubtitleColor", value)} /><Select label="Subtitle weight" value={draft.navDefaultSubtitleFontWeight} options={["inherit", "normal", "400", "500", "600", "700"]} onChange={(value) => set("navDefaultSubtitleFontWeight", value)} /><Color label="Header" value={draft.navDefaultHeaderColor} onChange={(value) => set("navDefaultHeaderColor", value)} /><Color label="Sublist item hover" value={draft.navDefaultSublistItemHoverColor} onChange={(value) => set("navDefaultSublistItemHoverColor", value)} /><Color label="Sublist item active" value={draft.navDefaultSublistItemActiveColor} onChange={(value) => set("navDefaultSublistItemActiveColor", value)} /><Shadow label="Divider shadow" value={draft.navDefaultDividerBoxShadow} onChange={(value) => set("navDefaultDividerBoxShadow", value)} /></Group>
    <Group title="Primary"><Color label="Item" value={draft.navPrimaryItemColor} onChange={(value) => set("navPrimaryItemColor", value)} /><Color label="Item hover" value={draft.navPrimaryItemHoverColor} onChange={(value) => set("navPrimaryItemHoverColor", value)} /><Color label="Item active" value={draft.navPrimaryItemActiveColor} onChange={(value) => set("navPrimaryItemActiveColor", value)} /><Length label="Subtitle font size" value={draft.navPrimarySubtitleFontSize} onChange={(value) => set("navPrimarySubtitleFontSize", value)} /><Color label="Subtitle" value={draft.navPrimarySubtitleColor} onChange={(value) => set("navPrimarySubtitleColor", value)} /><Select label="Subtitle weight" value={draft.navPrimarySubtitleFontWeight} options={["inherit", "normal", "400", "500", "600", "700"]} onChange={(value) => set("navPrimarySubtitleFontWeight", value)} /><Color label="Header" value={draft.navPrimaryHeaderColor} onChange={(value) => set("navPrimaryHeaderColor", value)} /><Color label="Sublist item hover" value={draft.navPrimarySublistItemHoverColor} onChange={(value) => set("navPrimarySublistItemHoverColor", value)} /><Color label="Sublist item active" value={draft.navPrimarySublistItemActiveColor} onChange={(value) => set("navPrimarySublistItemActiveColor", value)} /><Shadow label="Divider shadow" value={draft.navPrimaryDividerBoxShadow} onChange={(value) => set("navPrimaryDividerBoxShadow", value)} /></Group>
    <Group title="Secondary"><Length label="Line height" value={draft.navSecondaryLineHeight} onChange={(value) => set("navSecondaryLineHeight", value)} units={["", "px", "rem"]} /><Length label="Margin top" value={draft.navSecondaryMarginTop} onChange={(value) => set("navSecondaryMarginTop", value)} /><Length label="Item padding vertical" value={draft.navSecondaryItemPaddingVertical} onChange={(value) => set("navSecondaryItemPaddingVertical", value)} /><Length label="Item padding horizontal" value={draft.navSecondaryItemPaddingHorizontal} onChange={(value) => set("navSecondaryItemPaddingHorizontal", value)} /><Length label="Sublist font size" value={draft.navSecondarySublistFontSize} onChange={(value) => set("navSecondarySublistFontSize", value)} /><Length label="Item radius" value={draft.navSecondaryItemBorderRadius} onChange={(value) => set("navSecondaryItemBorderRadius", value)} /><Color label="Item hover" value={draft.navSecondaryItemHoverColor} onChange={(value) => set("navSecondaryItemHoverColor", value)} /><Color label="Item active" value={draft.navSecondaryItemActiveColor} onChange={(value) => set("navSecondaryItemActiveColor", value)} /><BackgroundPaint label="Item hover background" value={draft.navSecondaryItemHoverBackground} onChange={(value) => set("navSecondaryItemHoverBackground", value)} /><BackgroundPaint label="Item active background" value={draft.navSecondaryItemActiveBackground} onChange={(value) => set("navSecondaryItemActiveBackground", value)} /><Select label="Subtitle weight" value={draft.navSecondarySubtitleFontWeight} options={["inherit", "normal", "400", "500", "600", "700"]} onChange={(value) => set("navSecondarySubtitleFontWeight", value)} /><Color label="Subtitle active" value={draft.navSecondarySubtitleActiveColor} onChange={(value) => set("navSecondarySubtitleActiveColor", value)} /></Group>
    <Group title="Sublist and dividers"><Length label="Divider margin top" value={draft.navDividersMarginTop} onChange={(value) => set("navDividersMarginTop", value)} /><Length label="Divider margin vertical" value={draft.navDividerMarginVertical} onChange={(value) => set("navDividerMarginVertical", value)} /><Shadow label="Dividers shadow" value={draft.navDividersBoxShadow} onChange={(value) => set("navDividersBoxShadow", value)} /></Group>
  </>;
}

function NavbarGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  return <>
    <Group title="Surface"><BackgroundPaint label="Background" value={draft.navbarBackground} onChange={(value) => set("navbarBackground", value)} /><Select label="Backdrop filter" value={draft.navbarBackdropFilter} options={["none", "blur(5px)", "blur(8px)", "blur(16px)"]} onChange={(value) => set("navbarBackdropFilter", value)} /><Select label="Border mode" value={draft.navbarMode} options={["none", "border"]} onChange={(value) => set("navbarMode", value)} /><Length label="Border width" value={draft.navbarBorderWidth} onChange={(value) => set("navbarBorderWidth", value)} /><Color label="Border" value={draft.navbarBorder} onChange={(value) => set("navbarBorder", value)} /><Length label="Dropdown radius" value={draft.navbarDropdownBorderRadius} onChange={(value) => set("navbarDropdownBorderRadius", value)} /><Shadow label="Dropdown shadow" value={draft.navbarDropdownBoxShadow} onChange={(value) => set("navbarDropdownBoxShadow", value)} /></Group>
    <Group title="Navigation items"><Length label="Gap" value={draft.navbarNavGap} onChange={(value) => set("navbarNavGap", value)} /><Length label="Gap @M" value={draft.navbarNavGapMedium} onChange={(value) => set("navbarNavGapMedium", value)} /><Length label="Item height" value={draft.navbarNavItemHeight} onChange={(value) => set("navbarNavItemHeight", value)} /><Length label="Item padding horizontal" value={draft.navbarNavItemPaddingHorizontal} onChange={(value) => set("navbarNavItemPaddingHorizontal", value)} /><Length label="Item padding horizontal @M" value={draft.navbarNavItemPaddingHorizontalMedium} onChange={(value) => set("navbarNavItemPaddingHorizontalMedium", value)} /><Length label="Item font size" value={draft.navbarNavItemFontSize} onChange={(value) => set("navbarNavItemFontSize", value)} /><Color label="Item" value={draft.navbarNavItemColor} onChange={(value) => set("navbarNavItemColor", value)} /><Color label="Item hover" value={draft.navbarNavItemHoverColor} onChange={(value) => set("navbarNavItemHoverColor", value)} /><Color label="Item onclick" value={draft.navbarNavItemOnclickColor} onChange={(value) => set("navbarNavItemOnclickColor", value)} /><Color label="Item active" value={draft.navbarNavItemActiveColor} onChange={(value) => set("navbarNavItemActiveColor", value)} /><Select label="Text transform" value={draft.navbarNavItemTextTransform} options={["none", "uppercase", "lowercase", "capitalize", "inherit"]} onChange={(value) => set("navbarNavItemTextTransform", value)} /></Group>
    <Group title="Item line"><Select label="Mode" value={draft.navbarNavItemLineMode} options={["false", "true"]} onChange={(value) => set("navbarNavItemLineMode", value)} /><Select label="Position" value={draft.navbarNavItemLinePositionMode} options={["top", "bottom", "left", "right"]} onChange={(value) => set("navbarNavItemLinePositionMode", value)} /><Select label="Slide" value={draft.navbarNavItemLineSlideMode} options={["center", "left", "right"]} onChange={(value) => set("navbarNavItemLineSlideMode", value)} /><Length label="Height" value={draft.navbarNavItemLineHeight} onChange={(value) => set("navbarNavItemLineHeight", value)} /><Length label="Hover height" value={draft.navbarNavItemLineHoverHeight} onChange={(value) => set("navbarNavItemLineHoverHeight", value)} /><Length label="Onclick height" value={draft.navbarNavItemLineOnclickHeight} onChange={(value) => set("navbarNavItemLineOnclickHeight", value)} /><Length label="Active height" value={draft.navbarNavItemLineActiveHeight} onChange={(value) => set("navbarNavItemLineActiveHeight", value)} /><Length label="Transition duration" value={draft.navbarNavItemLineTransitionDuration} onChange={(value) => set("navbarNavItemLineTransitionDuration", value)} units={["s", "ms"]} /><Length label="Opacity" value={draft.navbarNavItemLineOpacity} onChange={(value) => set("navbarNavItemLineOpacity", value)} units={["", "%"]} /><BackgroundPaint label="Line gradient" value={draft.navbarNavItemLineGradient} onChange={(value) => set("navbarNavItemLineGradient", value)} /></Group>
    <Group title="Toggle and subtitle"><Color label="Toggle" value={draft.navbarToggleColor} onChange={(value) => set("navbarToggleColor", value)} /><Color label="Toggle hover" value={draft.navbarToggleHoverColor} onChange={(value) => set("navbarToggleHoverColor", value)} /><Length label="Subtitle font size" value={draft.navbarSubtitleFontSize} onChange={(value) => set("navbarSubtitleFontSize", value)} /><Color label="Subtitle" value={draft.navbarSubtitleColor} onChange={(value) => set("navbarSubtitleColor", value)} /></Group>
    <Group title="Primary and sticky"><Length label="Navbar gap" value={draft.navbarGap} onChange={(value) => set("navbarGap", value)} /><Length label="Navbar gap @M" value={draft.navbarGapMedium} onChange={(value) => set("navbarGapMedium", value)} /><Length label="Item padding horizontal" value={draft.navbarItemPaddingHorizontal} onChange={(value) => set("navbarItemPaddingHorizontal", value)} /><Length label="Item padding horizontal @M" value={draft.navbarItemPaddingHorizontalMedium} onChange={(value) => set("navbarItemPaddingHorizontalMedium", value)} /><Length label="Primary nav item font size" value={draft.navbarPrimaryNavItemFontSize} onChange={(value) => set("navbarPrimaryNavItemFontSize", value)} /></Group>
    <Group title="Dropdown"><Length label="Margin" value={draft.navbarDropdownMargin} onChange={(value) => set("navbarDropdownMargin", value)} /><Length label="Shift margin" value={draft.navbarDropdownShiftMargin} onChange={(value) => set("navbarDropdownShiftMargin", value)} /><Length label="Shift margin @M" value={draft.navbarDropdownShiftMarginMedium} onChange={(value) => set("navbarDropdownShiftMarginMedium", value)} /><Length label="Width" value={draft.navbarDropdownWidth} onChange={(value) => set("navbarDropdownWidth", value)} /><Length label="Padding" value={draft.navbarDropdownPadding} onChange={(value) => set("navbarDropdownPadding", value)} /><BackgroundPaint label="Background" value={draft.navbarDropdownBackground} onChange={(value) => set("navbarDropdownBackground", value)} /><Length label="Large shift margin" value={draft.navbarDropdownLargeShiftMargin} onChange={(value) => set("navbarDropdownLargeShiftMargin", value)} /><Length label="Dropbar shift margin" value={draft.navbarDropdownDropbarShiftMargin} onChange={(value) => set("navbarDropdownDropbarShiftMargin", value)} /><Length label="Dropbar padding top" value={draft.navbarDropdownDropbarPaddingTop} onChange={(value) => set("navbarDropdownDropbarPaddingTop", value)} /><Length label="Dropbar large shift margin" value={draft.navbarDropdownDropbarLargeShiftMargin} onChange={(value) => set("navbarDropdownDropbarLargeShiftMargin", value)} /><Length label="Dropbar shift margin @M" value={draft.navbarDropdownDropbarShiftMarginMedium} onChange={(value) => set("navbarDropdownDropbarShiftMarginMedium", value)} /><Length label="Dropbar large shift margin @M" value={draft.navbarDropdownDropbarLargeShiftMarginMedium} onChange={(value) => set("navbarDropdownDropbarLargeShiftMarginMedium", value)} /></Group>
    <Group title="Dropdown nav"><Length label="Font size" value={draft.navbarDropdownNavFontSize} onChange={(value) => set("navbarDropdownNavFontSize", value)} /><Length label="Item padding vertical" value={draft.navbarDropdownNavItemPaddingVertical} onChange={(value) => set("navbarDropdownNavItemPaddingVertical", value)} /><Color label="Item" value={draft.navbarDropdownNavItemColor} onChange={(value) => set("navbarDropdownNavItemColor", value)} /><Color label="Item hover" value={draft.navbarDropdownNavItemHoverColor} onChange={(value) => set("navbarDropdownNavItemHoverColor", value)} /><Color label="Item active" value={draft.navbarDropdownNavItemActiveColor} onChange={(value) => set("navbarDropdownNavItemActiveColor", value)} /><Length label="Subtitle font size" value={draft.navbarDropdownNavSubtitleFontSize} onChange={(value) => set("navbarDropdownNavSubtitleFontSize", value)} /><Color label="Subtitle" value={draft.navbarDropdownNavSubtitleColor} onChange={(value) => set("navbarDropdownNavSubtitleColor", value)} /><Color label="Sublist item hover" value={draft.navbarDropdownNavSublistItemHoverColor} onChange={(value) => set("navbarDropdownNavSublistItemHoverColor", value)} /><Color label="Sublist item active" value={draft.navbarDropdownNavSublistItemActiveColor} onChange={(value) => set("navbarDropdownNavSublistItemActiveColor", value)} /></Group>
    <Group title="Responsive"><Length label="Navbar gap @M" value={draft.navbarGapMedium} onChange={(value) => set("navbarGapMedium", value)} /><Length label="Nav gap @M" value={draft.navbarNavGapMedium} onChange={(value) => set("navbarNavGapMedium", value)} /><Length label="Nav item padding @M" value={draft.navbarNavItemPaddingHorizontalMedium} onChange={(value) => set("navbarNavItemPaddingHorizontalMedium", value)} /></Group>
  </>;
}
function UnsupportedEditor({ name }: { name: string }) { return <div className="builder-import-readonly builder-design-unsupported"><strong>{name} is not yet supported</strong><span>Imported values remain available in the Import LESS report only.</span></div>; }
