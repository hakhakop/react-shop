"use client";

import TypographyPanel from "@/components/dashboard/TypographyPanel";
import BackgroundControl from "@/components/dashboard/style/BackgroundControl";
import BorderEffectsControl from "@/components/dashboard/style/BorderEffectsControl";
import SpacingControl from "@/components/dashboard/style/SpacingControl";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import type {
  TypographyGroup,
  TypographySettings,
} from "@/lib/builderTypography";

type StyleTarget = {
  visualStyle?: BuilderVisualStyle;
  typography?: TypographySettings | TypographyGroup;
};

type Props = {
  target: StyleTarget;
  showSpacing?: boolean;
  showBackground?: boolean;
  showAppearance?: boolean;
  showLayout?: boolean;
  showAdvanced?: boolean;
  showTypography?: boolean;
  onChange: (patch: Partial<StyleTarget>) => void;
  onPickBackgroundImage?: () => void;
};

export default function StyleTabPanel({
  target,
  showSpacing = true,
  showBackground = true,
  showAppearance = true,
  showLayout = true,
  showAdvanced = true,
  showTypography = true,
  onChange,
  onPickBackgroundImage,
}: Props) {
  const style = target.visualStyle ?? {};

  function patchStyle(patch: Partial<BuilderVisualStyle>) {
    onChange({ visualStyle: { ...style, ...patch } });
  }

  return (
    <div className="builder-style-tab">
      {showSpacing && (
        <details className="builder-collapse" open>
          <summary>
            <span>Spacing</span>
            <small>padding & margin</small>
          </summary>
          <SpacingControl
            label="Padding"
            value={style.padding}
            onChange={(padding) => patchStyle({ padding })}
          />
          <SpacingControl
            label="Margin"
            value={style.margin}
            onChange={(margin) => patchStyle({ margin })}
          />
        </details>
      )}

      {showBackground && (
        <details className="builder-collapse" open>
          <summary>
            <span>Background</span>
            <small>color, gradient, image</small>
          </summary>
          <BackgroundControl
            value={style.background}
            onChange={(background) => patchStyle({ background })}
            onPickImage={onPickBackgroundImage}
          />
        </details>
      )}

      {showAppearance && (
        <details className="builder-collapse" open>
          <summary>
            <span>Border & effects</span>
            <small>radius, shadow, opacity</small>
          </summary>
          <BorderEffectsControl
            border={style.border}
            effects={style.effects}
            onBorderChange={(border) => patchStyle({ border })}
            onEffectsChange={(effects) => patchStyle({ effects })}
            showLayout={false}
            showVisibility={false}
            showCustomClass={false}
          />
        </details>
      )}

      {showLayout && (
        <details className="builder-collapse" open>
          <summary>
            <span>Dimensions & overflow</span>
            <small>width, height, clipping</small>
          </summary>
          <BorderEffectsControl
            effects={style.effects}
            onEffectsChange={(effects) => patchStyle({ effects })}
            showBorder={false}
            showEffects={false}
            showVisibility={false}
            showCustomClass={false}
          />
        </details>
      )}

      {showAdvanced && (
        <details className="builder-collapse" open>
          <summary>
            <span>Visibility & CSS</span>
            <small>devices, custom class</small>
          </summary>
          <BorderEffectsControl
            visibility={style.visibility}
            customClass={style.customClass}
            onVisibilityChange={(visibility) => patchStyle({ visibility })}
            onCustomClassChange={(customClass) => patchStyle({ customClass })}
            showBorder={false}
            showEffects={false}
            showLayout={false}
          />
        </details>
      )}

      {showTypography && (
        <details className="builder-collapse" open>
          <summary>
            <span>Typography</span>
            <small>font, size, color</small>
          </summary>
          <TypographyPanel
            value={
              typeof target.typography === "object" &&
              target.typography &&
              !("variant" in target.typography) &&
              ("title" in target.typography ||
                "body" in target.typography)
                ? (target.typography as TypographyGroup).title
                : (target.typography as TypographySettings | undefined)
            }
            onChange={(typography) => onChange({ typography })}
          />
        </details>
      )}
    </div>
  );
}
