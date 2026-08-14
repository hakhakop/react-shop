"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Pencil, X } from "lucide-react";
import type {
  DynamicContentContextDescriptor,
  DynamicFieldBinding,
} from "@/lib/dynamicContent";
import {
  dynamicBindingDestinationCapability,
  dynamicContentSourceCapability,
  dynamicContentSourceFields,
  type DynamicBindingDestination,
} from "@/lib/dynamicContentCapabilities";

type Props = {
  destination: DynamicBindingDestination;
  label?: string;
  descriptor?: DynamicContentContextDescriptor;
  binding?: DynamicFieldBinding;
  onChange: (binding: DynamicFieldBinding | undefined) => void;
};

export default function DynamicFieldBindingControl({
  destination,
  label,
  descriptor,
  binding,
  onChange,
}: Props) {
  const destinationCapability = dynamicBindingDestinationCapability(destination);
  const fieldLabel = label ?? destinationCapability?.label ?? destination;
  const acceptedTypes = useMemo(
    () => destinationCapability?.acceptedTypes ?? [],
    [destinationCapability],
  );
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 280 });
  const fields = useMemo(
    () => dynamicContentSourceFields(descriptor).filter((field) =>
      acceptedTypes.includes(field.valueType),
    ),
    [acceptedTypes, descriptor],
  );
  const visibleFields = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return fields;
    return fields.filter((field) =>
      `${field.label} ${field.path}`.toLowerCase().includes(query),
    );
  }, [fields, search]);
  const selectedField = fields.find((field) => field.path === binding?.path);
  const sourceLabel = dynamicContentSourceCapability(descriptor)?.label ?? "Dynamic Content";

  const updatePickerPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const inspector = trigger.closest(".builder-inspector") as HTMLElement | null;
    const inspectorRect = inspector?.getBoundingClientRect();
    const viewportPadding = 10;
    const boundaryLeft = Math.max(viewportPadding, inspectorRect?.left ?? viewportPadding);
    const boundaryRight = Math.min(
      window.innerWidth - viewportPadding,
      inspectorRect?.right ?? window.innerWidth - viewportPadding,
    );
    const width = Math.max(190, Math.min(280, boundaryRight - boundaryLeft - 16));
    const pickerHeight = Math.min(320, window.innerHeight - viewportPadding * 2);
    const belowTop = triggerRect.bottom + 6;
    const aboveTop = triggerRect.top - pickerHeight - 6;
    const boundaryTop = Math.max(viewportPadding, inspectorRect?.top ?? viewportPadding);
    const boundaryBottom = Math.min(
      window.innerHeight - viewportPadding,
      inspectorRect?.bottom ?? window.innerHeight - viewportPadding,
    );
    const top = belowTop + pickerHeight <= boundaryBottom
      ? belowTop
      : Math.max(boundaryTop + viewportPadding, aboveTop);
    const left = Math.max(
      boundaryLeft + 8,
      Math.min(triggerRect.left, boundaryRight - width - 8),
    );

    setPickerPosition({
      top: Math.max(boundaryTop + 8, Math.min(top, boundaryBottom - pickerHeight - 8)),
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePickerPosition();
    const handleViewportChange = () => updatePickerPosition();
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !pickerRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, updatePickerPosition]);

  if (!descriptor || !destinationCapability || fields.length === 0) return null;

  const selectField = (path: string) => {
    const field = fields.find((candidate) => candidate.path === path);
    if (!field) return;
    onChange({ path: field.path, valueType: field.valueType });
    setOpen(false);
    setSearch("");
  };

  return (
    <span
      className="builder-dynamic-binding-control"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        marginLeft: "auto",
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="builder-inspector-secondary-button"
        aria-expanded={open}
        aria-label={`${fieldLabel} dynamic binding`}
        onClick={() => setOpen((current) => !current)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          padding: "2px 5px",
          minHeight: "22px",
          fontSize: "11px",
          whiteSpace: "nowrap",
        }}
      >
        <span>{selectedField ? `${selectedField.label} — ${sourceLabel}` : "Dynamic"}</span>
        {selectedField ? <Pencil size={11} aria-hidden="true" /> : <ChevronDown size={11} aria-hidden="true" />}
      </button>

      {selectedField && (
        <button
          type="button"
          className="builder-inspector-secondary-button"
          aria-label={`Remove ${fieldLabel} dynamic binding`}
          onClick={() => {
            onChange(undefined);
            setOpen(false);
            setSearch("");
          }}
          title={`Remove ${fieldLabel} dynamic binding`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px",
            minHeight: "22px",
            minWidth: "22px",
          }}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={pickerRef}
          className="builder-dynamic-binding-picker"
          data-inspector-owned-portal
          role="dialog"
          aria-label={`${fieldLabel} dynamic field picker`}
          style={{
            position: "fixed",
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 999999,
            width: `${pickerPosition.width}px`,
            maxHeight: "min(320px, calc(100vh - 20px))",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: "8px",
            border: "1px solid var(--builder-inspector-border, #d8d8d8)",
            borderRadius: "6px",
            background: "var(--builder-ui-panel, #fff)",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.22)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "0 0 auto" }}>
            <div className="builder-inspector-row-desc">
              Choose a field from {sourceLabel} for {fieldLabel}.
            </div>
            <input
              className="inspector-control inspector-text-field"
              type="search"
              value={search}
              placeholder="Search fields"
              aria-label={`${fieldLabel} dynamic field search`}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto", marginTop: "6px" }}>
            {visibleFields.length > 0 ? visibleFields.map((field) => (
              <button
                key={field.path}
                type="button"
                className={`builder-inspector-picker-option${field.path === binding?.path ? " is-selected" : ""}`}
                aria-pressed={field.path === binding?.path}
                onClick={() => selectField(field.path)}
                style={{ textAlign: "left" }}
              >
                <span>{field.label}</span>
                {field.path === binding?.path && <span aria-hidden="true">✓</span>}
              </button>
            )) : (
              <div className="builder-inspector-row-desc">No compatible fields found.</div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </span>
  );
}
