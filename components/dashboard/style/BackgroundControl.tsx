"use client";

import type { BuilderBackgroundStyle } from "@/lib/builderVisualStyle";

type Props = {
  value?: BuilderBackgroundStyle;
  onChange: (value: BuilderBackgroundStyle) => void;
  onPickImage?: () => void;
};

export default function BackgroundControl({
  value,
  onChange,
  onPickImage,
}: Props) {
  const v = value ?? { type: "color" };
  const type = v.type ?? "color";

  function patch(patch: Partial<BuilderBackgroundStyle>) {
    onChange({ ...v, ...patch });
  }

  return (
    <div className="builder-style-background">
      <label>
        <span>Type</span>
        <select
          value={type}
          onChange={(event) =>
            patch({
              type: event.target.value as BuilderBackgroundStyle["type"],
            })
          }
        >
          <option value="none">None</option>
          <option value="color">Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
      </label>

      {type === "color" && (
        <label>
          <span>Color</span>
          <div className="builder-style-color-row">
            <input
              type="color"
              value={v.color?.startsWith("#") ? v.color : "#ffffff"}
              onChange={(event) => patch({ color: event.target.value })}
            />
            <input
              value={v.color ?? ""}
              placeholder="#ffffff or rgba(...)"
              onChange={(event) => patch({ color: event.target.value })}
            />
          </div>
        </label>
      )}

      {type === "gradient" && (
        <label>
          <span>Gradient CSS</span>
          <input
            value={v.gradient ?? ""}
            placeholder="linear-gradient(135deg, #111, #333)"
            onChange={(event) => patch({ gradient: event.target.value })}
          />
        </label>
      )}

      {type === "image" && (
        <>
          <label>
            <span>Image URL</span>
            <div className="builder-media-url-row">
              <input
                value={v.imageUrl ?? ""}
                placeholder="https://..."
                onChange={(event) => patch({ imageUrl: event.target.value })}
              />
              {onPickImage ? (
                <button type="button" onClick={onPickImage}>
                  Library
                </button>
              ) : null}
            </div>
          </label>
          <div className="builder-style-two-col">
            <label>
              <span>Size</span>
              <select
                value={v.imageSize ?? "cover"}
                onChange={(event) =>
                  patch({
                    imageSize: event.target
                      .value as BuilderBackgroundStyle["imageSize"],
                  })
                }
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </label>
            <label>
              <span>Repeat</span>
              <select
                value={v.imageRepeat ?? "no-repeat"}
                onChange={(event) =>
                  patch({
                    imageRepeat: event.target
                      .value as BuilderBackgroundStyle["imageRepeat"],
                  })
                }
              >
                <option value="no-repeat">No repeat</option>
                <option value="repeat">Repeat</option>
                <option value="repeat-x">Repeat X</option>
                <option value="repeat-y">Repeat Y</option>
              </select>
            </label>
          </div>
          <label>
            <span>Position</span>
            <input
              value={v.imagePosition ?? "center"}
              placeholder="center top"
              onChange={(event) => patch({ imagePosition: event.target.value })}
            />
          </label>
          <label>
            <span>Overlay</span>
            <input
              value={v.overlay ?? ""}
              placeholder="rgba(0,0,0,0.35)"
              onChange={(event) => patch({ overlay: event.target.value })}
            />
          </label>
        </>
      )}
    </div>
  );
}
