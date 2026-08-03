"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
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
  const [query, setQuery] = useState("");
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

  return (
    <div className="webpages-icon-picker" data-icon-picker>
      <div className="webpages-icon-picker__toolbar">
        <label className="webpages-icon-picker__search">
          <span className="sr-only">Search {ariaLabel.toLowerCase()}s</span>
          <input
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
        {selected && (
          <button
            type="button"
            className="webpages-icon-picker__clear"
            onClick={() => {
              if (onClear) onClear();
              else onChange("");
            }}
            aria-label={`Remove ${getUikitIconLabel(selected)} icon`}
          >
            <X size={14} aria-hidden="true" />
            Clear
          </button>
        )}
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
              onClick={() => onChange(option.name)}
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
    </div>
  );
}
