"use client";
import React from "react";
import { useGlobalStyles } from "../context/GlobalStylesContext";

const colors = [["primaryColor","Primary"],["secondaryColor","Secondary"],["mutedColor","Muted"],["successColor","Success"],["warningColor","Warning"],["dangerColor","Danger"],["textColor","Text"],["backgroundColor","Background"]] as const;
function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  const { shellSettings, updateShellSettings } = useGlobalStyles();
  return <label className="builder-field"><span>{label}</span><input type={type} value={shellSettings?.[name] ?? ""} onChange={e => updateShellSettings({ [name]: e.target.value })} /></label>;
}
function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  const { shellSettings, updateShellSettings } = useGlobalStyles();
  return <label className="builder-field"><span>{label}</span><select value={shellSettings?.[name] ?? options[0]} onChange={e => updateShellSettings({ [name]: e.target.value })}>{options.map(v => <option key={v} value={v}>{v}</option>)}</select></label>;
}
export default function SiteDesignPanel() {
  return <div className="builder-global-styles-group">
    <div className="builder-card-title"><strong>UIkit Global Colors</strong><span>canonical theme tokens</span></div>
    <div className="builder-design-grid">{colors.map(([name,label]) => <Field key={name} label={label} name={name} type="color" />)}</div>
    <div className="builder-card-title"><strong>Typography</strong><span>UIkit root variables</span></div>
    <Field label="Global font family" name="fontFamilyBody" /><Field label="Heading font family" name="fontFamilyHeading" />
    <div className="builder-two-column"><Field label="Base font size" name="baseFontSize" /><Field label="Base line height" name="baseLineHeight" /></div>
    <div className="builder-card-title"><strong>Containers & spacing</strong><span>semantic presets</span></div>
    <div className="builder-two-column"><SelectField label="Section padding" name="sectionPaddingDefault" options={["40px","70px","80px","100px"]} /><SelectField label="Grid gutter" name="gridGutterDefault" options={["15px","30px","40px"]} /></div>
    <div className="builder-two-column"><Field label="Container small" name="containerSmall" /><Field label="Container default" name="containerDefault" /><Field label="Container large" name="containerLarge" /><Field label="Container xlarge" name="containerXLarge" /></div>
    <div className="builder-card-title"><strong>Surfaces & buttons</strong><span>shared builder/frontend values</span></div>
    <div className="builder-two-column"><Field label="Card background" name="cardBackground" type="color" /><Field label="Card radius" name="cardBorderRadius" /><Field label="Card border" name="cardBorderColor" type="color" /><Field label="Card shadow" name="cardShadow" /></div>
    <div className="builder-two-column"><Field label="Primary button bg" name="buttonPrimaryBackground" type="color" /><Field label="Primary button text" name="buttonPrimaryText" type="color" /><Field label="Secondary button bg" name="buttonSecondaryBackground" type="color" /><Field label="Secondary button text" name="buttonSecondaryText" type="color" /><Field label="Button height" name="buttonHeight" /><Field label="Button radius" name="buttonRadius" /></div>
  </div>;
}
