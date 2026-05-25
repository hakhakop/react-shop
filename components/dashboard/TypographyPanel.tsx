"use client";

import { typographyProps, type TypographySettings } from "@/lib/builderTypography";

type Props = {
  value?: TypographySettings;
  onChange: (v: TypographySettings) => void;
};

function toPreviewPx(size?: string) {
  if (!size) return 0;
  const trimmed = size.trim().toLowerCase();
  const numeric = Number.parseFloat(trimmed);
  if (Number.isNaN(numeric)) return 0;
  if (trimmed.endsWith("px")) return numeric;
  if (trimmed.endsWith("rem") || trimmed.endsWith("em")) return numeric * 16;
  return numeric;
}

export default function TypographyPanel({ value, onChange }: Props) {
  const v = value || {};
  const previewText = "Aa";
  const previewProps = typographyProps(v);
  const previewSize = previewProps.style?.fontSize;
  const previewSizeLabel =
    typeof previewSize === "string" && previewSize.trim()
      ? previewSize
      : v.fontSize || (v.variant ? `${v.variant}` : "auto");
  const previewScale = Math.min(1, Math.max(0.28, toPreviewPx(v.fontSize) / 120));

  function set<K extends keyof TypographySettings>(
    key: K,
    val: TypographySettings[K],
  ) {
    onChange({ ...v, [key]: val });
  }

  return (
    <div className="builder-style-typography">
      <div className="builder-style-typography-preview">
        <span className="builder-style-typography-preview-copy">
          <strong>Live preview</strong>
          <small>{previewSizeLabel}</small>
        </span>
        <div className="builder-style-typography-preview-sample">
          <span
            className="builder-style-typography-preview-sample-copy"
            style={previewProps.style}
          >
            {previewText}
          </span>
          <div className="builder-style-typography-preview-meter" aria-hidden="true">
            <span
              className="builder-style-typography-preview-meter-fill"
              style={{ transform: `scaleX(${previewScale})` }}
            />
          </div>
        </div>
      </div>

      <label>
        <span>Variant</span>
        <select
          value={v.variant || "body"}
          onChange={(e) =>
            set("variant", e.target.value as TypographySettings["variant"])
          }
        >
          <option value="heading">Heading</option>
          <option value="subheading">Subheading</option>
          <option value="body">Body</option>
          <option value="button">Button</option>
        </select>
      </label>

      <div className="builder-style-two-col">
        <label>
          <span>Font size</span>
          <input
            value={v.fontSize || ""}
            onChange={(e) => set("fontSize", e.target.value)}
            placeholder="16px, 1.5rem, clamp(24px, 3vw, 44px)"
          />
        </label>
        <label>
          <span>Font weight</span>
          <select
            value={String(v.fontWeight ?? "400")}
            onChange={(e) =>
              set("fontWeight", e.target.value as TypographySettings["fontWeight"])
            }
          >
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
          </select>
        </label>
      </div>

      <label>
        <span>Font family</span>
        <input
          value={v.fontFamily || ""}
          onChange={(e) => set("fontFamily", e.target.value)}
          placeholder="Inter, system-ui"
        />
      </label>

      <div className="builder-style-two-col">
        <label>
          <span>Line height</span>
          <input
            value={v.lineHeight || ""}
            onChange={(e) => set("lineHeight", e.target.value)}
            placeholder="1.4"
          />
        </label>
        <label>
          <span>Letter spacing</span>
          <input
            value={v.letterSpacing || ""}
            onChange={(e) => set("letterSpacing", e.target.value)}
            placeholder="0px"
          />
        </label>
      </div>

      <label>
        <span>Color</span>
        <div className="builder-style-color-row">
          <input
            type="color"
            value={v.color?.startsWith("#") ? v.color : "#000000"}
            onChange={(e) => set("color", e.target.value)}
          />
          <input
            value={v.color || ""}
            onChange={(e) => set("color", e.target.value)}
            placeholder="#111111"
          />
        </div>
      </label>

      <label>
        <span>Text align</span>
        <div className="builder-style-preset-row">
          {(["left", "center", "right", "justify"] as const).map((align) => (
            <button
              key={align}
              type="button"
              className={v.textAlign === align ? "is-active" : ""}
              onClick={() => set("textAlign", align)}
            >
              {align}
            </button>
          ))}
        </div>
      </label>

      <div className="builder-style-two-col">
        <label>
          <span>Transform</span>
          <select
            value={v.textTransform || "none"}
            onChange={(e) =>
              set(
                "textTransform",
                e.target.value as TypographySettings["textTransform"],
              )
            }
          >
            <option value="none">None</option>
            <option value="uppercase">Uppercase</option>
            <option value="lowercase">Lowercase</option>
            <option value="capitalize">Capitalize</option>
          </select>
        </label>
        <label>
          <span>Decoration</span>
          <select
            value={v.textDecoration || "none"}
            onChange={(e) =>
              set(
                "textDecoration",
                e.target.value as TypographySettings["textDecoration"],
              )
            }
          >
            <option value="none">None</option>
            <option value="underline">Underline</option>
            <option value="line-through">Line-through</option>
          </select>
        </label>
      </div>
    </div>
  );
}
