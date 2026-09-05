"use client";

import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import {
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  PanelTop,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import type { DynamicContentContextDescriptor, DynamicFieldBinding, DynamicFieldBindings } from "@/lib/dynamicContent";
import type { DynamicBindingDestination } from "@/lib/dynamicContentCapabilities";
import DynamicFieldBindingControl from "@/components/dashboard/inspector/panels/DynamicFieldBindingControl";

export type InspectorOption<T extends string = string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type InspectorDynamicBindingOwner = {
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings;
};

export type InspectorDynamicBindingPatch = {
  dynamicBindings?: DynamicFieldBindings;
};

export function inspectorDynamicBinding(
  owner: InspectorDynamicBindingOwner,
  update: (patch: InspectorDynamicBindingPatch) => void,
  destination: DynamicBindingDestination,
) {
  return {
    destination,
    descriptor: owner.dynamicContext,
    bindings: owner.dynamicBindings,
    onChange: (field: string, binding: DynamicFieldBinding | undefined) => {
      const next = { ...(owner.dynamicBindings ?? {}) };
      if (binding) next[field] = binding;
      else delete next[field];
      update({ dynamicBindings: Object.keys(next).length > 0 ? next : undefined });
    },
  };
}

type FieldProps = {
  label?: string;
  labelAccessory?: ReactNode;
  help?: string;
  description?: string;
  isOverridden?: boolean;
  inheritedValueText?: string;
  onReset?: () => void;
  children: ReactNode;
  className?: string;
  dynamicBinding?: {
    destination: DynamicBindingDestination;
    descriptor?: DynamicContentContextDescriptor;
    bindings?: DynamicFieldBindings;
    onChange: (destination: string, binding: DynamicFieldBinding | undefined) => void;
  };
};

export function InspectorFieldRow({
  label,
  labelAccessory,
  help,
  description,
  isOverridden = false,
  inheritedValueText,
  onReset,
  children,
  className = "",
  dynamicBinding,
}: FieldProps) {
  const activeDynamicBinding = dynamicBinding?.bindings?.[dynamicBinding.destination];
  const dynamicAccessory = label && dynamicBinding && !activeDynamicBinding ? (
    <DynamicFieldBindingControl
      destination={dynamicBinding.destination}
      label={label}
      descriptor={dynamicBinding.descriptor}
      binding={dynamicBinding.bindings?.[dynamicBinding.destination]}
      onChange={(binding) => dynamicBinding.onChange(dynamicBinding.destination, binding)}
      presentation="header"
    />
  ) : activeDynamicBinding ? <span className="builder-dynamic-field-status">Dynamic</span> : null;
  return (
    <div
      className={`builder-field inspector-field-row ${dynamicBinding ? "has-dynamic-field" : ""} ${activeDynamicBinding ? "is-dynamic-bound" : ""} ${isOverridden ? "has-override" : ""} ${className}`.trim()}
      title={description || undefined}
    >
      {label && (
        <div className="inspector-field-row-label">
          <div className="inspector-field-label-inline">
            <span className="inspector-field-title-text">{label}</span>
            {labelAccessory ?? dynamicAccessory}
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
                <RotateCcw size={10} />
              </button>
            )}
            {isOverridden && !onReset && (
              <span
                className="builder-inheritance-dot-only"
                title={inheritedValueText ? `Overridden (Global: ${inheritedValueText})` : "Overridden property"}
              />
            )}
          </div>
        </div>
      )}
      <div className="inspector-field-row-control">
        {activeDynamicBinding && dynamicBinding && label ? (
          <DynamicFieldBindingControl
            destination={dynamicBinding.destination}
            label={label}
            descriptor={dynamicBinding.descriptor}
            binding={activeDynamicBinding}
            onChange={(binding) => dynamicBinding.onChange(dynamicBinding.destination, binding)}
            presentation="surface"
          />
        ) : children}
      </div>
      {(help || description) && (
        <div className="inspector-field-row-help">
          <InspectorHelpText>{help || description}</InspectorHelpText>
        </div>
      )}
    </div>
  );
}


export function InspectorSection({ title, description, children, className = "" }: FieldProps & { title: string }) {
  return (
    <section className={`inspector-section ${className}`.trim()}>
      <div className="inspector-section-heading">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function InspectorDivision({
  title,
  description,
  children,
  onResetAll,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onResetAll?: () => void;
  summary?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <section className={`builder-inspector-division ${className}`.trim()}>
      <div className="builder-inspector-division-header" title={description || undefined}>
        <span className="builder-inspector-division-title-group">
          <span className="builder-inspector-division-title">{title}</span>
        </span>
        {onResetAll && (
          <button
            type="button"
            className="builder-inspector-division-reset-btn"
            onClick={onResetAll}
            title={`Reset all ${title} settings to global defaults`}
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>
      <div className="builder-inspector-division-content">{children}</div>
      {description && <p className="builder-inspector-division-desc">{description}</p>}
    </section>
  );
}



export function InspectorHelpText({ children }: { children: ReactNode }) {
  return <small className="inspector-help-text">{children}</small>;
}

export function InspectorSelect<T extends string = string>({ value, options, onChange, disabled = false, ariaLabel, testId }: {
  value: T | undefined;
  options: readonly InspectorOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
  testId?: string;
}) {
  return <select className="inspector-control inspector-select" data-testid={testId} aria-label={ariaLabel} value={value} disabled={disabled} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value as T)}>{options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>;
}

export function InspectorStyleSelect<T extends string = string>({ value, options, onChange, ariaLabel }: {
  value: T | undefined;
  options: readonly InspectorOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];
  const styleClass = String(value ?? "").replace(/[^a-z0-9_-]/gi, "-");
  return <div className={`inspector-style-select inspector-style-select--${styleClass}`}>
    <span className="inspector-style-select-preview" aria-hidden="true">{selected?.label ?? "Select style"}</span>
    <div className="inspector-style-select-picker">
    <select className="inspector-control inspector-select inspector-style-select-native" aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    </div>
  </div>;
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

export function InspectorPillGroup<T extends string = string>(props: { value: T | undefined; options: readonly InspectorOption<T>[]; onChange: (value: T) => void; ariaLabel?: string; className?: string }) {
  const { className = "", ...controlProps } = props;
  return <div className={`inspector-pill-group ${className}`.trim()}><InspectorSegmentedControl {...controlProps} /></div>;
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

export function InspectorTextField({ value, onChange, placeholder, ariaLabel, disabled = false, testId, onBlur, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; ariaLabel?: string; disabled?: boolean; testId?: string; onBlur?: () => void; type?: "text" | "number" }) {
  return <input className="inspector-control inspector-text-field" data-testid={testId} type={type} aria-label={ariaLabel} value={value} placeholder={placeholder} disabled={disabled} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} />;
}

export function InspectorTextarea({ value, onChange, placeholder, ariaLabel }: { value: string; onChange: (value: string) => void; placeholder?: string; ariaLabel?: string }) {
  return <textarea className="inspector-control inspector-textarea" aria-label={ariaLabel} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

export function InspectorRange({ value, min, max, step, onChange, ariaLabel, disabled = false, className = "" }: {
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const progress = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <input
      type="range"
      disabled={disabled}
      className={`inspector-range ${className}`.trim()}
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      style={{ "--inspector-range-progress": `${progress}%` } as CSSProperties}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  );
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
