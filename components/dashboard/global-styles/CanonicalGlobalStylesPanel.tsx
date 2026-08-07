"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { GLOBAL_STYLE_GROUPS, GLOBAL_STYLE_TOKEN_DEFAULTS } from "@/lib/globalStyleTokens";
import { YoothemeColorPicker, YoothemeFontPicker, YoothemeLessImportModal } from "@/components/dashboard/global-styles/YoothemeStyleControls";

type Props = { shellSettings: BuilderShellSettings; updateShellSettings: (patch: Partial<BuilderShellSettings>) => void };
type Screen = "root" | "global" | "button" | "card" | "heading" | "accordion" | "background" | "base" | "visibility" | "section" | "container" | "grid" | "navbar";
type Key = keyof BuilderShellSettings;

const labels: Record<string, string> = {
  small: "Small", default: "Default", medium: "Medium", large: "Large", xlarge: "Xlarge",
  none: "None", xs: "XS", sm: "Small", md: "Medium", lg: "Large", xl: "XL", "2xl": "2XL", "3xl": "3XL",
  primary: "Primary", secondary: "Secondary", text: "Text", muted: "Muted", danger: "Danger", visible: "Visible", hidden: "Hidden",
};

const supported: { id: Screen; label: string; description: string; enabled?: boolean }[] = [
  { id: "global", label: "General", description: "Typography, colors, borders, spacing, and containers" },
  { id: "background", label: "Background", description: "Page and muted background surfaces" },
  { id: "base", label: "Base", description: "Base typography and global rhythm" },
  { id: "visibility", label: "Visibility", description: "Responsive visibility defaults" },
  { id: "button", label: "Button", description: "UIkit button colors, size, radius, and hover" },
  { id: "card", label: "Card", description: "Card backgrounds, radius, body, header, title, and shadows" },
  { id: "heading", label: "Heading", description: "Heading scales, family, and weight" },
  { id: "accordion", label: "Accordion", description: "Title, icon, spacing, and row presentation" },
  { id: "section", label: "Section", description: "Section paddings, margins, and surface colors" },
  { id: "container", label: "Container", description: "Max widths for small, default, large, and xlarge containers" },
  { id: "grid", label: "Grid", description: "Gutter sizes, column gaps, and divider presentation" },
  { id: "navbar", label: "Navbar", description: "Height, background, and navigation item typography" },
];

const editorSections: Partial<Record<Screen, string[]>> = {
  global: ["Typography", "Primary", "Secondary", "Tertiary", "Colors", "Borders", "Spacing", "Controls", "Containers"],
  button: ["Shared geometry and typography", "Small size", "Large size", "Variant colors and borders", "Gradients", "Shadows"],
  card: ["Geometry", "Body", "Header", "Footer", "Title", "Badge", "Hover states", "Default variant", "Primary variant", "Secondary variant"],
  heading: ["Scale"],
  accordion: ["Title", "Icon and interaction", "Rows"],
  section: ["Padding", "Margin", "Backgrounds"],
  container: ["Max widths"],
  grid: ["Gutters"],
  navbar: ["Navigation bar"],
  background: ["Background"],
  base: ["Base", "Selection", "Inline emphasis"],
  visibility: ["Desktop", "Tablet", "Mobile"],
};

function asString(value: unknown) { return value == null ? "" : String(value); }
function hex(value: unknown) { return /^#[0-9a-f]{6}$/i.test(asString(value)) ? asString(value) : "#000000"; }
function parseLength(value: unknown) {
  const match = asString(value).trim().match(/^(-?[\d.]+)\s*(px|rem|em|%|vh|vw)?$/i);
  return { number: match?.[1] ?? "", unit: match?.[2] ?? "px" };
}

function Select({ label, value, options, onChange, disabled = false }: { label: string; value: unknown; options: string[]; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="builder-design-control"><span>{label}</span><select disabled={disabled} value={asString(value)} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}</select></label>;
}

function Color({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const current = asString(value);
  return <YoothemeColorPicker label={label} value={current} onChange={onChange} />;
}

function Gradient({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const raw = asString(value);
  const match = raw.match(/linear-gradient\(\s*(-?[\d.]+)deg,\s*([^,]+)\s+50%,\s*([^,]+)(?:\s+80%|\s+100%)?\s*\)/i);
  const angle = match?.[1] ?? "51";
  const first = hex(match?.[2]?.trim());
  const second = hex(match?.[3]?.trim());
  const emit = (nextAngle: string, nextFirst: string, nextSecond: string) => onChange(`linear-gradient(${nextAngle}deg, ${nextFirst} 50%, ${nextSecond} 100%)`);
  return <div className="builder-design-control builder-design-gradient"><span>{label}</span><div><input aria-label={`${label} angle`} type="number" value={angle} onChange={(event) => emit(event.target.value, first, second)} /><input aria-label={`${label} start`} type="color" value={first} onChange={(event) => emit(angle, event.target.value, second)} /><input aria-label={`${label} end`} type="color" value={second} onChange={(event) => emit(angle, first, event.target.value)} /></div><div className="builder-design-gradient-preview" style={{ background: raw || `linear-gradient(${angle}deg, ${first}, ${second})` }} /></div>;
}

function Length({ label, value, onChange, units = ["px", "rem", "%"] }: { label: string; value: unknown; onChange: (value: string) => void; units?: string[] }) {
  const parsed = parseLength(value);
  return <div className="builder-design-control builder-design-length"><span>{label}</span><div><input aria-label={`${label} value`} type="number" value={parsed.number} onChange={(event) => onChange(`${event.target.value}${parsed.unit}`)} /><select aria-label={`${label} unit`} value={parsed.unit} onChange={(event) => onChange(`${parsed.number || 0}${event.target.value}`)}>{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></div></div>;
}

function Shadow({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  const raw = asString(value);
  const match = raw.match(/^\s*(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?\s*(.*)$/i);
  const parts = match ? { x: match[1], y: match[2], blur: match[3], spread: match[4] ?? "0", color: match[5].trim() || "rgba(0,0,0,.15)" } : { x: "0", y: "4", blur: "16", spread: "0", color: "rgba(0,0,0,.15)" };
  const set = (name: keyof typeof parts, next: string) => onChange(`${name === "x" ? next : parts.x}px ${name === "y" ? next : parts.y}px ${name === "blur" ? next : parts.blur}px ${name === "spread" ? next : parts.spread}px ${name === "color" ? next : parts.color}`);
  return <div className="builder-design-control builder-design-shadow"><span>{label}</span><div className="builder-design-shadow-fields"><input aria-label={`${label} x`} type="number" value={parts.x} onChange={(event) => set("x", event.target.value)} /><input aria-label={`${label} y`} type="number" value={parts.y} onChange={(event) => set("y", event.target.value)} /><input aria-label={`${label} blur`} type="number" value={parts.blur} onChange={(event) => set("blur", event.target.value)} /><input aria-label={`${label} spread`} type="number" value={parts.spread} onChange={(event) => set("spread", event.target.value)} /><input aria-label={`${label} color`} type="text" value={parts.color} onChange={(event) => set("color", event.target.value)} /></div><div className="builder-design-shadow-preview" style={{ boxShadow: raw || "0 4px 16px rgba(0,0,0,.15)" }} /></div>;
}

function Group({ title, children }: { title: string; children: ReactNode }) { return <section id={`design-group-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="builder-design-group"><h3>{title}</h3><div className="builder-design-grid">{children}</div></section>; }

export default function CanonicalGlobalStylesPanel({ shellSettings, updateShellSettings }: Props) {
  const [screen, setScreen] = useState<Screen>("root");
  const [navQuery, setNavQuery] = useState("");
  const [draft, setDraft] = useState<BuilderShellSettings>(shellSettings);
  const [snapshot, setSnapshot] = useState<BuilderShellSettings>(shellSettings);
  const [isLessModalOpen, setIsLessModalOpen] = useState(false);
  useEffect(() => {
    setDraft(shellSettings);
    if (screen === "root") setSnapshot(shellSettings);
  }, [screen, shellSettings]);

  const open = (next: Screen) => { setDraft({ ...shellSettings }); setSnapshot({ ...shellSettings }); setScreen(next); };
  const set = (key: Key, value: string) => { const next = { ...draft, [key]: value }; setDraft(next); updateShellSettings({ [key]: value }); };
  const setVisibility = (key: "visibilityDesktop" | "visibilityTablet" | "visibilityMobile", value: boolean) => { const next = { ...draft, [key]: value }; setDraft(next); updateShellSettings({ [key]: value }); };
  const cancel = () => { setDraft(snapshot); updateShellSettings(snapshot); setScreen("root"); };
  const save = () => { setSnapshot(draft); setScreen("root"); };
  const generalItems = supported.filter((item) => ["global", "background", "base", "visibility"].includes(item.id));
  const componentItems = supported.filter((item) => ["button", "card", "heading", "accordion", "section", "container", "grid", "navbar"].includes(item.id));
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
          {screen === "button" && <ButtonGlobalEditor draft={draft} set={set} />}
          {screen === "card" && <CardEditor draft={draft} set={set} />}
          {screen === "heading" && <HeadingEditor draft={draft} set={set} />}
          {screen === "background" && <Group title="Background"><Color label="Page background" value={draft.backgroundColor} onChange={(value) => set("backgroundColor", value)} /><Color label="Muted background" value={draft.mutedBackgroundColor} onChange={(value) => set("mutedBackgroundColor", value)} /></Group>}
          {screen === "base" && <><Group title="Base"><Length label="Base font size" value={draft.baseFontSize} onChange={(value) => set("baseFontSize", value)} /><Length label="Base line height" value={draft.baseLineHeight} onChange={(value) => set("baseLineHeight", value)} units={["", "px", "rem"]} /><Select label="Font weight" value={draft.headingFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("headingFontWeight", value)} /></Group><Group title="Selection"><Color label="Selection background" value={draft.selectionBackground} onChange={(value) => set("selectionBackground", value)} /><Color label="Selection text" value={draft.selectionColor} onChange={(value) => set("selectionColor", value)} /></Group><Group title="Inline emphasis"><Color label="Inserted background" value={draft.baseInsBackground} onChange={(value) => set("baseInsBackground", value)} /><Color label="Inserted text" value={draft.baseInsColor} onChange={(value) => set("baseInsColor", value)} /><Color label="Marked background" value={draft.baseMarkBackground} onChange={(value) => set("baseMarkBackground", value)} /><Color label="Marked text" value={draft.baseMarkColor} onChange={(value) => set("baseMarkColor", value)} /></Group></>}
          {screen === "visibility" && <VisibilityEditor draft={draft} setVisibility={setVisibility} />}
          {screen === "accordion" && <AccordionEditor draft={draft} set={set} />}
          {screen === "section" && <SectionGlobalEditor draft={draft} set={set} />}
          {screen === "container" && <ContainerGlobalEditor draft={draft} set={set} />}
          {screen === "grid" && <GridGlobalEditor draft={draft} set={set} />}
          {screen === "navbar" && <NavbarGlobalEditor draft={draft} set={set} />}
        </div>
      </div>
    </div>;
  }

  return <div className="builder-global-design-root" data-testid="global-design-root">
    <div className="builder-design-root-heading"><div><small>DESIGN SYSTEM</small><span>STYLE</span></div><p>WebPages semantic design system</p></div>
    
    {/* YOOtheme Preset Selector */}
    <div style={{ padding: "0 16px 12px 16px" }}>
      <label style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Theme Preset</label>
      <select
        value={draft.globalStylePresetName ?? "DevStack"}
        onChange={(e) => {
          const presetName = e.target.value;
          let patch: Partial<BuilderShellSettings> = { globalStylePresetName: presetName };
          if (presetName === "DevStack") {
            patch = { ...patch, primaryColor: "#6f40f1", linkColor: "#6f40f1", fontFamilyBody: "Manrope" };
          } else if (presetName === "Dark") {
            patch = { ...patch, backgroundColor: "#0f172a", mutedBackgroundColor: "#1e293b", textColor: "#f8fafc", primaryColor: "#38bdf8", linkColor: "#38bdf8" };
          } else if (presetName === "Soft") {
            patch = { ...patch, backgroundColor: "#fdfbf7", mutedBackgroundColor: "#f4efe6", textColor: "#1e293b", primaryColor: "#e11d48", linkColor: "#e11d48", fontFamilyBody: "Georgia" };
          } else if (presetName === "Default") {
            patch = { ...patch, backgroundColor: "#ffffff", mutedBackgroundColor: "#f8fafc", textColor: "#111827", primaryColor: "#111111", linkColor: "#111111", fontFamilyBody: "Manrope" };
          }
          setDraft({ ...draft, ...patch });
          updateShellSettings(patch);
        }}
        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155", fontSize: "13px", fontWeight: 600, backgroundColor: "#0f172a", color: "#f8fafc", outline: "none" }}
      >
        <option value="DevStack">DevStack (Modern Purple)</option>
        <option value="Default">Default UIkit</option>
        <option value="Dark">Dark Mode</option>
        <option value="Soft">Soft Elegance</option>
      </select>
    </div>

    <div className="builder-design-inheritance-banner" data-token-inheritance="global-component-local"><strong>Canonical token source</strong><span>Global Style → Component Default → Current Element Override</span><small>Builder and published frontend consume the same generated UIkit variables.</small></div>
    <label className="builder-design-nav-search"><Search size={16} aria-hidden="true" /><input value={navQuery} onChange={(event) => setNavQuery(event.target.value)} placeholder="Search styles and components" aria-label="Search styles and components" /></label>
    <div className="builder-design-root-layout is-preview-off"><nav className="builder-design-nav">
      <div className="builder-design-nav-section"><h3>General <small>{generalItems.length}</small></h3>{generalItems.filter(matchesNav).map((item, index) => <NavItem key={`${item.label}-${index}`} item={item} onClick={open} />)}</div>
      <div className="builder-design-nav-section"><h3>Token groups <small>{GLOBAL_STYLE_GROUPS.length}</small></h3>{GLOBAL_STYLE_GROUPS.map((group) => <div key={group.id} className="builder-design-token-group"><strong>{group.label}</strong><span>{group.items.join(" · ")}</span></div>)}</div>
      <div className="builder-design-nav-section"><h3>Components <small>{componentItems.filter(matchesNav).length}</small></h3>{componentItems.filter(matchesNav).map((item) => <NavItem key={item.id} item={item} onClick={open} />)}</div>
    </nav></div>

    {/* YOOtheme Master Action Buttons */}
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "16px" }}>
      <button
        type="button"
        onClick={() => {
          updateShellSettings(draft);
        }}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#6f40f1", color: "#ffffff", fontWeight: 700, fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}
      >
        RECOMPILE STYLE
      </button>
      <button
        type="button"
        onClick={() => setIsLessModalOpen(true)}
        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #38bdf8", backgroundColor: "transparent", color: "#38bdf8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}
      >
        IMPORT YOOTHEME LESS
      </button>
      <button
        type="button"
        onClick={() => {
          const resetPatch: Partial<BuilderShellSettings> = { ...GLOBAL_STYLE_TOKEN_DEFAULTS };
          setDraft({ ...draft, ...resetPatch });
          updateShellSettings(resetPatch);
        }}
        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #334155", backgroundColor: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer" }}
      >
        RESET TO DEFAULTS
      </button>
    </div>

    <YoothemeLessImportModal
      isOpen={isLessModalOpen}
      onClose={() => setIsLessModalOpen(false)}
      onImport={(importedPatch) => {
        setDraft({ ...draft, ...importedPatch });
        updateShellSettings(importedPatch);
      }}
    />
  </div>;
}

function NavItem({ item, onClick }: { item: { id: Screen; label: string; description: string; enabled?: boolean }; onClick: (screen: Screen) => void }) { return <button type="button" className={`builder-design-nav-item${item.enabled === false ? " is-disabled" : ""}`} disabled={item.enabled === false} onClick={() => onClick(item.id)}><strong>{item.label}</strong><span>{item.description}</span></button>; }

function GlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <>
  <Group title="Typography"><YoothemeFontPicker label="Base font family" value={draft.fontFamilyBody ?? "Manrope"} onChange={(value) => set("fontFamilyBody", value)} /><Length label="Base font size" value={draft.baseFontSize} onChange={(value) => set("baseFontSize", value)} /><Length label="Base line height" value={draft.baseLineHeight} onChange={(value) => set("baseLineHeight", value)} units={["", "px", "rem"]} />{([["smallTextFontSize", "Small"], ["headingMediumFontSize", "Medium"], ["headingLargeFontSize", "Large"], ["headingXLargeFontSize", "Xlarge"]] as [Key, string][]).map(([key, label]) => <Length key={key} label={`${label} size`} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>
  <Group title="Primary"><YoothemeFontPicker label="Font family" value={draft.fontFamilyPrimary ?? "inherit"} onChange={(value) => set("fontFamilyPrimary", value)} /><Select label="Weight" value={draft.fontWeightPrimary} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("fontWeightPrimary", value)} /></Group>
  <Group title="Secondary"><YoothemeFontPicker label="Font family" value={draft.fontFamilySecondary ?? "inherit"} onChange={(value) => set("fontFamilySecondary", value)} /><Select label="Weight" value={draft.fontWeightSecondary} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("fontWeightSecondary", value)} /></Group>
  <Group title="Tertiary"><YoothemeFontPicker label="Font family" value={draft.fontFamilyTertiary ?? "inherit"} onChange={(value) => set("fontFamilyTertiary", value)} /><Select label="Weight" value={draft.fontWeightTertiary} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("fontWeightTertiary", value)} /></Group>
  <ColorGroup draft={draft} set={set} /><BorderGroup draft={draft} set={set} /><ShellSpacingGroup draft={draft} set={set} /><SpacingGroup draft={draft} set={set} /><ControlGroup draft={draft} set={set} /><ContainerGroup draft={draft} set={set} /></>; }

function ColorGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Colors">{([["textColor", "Text"], ["emphasisColor", "Emphasis"], ["mutedTextColor", "Muted"], ["linkColor", "Link"], ["linkHoverColor", "Link hover"], ["primaryColor", "Primary background"], ["secondaryColor", "Secondary background"], ["successColor", "Success"], ["warningColor", "Warning"], ["dangerColor", "Danger"], ["backgroundColor", "Page background"], ["mutedBackgroundColor", "Muted background"]] as [Key, string][]).map(([key, label]) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>; }
function BorderGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Borders"><Color label="Color" value={draft.borderColor} onChange={(value) => set("borderColor", value)} /><Length label="Radius" value={draft.borderRadius} onChange={(value) => set("borderRadius", value)} /><Length label="Width" value={draft.borderWidth} onChange={(value) => set("borderWidth", value)} /></Group>; }
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
function ControlGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Controls"><Length label="Small height" value={draft.controlHeightSmall} onChange={(value) => set("controlHeightSmall", value)} /><Length label="Default height" value={draft.buttonHeight} onChange={(value) => set("buttonHeight", value)} /><Length label="Large height" value={draft.controlHeightLarge} onChange={(value) => set("controlHeightLarge", value)} /></Group>; }
function ContainerGroup({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Containers">{([["containerSmall", "Small"], ["containerDefault", "Default"], ["containerLarge", "Large"], ["containerXLarge", "Xlarge"], ["pageContainerMaxWidth", "Page max width"]] as [Key, string][]).map(([key, label]) => <Length key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>; }

function ButtonEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <><Group title="Appearance"><Color label="Primary background" value={draft.buttonPrimaryBackground} onChange={(value) => set("buttonPrimaryBackground", value)} /><Color label="Primary text" value={draft.buttonPrimaryText} onChange={(value) => set("buttonPrimaryText", value)} /><Color label="Default background" value={draft.buttonDefaultBackground} onChange={(value) => set("buttonDefaultBackground", value)} /><Color label="Default text" value={draft.buttonDefaultText} onChange={(value) => set("buttonDefaultText", value)} /><Color label="Secondary background" value={draft.buttonSecondaryBackground} onChange={(value) => set("buttonSecondaryBackground", value)} /><Color label="Secondary text" value={draft.buttonSecondaryText} onChange={(value) => set("buttonSecondaryText", value)} /><Color label="Primary hover background" value={draft.buttonHoverBg} onChange={(value) => set("buttonHoverBg", value)} /><Color label="Primary hover text" value={draft.buttonHoverTextColor} onChange={(value) => set("buttonHoverTextColor", value)} /><Color label="Default hover background" value={draft.buttonDefaultHoverBackground} onChange={(value) => set("buttonDefaultHoverBackground", value)} /><Color label="Default hover text" value={draft.buttonDefaultHoverText} onChange={(value) => set("buttonDefaultHoverText", value)} /><Color label="Secondary hover background" value={draft.buttonSecondaryHoverBackground} onChange={(value) => set("buttonSecondaryHoverBackground", value)} /><Color label="Secondary hover text" value={draft.buttonSecondaryHoverText} onChange={(value) => set("buttonSecondaryHoverText", value)} /><Color label="Text hover" value={draft.buttonTextHoverColor} onChange={(value) => set("buttonTextHoverColor", value)} /><Color label="Primary gradient" value={draft.buttonPrimaryGradient} onChange={(value) => set("buttonPrimaryGradient", value)} /></Group><Group title="Typography"><Length label="Default font size" value={draft.buttonFontSize} onChange={(value) => set("buttonFontSize", value)} /><Length label="Large font size" value={draft.buttonLargeFontSize} onChange={(value) => set("buttonLargeFontSize", value)} /><Length label="Letter spacing" value={draft.buttonLetterSpacing} onChange={(value) => set("buttonLetterSpacing", value)} /><Select label="Font family" value={draft.fontFamilyBody} options={["inherit", "Manrope", "Inter", "system-ui"]} onChange={(value) => set("fontFamilyBody", value)} /><Select label="Weight" value={draft.headingFontWeight} options={["400", "500", "600", "700"]} onChange={(value) => set("headingFontWeight", value)} /></Group><Group title="Sizing"><Length label="Small height" value={draft.controlHeightSmall} onChange={(value) => set("controlHeightSmall", value)} /><Length label="Default height" value={draft.buttonHeight} onChange={(value) => set("buttonHeight", value)} /><Length label="Large height" value={draft.controlHeightLarge} onChange={(value) => set("controlHeightLarge", value)} /><Length label="Horizontal padding" value={draft.buttonPaddingX} onChange={(value) => set("buttonPaddingX", value)} /><Length label="Radius" value={draft.buttonRadius} onChange={(value) => set("buttonRadius", value)} /><Length label="Border width" value={draft.buttonBorderWidth} onChange={(value) => set("buttonBorderWidth", value)} /><Length label="Transition" value={draft.buttonTransitionDuration} onChange={(value) => set("buttonTransitionDuration", value)} units={["s", "ms"]} /></Group><Group title="Elevation"><Shadow label="Default shadow" value={draft.buttonDefaultShadow} onChange={(value) => set("buttonDefaultShadow", value)} /><Shadow label="Default hover shadow" value={draft.buttonDefaultHoverShadow} onChange={(value) => set("buttonDefaultHoverShadow", value)} /><Shadow label="Primary shadow" value={draft.buttonPrimaryShadow} onChange={(value) => set("buttonPrimaryShadow", value)} /><Shadow label="Primary hover shadow" value={draft.buttonPrimaryHoverShadow} onChange={(value) => set("buttonPrimaryHoverShadow", value)} /></Group></>; }
function ButtonGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const fields: [Key, string][] = [["buttonDefaultBackground", "Default background"], ["buttonDefaultText", "Default text"], ["buttonDefaultHoverBackground", "Default hover background"], ["buttonDefaultHoverText", "Default hover text"], ["buttonDefaultBorder", "Default border"], ["buttonDefaultHoverBorder", "Default hover border"], ["buttonDefaultActiveBackground", "Default active background"], ["buttonDefaultActiveText", "Default active text"], ["buttonDefaultActiveBorder", "Default active border"], ["buttonPrimaryBackground", "Primary background"], ["buttonPrimaryText", "Primary text"], ["buttonPrimaryHoverText", "Primary hover text"], ["buttonPrimaryActiveBackground", "Primary active background"], ["buttonPrimaryActiveText", "Primary active text"], ["buttonPrimaryActiveBorder", "Primary active border"], ["buttonSecondaryBackground", "Secondary background"], ["buttonSecondaryText", "Secondary text"], ["buttonSecondaryHoverBackground", "Secondary hover background"], ["buttonSecondaryHoverText", "Secondary hover text"], ["buttonSecondaryBorder", "Secondary border"], ["buttonSecondaryHoverBorder", "Secondary hover border"], ["buttonSecondaryActiveBackground", "Secondary active background"], ["buttonSecondaryActiveText", "Secondary active text"], ["buttonSecondaryActiveBorder", "Secondary active border"], ["buttonDangerBackground", "Danger background"], ["buttonDangerText", "Danger text"], ["buttonDangerHoverBackground", "Danger hover background"], ["buttonDangerHoverText", "Danger hover text"], ["buttonDangerBorder", "Danger border"], ["buttonDangerHoverBorder", "Danger hover border"], ["buttonDangerActiveBackground", "Danger active background"], ["buttonDangerActiveText", "Danger active text"], ["buttonDangerActiveBorder", "Danger active border"], ["buttonDisabledBackground", "Disabled background"], ["buttonDisabledText", "Disabled text"], ["buttonTextColorSemantic", "Text color"], ["buttonTextHoverColor", "Text hover color"], ["buttonTextHoverBorder", "Text hover border"], ["buttonLinkColor", "Link color"], ["buttonLinkHoverColor", "Link hover color"]];
  return <><Group title="Shared geometry and typography"><Select label="Font family" value={draft.buttonFontFamily} options={["inherit", "Manrope", "Inter", "system-ui"]} onChange={(value) => set("buttonFontFamily", value)} /><Select label="Font style" value={draft.buttonFontStyle} options={["normal", "italic"]} onChange={(value) => set("buttonFontStyle", value)} /><Select label="Font weight" value={draft.buttonFontWeight} options={["400", "500", "600", "700", "800"]} onChange={(value) => set("buttonFontWeight", value)} /><Select label="Text transform" value={draft.buttonTextTransform} options={["none", "uppercase", "lowercase", "capitalize"]} onChange={(value) => set("buttonTextTransform", value)} /><Length label="Font size" value={draft.buttonFontSize} onChange={(value) => set("buttonFontSize", value)} /><Length label="Line height" value={draft.buttonLineHeight} onChange={(value) => set("buttonLineHeight", value)} units={["", "px", "rem"]} /><Length label="Letter spacing" value={draft.buttonLetterSpacing} onChange={(value) => set("buttonLetterSpacing", value)} /><Select label="Border mode" value={draft.buttonBorderMode} options={["solid", "dashed", "dotted"]} onChange={(value) => set("buttonBorderMode", value)} /><Length label="Border radius" value={draft.buttonRadius} onChange={(value) => set("buttonRadius", value)} /><Length label="Border width" value={draft.buttonBorderWidth} onChange={(value) => set("buttonBorderWidth", value)} /><Length label="Transition duration" value={draft.buttonTransitionDuration} onChange={(value) => set("buttonTransitionDuration", value)} units={["s", "ms"]} /><Length label="Horizontal padding" value={draft.buttonPaddingX} onChange={(value) => set("buttonPaddingX", value)} /><Length label="Background size" value={draft.buttonBackgroundSize} onChange={(value) => set("buttonBackgroundSize", value)} units={["%", "px"]} /><Length label="Background position" value={draft.buttonBackgroundPosition} onChange={(value) => set("buttonBackgroundPosition", value)} units={["%", "px"]} /><Length label="Hover background position" value={draft.buttonHoverBackgroundPosition} onChange={(value) => set("buttonHoverBackgroundPosition", value)} units={["%", "px"]} /><Select label="Backdrop filter" value={draft.buttonBackdropFilter} options={["none", "blur(8px)", "blur(16px)"]} onChange={(value) => set("buttonBackdropFilter", value)} /></Group><Group title="Small size"><Length label="Small font size" value={draft.buttonSmallFontSize} onChange={(value) => set("buttonSmallFontSize", value)} /><Length label="Small line height" value={draft.buttonSmallLineHeight} onChange={(value) => set("buttonSmallLineHeight", value)} /><Length label="Small control height" value={draft.controlHeightSmall} onChange={(value) => set("controlHeightSmall", value)} /><Length label="Small padding" value={draft.buttonSmallPaddingX} onChange={(value) => set("buttonSmallPaddingX", value)} /><Length label="Small radius" value={draft.buttonSmallRadius} onChange={(value) => set("buttonSmallRadius", value)} /></Group><Group title="Large size"><Length label="Large font size" value={draft.buttonLargeFontSize} onChange={(value) => set("buttonLargeFontSize", value)} /><Length label="Large line height" value={draft.buttonLargeLineHeight} onChange={(value) => set("buttonLargeLineHeight", value)} /><Length label="Large control height" value={draft.controlHeightLarge} onChange={(value) => set("controlHeightLarge", value)} /><Length label="Large padding" value={draft.buttonLargePaddingX} onChange={(value) => set("buttonLargePaddingX", value)} /><Length label="Large radius" value={draft.buttonLargeRadius} onChange={(value) => set("buttonLargeRadius", value)} /></Group><Group title="Variant colors and borders">{fields.map(([key, label]) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group><Group title="Gradients"><Gradient label="Primary" value={draft.buttonPrimaryGradient} onChange={(value) => set("buttonPrimaryGradient", value)} /><Gradient label="Primary hover" value={draft.buttonPrimaryHoverGradient} onChange={(value) => set("buttonPrimaryHoverGradient", value)} /><Gradient label="Primary active" value={draft.buttonPrimaryActiveGradient} onChange={(value) => set("buttonPrimaryActiveGradient", value)} /><Gradient label="Secondary hover" value={draft.buttonSecondaryHoverGradient} onChange={(value) => set("buttonSecondaryHoverGradient", value)} /><Gradient label="Secondary active" value={draft.buttonSecondaryActiveGradient} onChange={(value) => set("buttonSecondaryActiveGradient", value)} /></Group><Group title="Shadows"><Shadow label="Default" value={draft.buttonDefaultShadow} onChange={(value) => set("buttonDefaultShadow", value)} /><Shadow label="Default hover" value={draft.buttonDefaultHoverShadow} onChange={(value) => set("buttonDefaultHoverShadow", value)} /><Shadow label="Default active" value={draft.buttonDefaultActiveShadow} onChange={(value) => set("buttonDefaultActiveShadow", value)} /><Shadow label="Primary" value={draft.buttonPrimaryShadow} onChange={(value) => set("buttonPrimaryShadow", value)} /><Shadow label="Primary hover" value={draft.buttonPrimaryHoverShadow} onChange={(value) => set("buttonPrimaryHoverShadow", value)} /><Shadow label="Primary active" value={draft.buttonPrimaryActiveShadow} onChange={(value) => set("buttonPrimaryActiveShadow", value)} /><Shadow label="Secondary" value={draft.buttonSecondaryShadow} onChange={(value) => set("buttonSecondaryShadow", value)} /><Shadow label="Secondary hover" value={draft.buttonSecondaryHoverShadow} onChange={(value) => set("buttonSecondaryHoverShadow", value)} /><Shadow label="Secondary active" value={draft.buttonSecondaryActiveShadow} onChange={(value) => set("buttonSecondaryActiveShadow", value)} /><Shadow label="Danger hover" value={draft.buttonDangerHoverShadow} onChange={(value) => set("buttonDangerHoverShadow", value)} /><Shadow label="Danger active" value={draft.buttonDangerActiveShadow} onChange={(value) => set("buttonDangerActiveShadow", value)} /></Group></>;
}

function CardEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) {
  const variantFields: [Key, string][] = [
    ["cardBackground", "Default background"], ["cardDefaultText", "Default text"], ["cardDefaultTitle", "Default title"], ["cardDefaultBorder", "Default border"],
    ["cardPrimaryBackground", "Primary background"], ["cardPrimaryText", "Primary text"], ["cardPrimaryTitle", "Primary title"], ["cardPrimaryBorder", "Primary border"],
    ["cardSecondaryBackground", "Secondary background"], ["cardSecondaryText", "Secondary text"], ["cardSecondaryTitle", "Secondary title"], ["cardSecondaryBorder", "Secondary border"],
  ];
  const hoverFields: [Key, string][] = [
    ["cardDefaultHoverBackground", "Default hover background"], ["cardDefaultHoverText", "Default hover text"], ["cardDefaultHoverTitle", "Default hover title"], ["cardDefaultHoverBorder", "Default hover border"],
    ["cardPrimaryHoverBackground", "Primary hover background"], ["cardPrimaryHoverText", "Primary hover text"], ["cardPrimaryHoverTitle", "Primary hover title"], ["cardPrimaryHoverBorder", "Primary hover border"],
    ["cardSecondaryHoverBackground", "Secondary hover background"], ["cardSecondaryHoverText", "Secondary hover text"], ["cardSecondaryHoverTitle", "Secondary hover title"], ["cardSecondaryHoverBorder", "Secondary hover border"],
  ];
  return <>
    <Group title="Geometry"><Length label="Border width" value={draft.cardBorderWidth} onChange={(value) => set("cardBorderWidth", value)} /><Length label="Border radius" value={draft.cardBorderRadius} onChange={(value) => set("cardBorderRadius", value)} /><Length label="Transition duration" value={draft.cardTransitionDuration} onChange={(value) => set("cardTransitionDuration", value)} units={["s", "ms"]} /></Group>
    <Group title="Padding"><Length label="Small" value={draft.cardPaddingSmall} onChange={(value) => set("cardPaddingSmall", value)} /><Length label="Default" value={draft.cardPaddingDefault} onChange={(value) => set("cardPaddingDefault", value)} /><Length label="Large" value={draft.cardPaddingLarge} onChange={(value) => set("cardPaddingLarge", value)} /></Group>
    <Group title="Variants"><div className="builder-import-readonly"><strong>Default · Primary · Secondary · Blank</strong><span>Blank uses the transparent UIkit panel surface; the three card variants below define their semantic appearance.</span></div>{variantFields.map(([key, label]) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>
    <Group title="Hover states">{hoverFields.map(([key, label]) => <Color key={key} label={label} value={draft[key]} onChange={(value) => set(key, value)} />)}</Group>
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
function SectionGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <><Group title="Padding"><Length label="Small padding" value={draft.sectionPaddingSmall} onChange={(value) => set("sectionPaddingSmall", value)} /><Length label="Default padding" value={draft.sectionPaddingTop} onChange={(value) => set("sectionPaddingTop", value)} /><Length label="Large padding" value={draft.sectionPaddingLarge} onChange={(value) => set("sectionPaddingLarge", value)} /><Length label="Xlarge padding" value={draft.sectionPaddingXLarge} onChange={(value) => set("sectionPaddingXLarge", value)} /></Group><Group title="Backgrounds"><Color label="Default background" value={draft.backgroundColor} onChange={(value) => set("backgroundColor", value)} /><Color label="Muted background" value={draft.mutedBackgroundColor} onChange={(value) => set("mutedBackgroundColor", value)} /><Color label="Primary background" value={draft.primaryColor} onChange={(value) => set("primaryColor", value)} /><Color label="Secondary background" value={draft.secondaryColor} onChange={(value) => set("secondaryColor", value)} /></Group></>; }
function ContainerGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Max widths"><Length label="Small container" value={draft.containerSmall} onChange={(value) => set("containerSmall", value)} /><Length label="Default container" value={draft.containerDefault} onChange={(value) => set("containerDefault", value)} /><Length label="Large container" value={draft.containerLarge} onChange={(value) => set("containerLarge", value)} /><Length label="Xlarge container" value={draft.containerXLarge} onChange={(value) => set("containerXLarge", value)} /><Length label="Page max width" value={draft.pageContainerMaxWidth} onChange={(value) => set("pageContainerMaxWidth", value)} /></Group>; }
function GridGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Gutters"><Length label="Small gutter" value={draft.gridGutterSmall} onChange={(value) => set("gridGutterSmall", value)} /><Length label="Default gutter" value={draft.gridGutterDefault} onChange={(value) => set("gridGutterDefault", value)} /><Length label="Medium gutter" value={draft.gridGutterMedium} onChange={(value) => set("gridGutterMedium", value)} /><Length label="Large gutter" value={draft.gridGutterLarge} onChange={(value) => set("gridGutterLarge", value)} /></Group>; }
function NavbarGlobalEditor({ draft, set }: { draft: BuilderShellSettings; set: (key: Key, value: string) => void }) { return <Group title="Navigation bar"><Color label="Link color" value={draft.linkColor} onChange={(value) => set("linkColor", value)} /><Color label="Link hover color" value={draft.linkHoverColor} onChange={(value) => set("linkHoverColor", value)} /><Color label="Primary background" value={draft.primaryColor} onChange={(value) => set("primaryColor", value)} /><Color label="Page background" value={draft.backgroundColor} onChange={(value) => set("backgroundColor", value)} /></Group>; }
function UnsupportedEditor({ name }: { name: string }) { return <div className="builder-import-readonly builder-design-unsupported"><strong>{name} is not yet supported</strong><span>Imported values remain available in the Import LESS report only.</span></div>; }
