"use client";

import React from "react";
import Image from "next/image";
import { GalleryHorizontal, ImageIcon } from "lucide-react";
import { useGlobalStyles } from "../context/GlobalStylesContext";
import { InspectorChoiceGroup } from "../inspector/panels/InspectorSharedControls";
import type {
  BuilderHeaderIconId,
  BuilderHeaderIconVariant,
  BuilderHeaderBackgroundMode,
  BuilderHeaderTextMode,
  BuilderHeaderBrandMode,
  BuilderHeaderActiveIndicator,
} from "../builderTypes";

const headerIconOptions: {
  id: BuilderHeaderIconId;
  label: string;
}[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "cart", label: "Cart" },
  { id: "account", label: "Account" },
  { id: "theme", label: "Night mode" },
  { id: "search", label: "Search" },
];

export default function GlobalHeaderPanel() {
  const {
    shellSettings,
    updateShellSettings,
    applyHeaderPreset,
    openWordPressMediaPicker,
    updateHeaderIcon,
  } = useGlobalStyles();

  return (
    <div className="builder-global-styles-group">
      <div className="builder-card-title">
        <strong>Header</strong>
        <span>layout + spacing</span>
      </div>

      <label className="builder-check">
        <input
          type="checkbox"
          checked={shellSettings.headerVisible}
          onChange={(event) =>
            updateShellSettings({
              headerVisible: event.target.checked,
            })
          }
        />
        <span>Show website header</span>
      </label>

      <div className="builder-card-title">
        <strong>Top Toolbar</strong>
        <span>message + meta</span>
      </div>

      <label className="builder-check">
        <input
          type="checkbox"
          checked={shellSettings.topToolbarVisible}
          onChange={(event) =>
            updateShellSettings({
              topToolbarVisible: event.target.checked,
            })
          }
        />
        <span>Show top toolbar</span>
      </label>

      <label className="builder-field">
        <span>Toolbar Text</span>
        <input
          type="text"
          value={shellSettings.topToolbarText}
          onChange={(event) =>
            updateShellSettings({
              topToolbarText: event.target.value,
            })
          }
          placeholder="Fast support & setup by Webpages"
        />
      </label>

      <div className="builder-two-column">
        <label className="builder-field">
          <span>Phone / Support</span>
          <input
            type="text"
            value={shellSettings.topToolbarPhone}
            onChange={(event) =>
              updateShellSettings({
                topToolbarPhone: event.target.value,
              })
            }
            placeholder="+374 xx xx xx"
          />
        </label>

        <label className="builder-field">
          <span>Right Meta</span>
          <input
            type="text"
            value={shellSettings.topToolbarMeta}
            onChange={(event) =>
              updateShellSettings({
                topToolbarMeta: event.target.value,
              })
            }
            placeholder="AMD ֏"
          />
        </label>
      </div>

      <label className="builder-field">
        <span>Header Background</span>
        <InspectorChoiceGroup
          value={shellSettings.headerBackgroundMode}
          options={[
            { label: "Solid", value: "default" },
            { label: "Glass", value: "glass" },
            { label: "Accent", value: "accent" },
            { label: "None", value: "none" },
          ]}
          onChange={(value) =>
            updateShellSettings({
              headerBackgroundMode: value as BuilderHeaderBackgroundMode,
            })
          }
        />
      </label>

      <label className="builder-field">
        <span>Header Text Mode</span>
        <InspectorChoiceGroup
          value={shellSettings.headerTextMode || "auto"}
          options={[
            { label: "Auto", value: "auto" },
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ]}
          onChange={(value) =>
            updateShellSettings({
              headerTextMode: value as BuilderHeaderTextMode,
            })
          }
        />
      </label>

      <div className="builder-field">
        <span>Header Style & Layout</span>
        <div className="builder-header-presets-grid">
          <button
            type="button"
            className={`builder-preset-btn ${shellSettings.headerLayout === "princity" ? "is-active" : ""}`}
            onClick={() => applyHeaderPreset("service")}
          >
            <span>Princity Service</span>
            <small>Flat layout, text logo</small>
          </button>
          <button
            type="button"
            className={`builder-preset-btn ${shellSettings.headerLayout === "pill" ? "is-active" : ""}`}
            onClick={() => applyHeaderPreset("commerce")}
          >
            <span>Commerce Pill</span>
            <small>Floating pill on scroll</small>
          </button>
          <button
            type="button"
            className={`builder-preset-btn ${shellSettings.headerLayout === "two-row" ? "is-active" : ""}`}
            onClick={() => applyHeaderPreset("classic")}
          >
            <span>Classic Store</span>
            <small>Traditional two-row links</small>
          </button>
          <button
            type="button"
            className={`builder-preset-btn ${shellSettings.headerLayout === "simple" ? "is-active" : ""}`}
            onClick={() => applyHeaderPreset("simple")}
          >
            <span>Simple Store</span>
            <small>Single row layout</small>
          </button>
          <button
            type="button"
            className={`builder-preset-btn ${shellSettings.headerLayout === "hero" ? "is-active" : ""}`}
            onClick={() => applyHeaderPreset("hero")}
          >
            <span>Hero Spotlight</span>
            <small>Split layout with hero banner</small>
          </button>
        </div>
      </div>

      <div className="builder-two-column">
        <label className="builder-field">
          <span>Brand Display</span>
          <InspectorChoiceGroup
            value={shellSettings.headerBrandMode}
            options={[
              { label: "Logo", value: "logo" },
              { label: "Text", value: "brand" },
              { label: "Both", value: "both" },
            ]}
            onChange={(value) =>
              updateShellSettings({
                headerBrandMode: value as BuilderHeaderBrandMode,
              })
            }
          />
        </label>

        <label className="builder-field">
          <span>Logo Width</span>
          <input
            type="number"
            min="40"
            max="360"
            value={shellSettings.headerLogoMaxWidth}
            onChange={(event) =>
              updateShellSettings({
                headerLogoMaxWidth: Number(event.target.value),
              })
            }
          />
        </label>
      </div>

      <label className="builder-field">
        <span>Brand Text</span>
        <input
          type="text"
          value={shellSettings.headerBrandText}
          onChange={(event) =>
            updateShellSettings({
              headerBrandText: event.target.value,
            })
          }
          placeholder="WebPages"
        />
      </label>

      <div className="builder-field">
        <span>Logo Image</span>
        <div className="builder-header-logo-picker">
          <div className="builder-header-logo-preview">
            {shellSettings.headerLogoUrl ? (
              <Image
                src={shellSettings.headerLogoUrl ?? ""}
                alt={
                  shellSettings.headerLogoAlt ||
                  shellSettings.headerBrandText ||
                  "Site logo"
                }
                width={120}
                height={72}
                unoptimized
              />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>
          <div className="builder-header-logo-actions">
            <button
              type="button"
              onClick={() =>
                openWordPressMediaPicker({
                  title: "Header Logo",
                  currentUrl: shellSettings.headerLogoUrl ?? "",
                  onSelect: (media) =>
                    updateShellSettings({
                      headerLogoUrl: media.sourceUrl,
                      headerLogoAlt:
                        shellSettings.headerLogoAlt ||
                        media.altText ||
                        media.title ||
                        "Site logo",
                    }),
                })
              }
            >
              <GalleryHorizontal size={14} />
              Choose from library
            </button>
            {shellSettings.headerLogoUrl ? (
              <button
                type="button"
                className="is-muted"
                onClick={() => updateShellSettings({ headerLogoUrl: null })}
              >
                Clear
              </button>
            ) : null}
            <small>
              {shellSettings.headerLogoUrl
                ? "Logo selected from WordPress media."
                : "Select an image from WordPress media."}
            </small>
          </div>
        </div>
      </div>

      <label className="builder-field">
        <span>Logo Alt Text</span>
        <input
          type="text"
          value={shellSettings.headerLogoAlt}
          onChange={(event) =>
            updateShellSettings({
              headerLogoAlt: event.target.value,
            })
          }
          placeholder="Site logo"
        />
      </label>

      <div className="builder-two-column">
        <label className="builder-field">
          <span>Icon Style</span>
          <select
            value={shellSettings.headerIconVariant}
            onChange={(event) =>
              updateShellSettings({
                headerIconVariant: event.target.value as BuilderHeaderIconVariant,
              })
            }
          >
            <option value="muted">Muted</option>
            <option value="ghost">Ghost</option>
            <option value="solid">Solid</option>
            <option value="icon">Icon only</option>
          </select>
        </label>

        <label className="builder-field">
          <span>Active Indicator</span>
          <select
            value={shellSettings.headerActiveIndicator}
            onChange={(event) =>
              updateShellSettings({
                headerActiveIndicator: event.target.value as BuilderHeaderActiveIndicator,
              })
            }
          >
            <option value="princity">Princity motion</option>
            <option value="underline">Underline</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>

      <div className="builder-field">
        <span>Header Icons</span>
        <div className="builder-header-icon-grid">
          {headerIconOptions.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={shellSettings.headerIconOrder.includes(option.id)}
                onChange={(event) =>
                  updateHeaderIcon(option.id, event.target.checked)
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
