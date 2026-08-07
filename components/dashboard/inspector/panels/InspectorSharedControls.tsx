"use client";

import React, { ChangeEvent, ReactNode, useState } from "react";
import { GalleryHorizontal, Sliders, Image as ImageIcon, RotateCcw, ChevronDown, Check } from "lucide-react";
import {
  resolveBuilderSpacing,
  BUILDER_SPACING_SCALE,
  TOKEN_LABELS,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import type { CategoryTreeItem } from "@/lib/categories";
import { useInspector } from "@/components/dashboard/context/InspectorContext";
import { InspectorSegmentedControl } from "@/components/dashboard/inspector/InspectorControls";

/**
 * Visual pill/indicator showing whether a property is inheriting from Global Settings or locally overridden.
 */
export function InheritanceIndicator({
  isOverridden,
  inheritedValueText,
}: {
  isOverridden: boolean;
  inheritedValueText?: string;
}) {
  return (
    <span
      className={`builder-inheritance-pill ${isOverridden ? "is-overridden" : "is-inherited"}`}
      title={isOverridden ? "Locally overridden property" : `Inheriting global: ${inheritedValueText || "Default"}`}
    >
      <span className="builder-inheritance-dot" />
      <span className="builder-inheritance-text">
        {isOverridden ? "Override" : inheritedValueText ? `Global (${inheritedValueText})` : "Inherit"}
      </span>
    </span>
  );
}

/**
 * One-click reset button to clear local property override and return to inheritance chain.
 */
export function OneClickReset({
  onReset,
  title = "Reset to global default",
}: {
  onReset: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      className="builder-one-click-reset-btn"
      onClick={(e) => {
        e.stopPropagation();
        onReset();
      }}
      title={title}
      aria-label={title}
    >
      <RotateCcw size={11} />
    </button>
  );
}

/**
 * YOOtheme-style Inspector Division Card grouping related rows with section title,
 * optional description, and optional 1-click section reset.
 */
export function InspectorDivision({
  title,
  description,
  onResetAll,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  onResetAll?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`builder-inspector-division ${className}`}>
      <div className="builder-inspector-division-header">
        <div className="builder-inspector-division-title-group">
          <span className="builder-inspector-division-title">{title}</span>
          {description && <span className="builder-inspector-division-desc">{description}</span>}
        </div>
        {onResetAll && (
          <button
            type="button"
            className="builder-inspector-division-reset-btn"
            onClick={onResetAll}
            title={`Reset all ${title} settings to global defaults`}
          >
            <RotateCcw size={10} />
            <span>Reset Division</span>
          </button>
        )}
      </div>
      <div className="builder-inspector-division-content">{children}</div>
    </div>
  );
}

/**
 * YOOtheme-style Standardized 2-Column Inspector Row.
 * Left: Label + Override/Inherit indicator + Reset button.
 * Right: Control element.
 */
export function InspectorRow({
  label,
  description,
  isOverridden = false,
  inheritedValueText,
  onReset,
  children,
  layout = "auto",
  className = "",
}: {
  label: string;
  description?: string;
  isOverridden?: boolean;
  inheritedValueText?: string;
  onReset?: () => void;
  children: ReactNode;
  layout?: "auto" | "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div className={`builder-inspector-row ${isOverridden ? "has-override" : ""} layout-${layout} ${className}`}>
      <div className="builder-inspector-row-header">
        <span className="builder-inspector-row-label">
          <span>{label}</span>
          {onReset && isOverridden && (
            <OneClickReset onReset={onReset} title={`Reset ${label} to global default (${inheritedValueText || "Global"})`} />
          )}
          {isOverridden && (
            <InheritanceIndicator isOverridden={isOverridden} inheritedValueText={inheritedValueText} />
          )}
        </span>
      </div>
      {description && <div className="builder-inspector-row-desc">{description}</div>}
      <div className="builder-inspector-row-control">{children}</div>
    </div>
  );
}

/**
 * Compact YOOtheme-style Segmented Control button group.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className = "",
}: {
  value: T | undefined;
  options: readonly { label: string; value: T; icon?: ReactNode; title?: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`builder-segmented-control ${disabled ? "is-disabled" : ""} ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            title={option.title || option.label}
            className={`builder-segmented-control-item ${isSelected ? "is-selected" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.icon && <span className="builder-segmented-control-icon">{option.icon}</span>}
            <span className="builder-segmented-control-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Standardized Inspector Token Select dropdown with clean UIkit semantics & custom chevron styling.
 */
export function InspectorTokenSelect<T extends string>({
  value,
  options,
  onChange,
  placeholder = "Inherit Global",
  disabled = false,
}: {
  value: T | undefined;
  options: readonly { label: string; value: T }[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="builder-inspector-token-select-wrap">
      <select
        value={value ?? ""}
        disabled={disabled}
        className="builder-inspector-token-select"
        onChange={(e) => onChange(e.target.value as T)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="builder-inspector-token-select-arrow" aria-hidden="true">
        <ChevronDown size={12} />
      </div>
    </div>
  );
}

/**
 * SpacingControl primitive with presets, inherit token, and custom input.
 */
export function SpacingControl({
  id,
  label,
  value,
  context,
  inheritedValue,
  allowInherit = true,
  onChange,
}: {
  id: string;
  label: string;
  value: string | undefined;
  context: BuilderSpacingContext;
  inheritedValue?: string;
  allowInherit?: boolean;
  onChange: (newValue: string) => void;
}) {
  const presets = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

  const isPresetToken = (val: string) => {
    return (
      val === "none" ||
      val === "xs" ||
      val === "sm" ||
      val === "md" ||
      val === "lg" ||
      val === "xl" ||
      val === "2xl" ||
      val === "3xl" ||
      val === "small" ||
      val === "medium" ||
      val === "large"
    );
  };

  const isPreset = !value || value === "inherit" || isPresetToken(value);
  const isCustom = !isPreset;

  const numericMatch = value ? value.trim().match(/^(\d+)px$/i) : null;
  const customNumericValue = numericMatch ? numericMatch[1] : "";

  const handleCustomNumericChange = (event: ChangeEvent<HTMLInputElement>) => {
    const num = event.target.value.replace(/\D/g, "");
    onChange(num ? `${num}px` : "0px");
  };

  let selectValue = "inherit";
  if (isCustom) {
    selectValue = "custom";
  } else if (value) {
    if (value === "small") selectValue = "sm";
    else if (value === "medium") selectValue = "md";
    else if (value === "large") selectValue = "lg";
    else selectValue = value;
  } else {
    selectValue = allowInherit ? "inherit" : "sm";
  }

  const handleChipClick = (presetValue: string) => {
    if (presetValue === "custom") {
      const currentPx = resolveBuilderSpacing(
        value ?? (allowInherit ? "inherit" : "sm"),
        context,
        inheritedValue,
      ).px;
      onChange(`${currentPx > 0 ? currentPx : 16}px`);
    } else {
      onChange(presetValue);
    }
  };

  return (
    <div className="builder-field spacing-control-wrapper" id={id}>
      <span className="builder-style-side-label-wrapper">{label}</span>
      <div className="spacing-control-row">
        <div className="builder-style-chips-row">
          {allowInherit && (
            <button
              type="button"
              className={`builder-style-chip${selectValue === "inherit" ? " is-active" : ""}`}
              onClick={() => handleChipClick("inherit")}
              title={`Inherit global: ${resolveBuilderSpacing(undefined, context, inheritedValue).label}`}
            >
              Global
            </button>
          )}
          {presets.map((preset) => {
            const isSelected = selectValue === preset;
            const px = BUILDER_SPACING_SCALE[preset];
            const labelName = TOKEN_LABELS[preset];
            const displayLabel = `${labelName === "None" ? "None" : labelName} ${px}px`;
            return (
              <button
                key={preset}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => handleChipClick(preset)}
              >
                {displayLabel}
              </button>
            );
          })}
          <button
            type="button"
            className={`builder-style-chip builder-style-chip--custom${selectValue === "custom" ? " is-active" : ""}`}
            onClick={() => handleChipClick("custom")}
          >
            <Sliders size={11} style={{ marginRight: "4px" }} />
            Custom
          </button>
        </div>
        {isCustom && (
          <div className="custom-spacing-input-wrapper">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={customNumericValue}
              onChange={handleCustomNumericChange}
              placeholder="0"
            />
            <span className="custom-spacing-unit">px</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Choice Group (Delegates to Canonical InspectorSegmentedControl)
export function InspectorChoiceGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <InspectorSegmentedControl
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}

// Image URL Control
export function BuilderImageUrlControl({
  value,
  placeholder = "https://... or /uploads/image.jpg",
  onChange,
  onChoose,
}: {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChoose: () => void;
}) {
  const hasImage = Boolean(value && value.trim());

  return (
    <div className="builder-media-url-row">
      <div className="builder-media-url-input-wrap">
        {hasImage ? (
          <img
            src={value}
            alt="Preview"
            className="builder-media-url-thumbnail"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="builder-media-url-thumbnail-empty">
            <ImageIcon size={14} />
          </div>
        )}
        <input value={value} placeholder={placeholder} onChange={onChange} />
      </div>
      <button type="button" onClick={onChoose} className="builder-media-url-choose-btn">
        <GalleryHorizontal size={14} />
        Library
      </button>
    </div>
  );
}

// Inspector Group Summary
export function InspectorGroupSummary({
  title,
  description,
  meta,
}: {
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <>
      <span className="builder-group-summary-copy">
        <strong>{title}</strong>
        {description ? <em>{description}</em> : null}
      </span>
      {meta ? <small>{meta}</small> : null}
    </>
  );
}

// Category flattening helper
export function flattenCategoryTree(
  categoryTree: CategoryTreeItem[],
  depth = 0,
): { label: string; slug: string }[] {
  return categoryTree.flatMap((category) => [
    { label: `${"— ".repeat(depth)}${category.name}`, slug: category.slug },
    ...flattenCategoryTree(category.children, depth + 1),
  ]);
}

// Category Visibility Control Component
export function CategoryVisibilityControl({
  hiddenSlugs,
  onChange,
  description = "Hide categories only for this element.",
}: {
  hiddenSlugs?: string[];
  onChange: (hiddenSlugs: string[]) => void;
  description?: string;
}) {
  const { previewCategoryTree } = useInspector();
  const [categoryHideSearch, setCategoryHideSearch] = useState("");

  const categoryFilterOptions = flattenCategoryTree(previewCategoryTree);
  const filteredCategoryFilterOptions = categoryFilterOptions.filter((category) => {
    const query = categoryHideSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      category.label.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  });

  return (
    <div className="builder-category-visibility-card">
      <div className="builder-category-visibility-head">
        <div>
          <strong>Category Visibility</strong>
          <span>{description}</span>
        </div>
        <small>
          {(hiddenSlugs ?? []).length > 0
            ? `${(hiddenSlugs ?? []).length} hidden`
            : "All visible"}
        </small>
      </div>
      {categoryFilterOptions.length > 0 ? (
        <>
          <input
            className="builder-category-search"
            type="search"
            value={categoryHideSearch}
            onChange={(event) => setCategoryHideSearch(event.target.value)}
            placeholder="Search categories..."
          />
          <div className="builder-category-hide-list">
            {filteredCategoryFilterOptions.map((category) => {
              const currentHiddenSlugs = hiddenSlugs ?? [];
              const isHidden = currentHiddenSlugs.includes(category.slug);

              return (
                <label
                  key={category.slug}
                  className={`builder-category-hide-option ${
                    isHidden ? "is-hidden" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={(event) => {
                      const nextHidden = event.target.checked
                        ? [...currentHiddenSlugs, category.slug]
                        : currentHiddenSlugs.filter(
                            (slug) => slug !== category.slug,
                          );
                      onChange([...new Set(nextHidden)]);
                    }}
                  />
                  <span className="builder-category-hide-copy">
                    <strong>{category.label}</strong>
                    <em>{category.slug}</em>
                  </span>
                  <span className="builder-category-hide-status">
                    {isHidden ? "Hidden" : "Visible"}
                  </span>
                </label>
              );
            })}
            {filteredCategoryFilterOptions.length === 0 && (
              <div className="builder-category-hide-empty">
                No matching categories.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="builder-category-hide-empty">
          No categories available.
        </div>
      )}
    </div>
  );
}
