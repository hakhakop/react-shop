"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { CategoryVisibilityControl } from "./InspectorSharedControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function ProductQueryPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock || selectedLayoutBlock.kind !== "products") return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      <details className="builder-collapse" open>
        <summary>
          <span>Product Query</span>
          <small>{block.source ?? "all"}</small>
        </summary>
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Block Title</span>
            <input
              value={block.title ?? ""}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({
                  title: event.target.value,
                })
              }
            />
          </label>
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Limit</span>
              <input
                type="number"
                min={2}
                max={12}
                value={block.gridLimit ?? 4}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    gridLimit: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Source</span>
              <select
                value={block.source ?? "all"}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    source: event.target.value as BuilderLayoutBlock["source"],
                  })
                }
              >
                <option value="all">All products</option>
                <option value="featured">Featured</option>
                <option value="category">Category</option>
              </select>
            </label>
          </div>
          {block.source === "category" && (
            <label className="builder-field">
              <span>Category Slug / ID</span>
              <input
                value={block.categoryId ?? ""}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    categoryId: event.target.value,
                  })
                }
              />
            </label>
          )}
          <CategoryVisibilityControl
            hiddenSlugs={block.hiddenCategorySlugs}
            description="Hide categories from this product archive filter UI."
            onChange={(hiddenSlugs) =>
              updateSelectedLayoutBlockByKey({
                hiddenCategorySlugs: hiddenSlugs,
              })
            }
          />
        </div>
      </details>

      <details className="builder-collapse" open>
        <summary>
          <span>Pagination</span>
          <small>
            {(block.pagination?.enabled ?? false)
              ? `${block.pagination?.perPage ?? 12}/page`
              : "Off"}
          </small>
        </summary>
        <div className="builder-inspector-section">
          <label className="builder-check">
            <input
              type="checkbox"
              checked={block.pagination?.enabled ?? false}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({
                  pagination: {
                    ...(block.pagination ?? {
                      enabled: false,
                      perPage: 12,
                      mode: "pageNumbers" as const,
                      infiniteScroll: false,
                      style: "standard" as const,
                    }),
                    enabled: event.target.checked,
                  },
                })
              }
            />
            <span>Pagination Enabled</span>
          </label>

          {(block.pagination?.enabled ?? false) && (
            <>
              <label className="builder-field">
                <span>Products Per Page</span>
                <input
                  type="number"
                  min={4}
                  max={48}
                  step={1}
                  value={block.pagination?.perPage ?? 12}
                  onChange={(event) =>
                    updateSelectedLayoutBlockByKey({
                      pagination: {
                        ...(block.pagination ?? {
                          enabled: true,
                          perPage: 12,
                          mode: "pageNumbers" as const,
                          infiniteScroll: false,
                          style: "standard" as const,
                        }),
                        perPage: Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
              <label className="builder-field">
                <span>Pagination Type</span>
                <select
                  value={block.pagination?.mode ?? "pageNumbers"}
                  onChange={(event) => {
                    const typeVal = event.target.value as
                      | "pageNumbers"
                      | "loadMore"
                      | "infinite";
                    updateSelectedLayoutBlockByKey({
                      pagination: {
                        ...(block.pagination ?? {
                          enabled: true,
                          perPage: 12,
                          mode: "pageNumbers" as const,
                          infiniteScroll: false,
                          style: "standard" as const,
                        }),
                        mode: typeVal,
                        infiniteScroll: typeVal === "infinite",
                      },
                    });
                  }}
                >
                  <option value="pageNumbers">Page Numbers</option>
                  <option value="loadMore">Load More</option>
                  <option value="infinite">Infinite Scroll</option>
                </select>
              </label>
              <label className="builder-field">
                <span>Pagination Style</span>
                <select
                  value={block.pagination?.style ?? "standard"}
                  onChange={(event) =>
                    updateSelectedLayoutBlockByKey({
                      pagination: {
                        ...(block.pagination ?? {
                          enabled: true,
                          perPage: 12,
                          mode: "pageNumbers" as const,
                        }),
                        style: event.target.value as any,
                      },
                    })
                  }
                >
                  <option value="standard">Standard</option>
                  <option value="solid">Solid / Filled</option>
                  <option value="minimal">Minimal / Borderless</option>
                  <option value="rounded">Rounded Circle</option>
                </select>
              </label>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
