"use client";

import type { ChangeEvent, ReactNode } from "react";
import { RotateCcw, AlignLeft, AlignCenter, AlignRight, AlignJustify, PanelTop, PanelLeft, PanelRight } from "lucide-react";

export type InspectorOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type FieldProps = {
  label?: string;
  help?: string;
  description?: string;
  isOverridden?: boolean;
  inheritedValueText?: string;
  onReset?: () => void;
  children: ReactNode;
  className?: string;
};

export function InspectorFieldRow({
  label,
  help,
  description,
  isOverridden = false,
  inheritedValueText,
  onReset,
  children,
  className = ""
}: FieldProps) {
  return (
    <div className={`builder-field inspector-field-row ${isOverridden ? "has-override" : ""} ${className}`.trim()}>
      {label && (
        <div className="inspector-field-row-label">
          <div className="inspector-field-label-inline">
            <span className="inspector-field-title-text">{label}</span>
            {isOverridden && onReset && (
              <button
                type="button"
                className="builder-one-click-reset-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                title={`Reset ${label} to default (${inheritedValueText || "Global"})`}
                aria-label={`Reset ${label} to default`}
              >
                <RotateCcw size={11} />
              </button>
            )}
            {isOverridden && !onReset && (
              <span
                className="builder-inheritance-dot-only"
                title={inheritedValueText ? `Overridden (Global: ${inheritedValueText})` : "Overridden property"}
              />
            )}
          </div>
          {help && <InspectorHelpText>{help}</InspectorHelpText>}
        </div>
      )}
      <div className="inspector-field-row-control">
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "4px" }}>
          {children}
          {description && <div className="builder-inspector-row-desc">{description}</div>}
        </div>
      </div>
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

export function InspectorDivision({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="builder-inspector-division">
      <div className="builder-inspector-division-header">
        <div className="builder-inspector-division-title">{title}</div>
      </div>
      <div className="builder-inspector-division-content">{children}</div>
    </div>
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
  return (
    <div className="inspector-segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={option.disabled}
          title={option.label}
          className={value === option.value ? "is-selected" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.icon ? (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              {option.icon}
            </span>
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  );
}

export function InspectorPillGroup<T extends string = string>(props: { value: T | undefined; options: readonly InspectorOption<T>[]; onChange: (value: T) => void; ariaLabel?: string }) {
  return <div className="inspector-pill-group"><InspectorSegmentedControl {...props} /></div>;
}

export function InspectorAlignmentControl<T extends string = string>({
  value,
  onChange,
  options = ["left", "center", "right"] as unknown as readonly T[],
  ariaLabel = "Text alignment",
}: {
  value: T | undefined;
  onChange: (value: T) => void;
  options?: readonly T[];
  ariaLabel?: string;
}) {
  const iconMap: Record<string, ReactNode> = {
    left: <AlignLeft size={14} />,
    center: <AlignCenter size={14} />,
    right: <AlignRight size={14} />,
    justify: <AlignJustify size={14} />,
  };
  const labelMap: Record<string, string> = {
    left: "Align left",
    center: "Align center",
    right: "Align right",
    justify: "Justify",
  };
  const formattedOptions: InspectorOption<T>[] = options.map((opt) => ({
    value: opt,
    label: labelMap[String(opt)] ?? String(opt),
    icon: iconMap[String(opt)] ?? null,
  }));

  return (
    <InspectorSegmentedControl
      value={value}
      options={formattedOptions}
      onChange={onChange}
      ariaLabel={ariaLabel}
    />
  );
}

export function InspectorMediaPlacementControl<T extends string = string>({
  value,
  onChange,
  options = ["top", "left", "right"] as unknown as readonly T[],
  ariaLabel = "Media placement",
}: {
  value: T | undefined;
  onChange: (value: T) => void;
  options?: readonly T[];
  ariaLabel?: string;
}) {
  const iconMap: Record<string, ReactNode> = {
    top: <PanelTop size={14} />,
    left: <PanelLeft size={14} />,
    right: <PanelRight size={14} />,
  };
  const labelMap: Record<string, string> = {
    top: "Top",
    left: "Left",
    right: "Right",
  };
  const formattedOptions: InspectorOption<T>[] = options.map((opt) => ({
    value: opt,
    label: labelMap[String(opt)] ?? String(opt),
    icon: iconMap[String(opt)] ?? null,
  }));

  return (
    <InspectorSegmentedControl
      value={value}
      options={formattedOptions}
      onChange={onChange}
      ariaLabel={ariaLabel}
    />
  );
}

export function InspectorSemanticPositionControl<T extends string = string>({
  value,
  onChange,
  options = ["start", "end"] as unknown as readonly T[],
  ariaLabel = "Position",
}: {
  value: T | undefined;
  onChange: (value: T) => void;
  options?: readonly T[];
  ariaLabel?: string;
}) {
  const iconMap: Record<string, ReactNode> = {
    start: <AlignLeft size={14} />,
    end: <AlignRight size={14} />,
  };
  const labelMap: Record<string, string> = {
    start: "Start",
    end: "End",
  };
  const formattedOptions: InspectorOption<T>[] = options.map((opt) => ({
    value: opt,
    label: labelMap[String(opt)] ?? String(opt),
    icon: iconMap[String(opt)] ?? null,
  }));

  return (
    <InspectorSegmentedControl
      value={value}
      options={formattedOptions}
      onChange={onChange}
      ariaLabel={ariaLabel}
    />
  );
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

import { YoothemeColorPicker } from "@/components/dashboard/global-styles/YoothemeStyleControls";

export function InspectorColorField({ value, onChange, ariaLabel }: { value: string; onChange: (value: string) => void; ariaLabel?: string }) {
  return <YoothemeColorPicker label={ariaLabel || "Color"} value={value} onChange={onChange} />;
}

export function InspectorFlexAlignControl<T extends string = string>({
  value,
  onChange,
  options = ["start", "center", "end", "between"] as unknown as readonly T[],
  ariaLabel = "Container alignment",
}: {
  value: T | undefined;
  onChange: (value: T) => void;
  options?: readonly T[];
  ariaLabel?: string;
}) {
  const iconMap: Record<string, ReactNode> = {
    start: <AlignLeft size={14} />,
    center: <AlignCenter size={14} />,
    end: <AlignRight size={14} />,
    between: <AlignJustify size={14} />,
  };
  const labelMap: Record<string, string> = {
    start: "Start",
    center: "Center",
    end: "End",
    between: "Space Between",
  };
  const formattedOptions: InspectorOption<T>[] = options.map((opt) => ({
    value: opt,
    label: labelMap[String(opt)] ?? String(opt),
    icon: iconMap[String(opt)] ?? null,
  }));

  return (
    <InspectorSegmentedControl
      value={value}
      options={formattedOptions}
      onChange={onChange}
      ariaLabel={ariaLabel}
    />
  );
}

export { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
