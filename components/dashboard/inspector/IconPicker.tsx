"use client";

import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import {
  getUikitIconLabel,
  resolveUikitIconName,
  UIKIT_ICON_OPTIONS,
} from "@/lib/uikitIconRegistry";

type Props = {
  value?: string | null;
  onChange: (value: string) => void;
  onClear?: () => void;
  ariaLabel?: string;
};

/** Shared visual UIkit icon browser for all compatible inspectors. */
export default function IconPicker({ value, onChange, onClear, ariaLabel = "Icon" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = resolveUikitIconName(value);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(
    () =>
      normalizedQuery
        ? UIKIT_ICON_OPTIONS.filter(
            (option) =>
              option.name.includes(normalizedQuery) ||
              option.label.toLowerCase().includes(normalizedQuery) ||
              option.keywords.includes(normalizedQuery),
          )
        : UIKIT_ICON_OPTIONS,
    [normalizedQuery],
  );

  useEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const clear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  const select = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const stopPickerPointerEvent = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div className="webpages-icon-picker" data-icon-picker>
      <div className="webpages-icon-picker__trigger-row">
        <button
          type="button"
          className="webpages-icon-picker__trigger"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`Choose ${ariaLabel.toLowerCase()}`}
        >
          {selected ? <WebPagesIcon name={selected} size={18} /> : <Search size={17} aria-hidden="true" />}
          <span>{selected ? getUikitIconLabel(selected) : "Choose icon"}</span>
        </button>
        {selected && (
          <button
            type="button"
            className="webpages-icon-picker__clear"
            onClick={clear}
            aria-label={`Remove ${getUikitIconLabel(selected)} icon`}
          >
            <X size={14} aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <div
          className="webpages-icon-picker__backdrop"
          data-inspector-owned-portal
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
          className="webpages-icon-picker__dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${ariaLabel} browser`}
            onPointerDown={stopPickerPointerEvent}
            onPointerUp={stopPickerPointerEvent}
            onMouseDown={stopPickerPointerEvent}
            onClick={stopPickerPointerEvent}
          >
            <div className="webpages-icon-picker__dialog-header">
              <div>
                <strong>Choose icon</strong>
                <span>{selected ? `Current: ${getUikitIconLabel(selected)}` : "UIkit icon library"}</span>
              </div>
              <button
                type="button"
                className="webpages-icon-picker__close"
                onClick={() => setIsOpen(false)}
                aria-label="Close icon browser"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="webpages-icon-picker__toolbar">
              <label className="webpages-icon-picker__search">
                <span className="sr-only">Search {ariaLabel.toLowerCase()}s</span>
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search icons"
                  aria-label={`Search ${ariaLabel.toLowerCase()}s`}
                />
              </label>
              <span className="webpages-icon-picker__count" aria-live="polite">
                {filteredOptions.length} icons
              </span>
            </div>
            <div className="webpages-icon-picker__grid" role="listbox" aria-label={`${ariaLabel} choices`}>
              {filteredOptions.map((option) => {
                const isSelected = option.name === selected;
                return (
                  <button
                    type="button"
                    key={option.name}
                    className={`webpages-icon-picker__option${isSelected ? " is-selected" : ""}`}
                    data-icon-option={option.name}
                    aria-label={option.label}
                    aria-selected={isSelected}
                    role="option"
                    onPointerDown={stopPickerPointerEvent}
                    onPointerUp={stopPickerPointerEvent}
                    onClick={(event) => {
                      event.stopPropagation();
                      select(option.name);
                    }}
                  >
                    <WebPagesIcon name={option.name} size={24} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
              {filteredOptions.length === 0 && (
                <p className="webpages-icon-picker__empty">No UIkit icons match this search.</p>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  );
}
