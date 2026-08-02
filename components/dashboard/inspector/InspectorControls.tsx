"use client";

import type { ChangeEvent, ReactNode } from "react";

export type InspectorOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type FieldProps = {
  label?: string;
  help?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function InspectorFieldRow({ label, help, children, className = "" }: FieldProps) {
  return (
    <div className={`builder-field inspector-field-row ${className}`.trim()}>
      {label && <div className="inspector-field-row-label"><span>{label}</span>{help && <InspectorHelpText>{help}</InspectorHelpText>}</div>}
      <div className="inspector-field-row-control">{children}</div>
    </div>
  );
}

export function InspectorSection({ title, description, children, className = "" }: FieldProps & { title: string }) {
  return (
    <section className={`inspector-section ${className}`.trim()}>
      <div className="inspector-section-heading"><h3>{title}</h3>{description && <InspectorHelpText>{description}</InspectorHelpText>}</div>
      {children}
    </section>
  );
}

export function InspectorHelpText({ children }: { children: ReactNode }) {
  return <small className="inspector-help-text">{children}</small>;
}

export function InspectorSelect<T extends string = string>({ value, options, onChange, disabled = false, ariaLabel }: {
  value: T | undefined;
  options: readonly InspectorOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return <select className="inspector-control inspector-select" aria-label={ariaLabel} value={value} disabled={disabled} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as T)}>{options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>;
}

export function InspectorSegmentedControl<T extends string = string>({ value, options, onChange, ariaLabel }: {
  value: T | undefined;
  options: readonly InspectorOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return <div className="inspector-segmented" role="radiogroup" aria-label={ariaLabel}>{options.map((option) => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} disabled={option.disabled} className={value === option.value ? "is-selected" : ""} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}

export function InspectorPillGroup<T extends string = string>(props: { value: T | undefined; options: readonly InspectorOption<T>[]; onChange: (value: T) => void; ariaLabel?: string }) {
  return <div className="inspector-pill-group"><InspectorSegmentedControl {...props} /></div>;
}

export function InspectorSwitch({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; label?: string; disabled?: boolean }) {
  return <label className="inspector-switch"><input type="checkbox" role="switch" aria-label={label} checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span className="inspector-switch-track" aria-hidden="true"><span /></span>{label && <span className="inspector-switch-label">{label}</span>}</label>;
}

export function InspectorTextField({ value, onChange, placeholder, ariaLabel }: { value: string; onChange: (value: string) => void; placeholder?: string; ariaLabel?: string }) {
  return <input className="inspector-control inspector-text-field" aria-label={ariaLabel} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

export function InspectorTextarea({ value, onChange, placeholder, ariaLabel }: { value: string; onChange: (value: string) => void; placeholder?: string; ariaLabel?: string }) {
  return <textarea className="inspector-control inspector-textarea" aria-label={ariaLabel} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

export function InspectorNumberUnit({ value, unit, units = ["px", "%", "rem"], onValueChange, onUnitChange, ariaLabel }: { value: number | string; unit: string; units?: readonly string[]; onValueChange: (value: string) => void; onUnitChange: (unit: string) => void; ariaLabel?: string }) {
  return <div className="inspector-number-unit"><input className="inspector-control" type="number" aria-label={ariaLabel} value={value} onChange={(event) => onValueChange(event.target.value)} /><select className="inspector-control" aria-label={`${ariaLabel ?? "Value"} unit`} value={unit} onChange={(event) => onUnitChange(event.target.value)}>{units.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></div>;
}

export function InspectorColorField({ value, onChange, ariaLabel }: { value: string; onChange: (value: string) => void; ariaLabel?: string }) {
  return <div className="inspector-color-field"><input className="inspector-color-swatch" type="color" aria-label={`${ariaLabel ?? "Color"} picker`} value={value.startsWith("#") ? value.slice(0, 7) : "#808080"} onChange={(event) => onChange(event.target.value)} /><input className="inspector-control inspector-color-value" aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
