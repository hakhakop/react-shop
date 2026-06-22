"use client";

import React, { ChangeEvent } from "react";
import { GalleryHorizontal, Sliders } from "lucide-react";
import {
  resolveBuilderSpacing,
  BUILDER_SPACING_SCALE,
  TOKEN_LABELS,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import type { CategoryTreeItem } from "@/lib/categories";

// SpacingControl
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

// Choice Group
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
    <div className="builder-inspector-choice-group">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
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
  return (
    <div className="builder-media-url-row">
      <input value={value} placeholder={placeholder} onChange={onChange} />
      <button type="button" onClick={onChoose}>
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
import { useState } from "react";
import { useInspector } from "@/components/dashboard/context/InspectorContext";

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

