import type { CSSProperties } from "react";
import type { TypographySettings, TypographyGroup } from "@/lib/builderTypography";
import { resolveTypographyInput, typographyProps, typographyRoleClass, type SemanticTypographyRole } from "@/lib/builderTypography";
import { getUikitTextClass } from "@/lib/uikitTokens";

type Props = {
  eyebrow?: string;
  title?: string;
  content?: string;
  variant?: string;
  align?: "left" | "center" | "right";
  typography?: TypographySettings | TypographyGroup;
  typographyRole?: SemanticTypographyRole;
  margin?: string;
  animation?: string;
  visibility?: string;
};

export default function UikitText({
  eyebrow,
  title,
  content,
  variant = "default",
  align = "left",
  typography,
  typographyRole,
  margin,
  animation,
  visibility,
}: Props) {
  const resolvedTypography = resolveTypographyInput(typography, "body") ?? {};
  const { fontSize: _fontSize, variant: _variant, textAlign: _textAlign, ...complementaryTypography } = resolvedTypography;
  const textTypography = typographyProps(complementaryTypography, "body");
  const marginClass = margin && margin !== "none" && margin !== "default" ? `uk-margin-${margin}` : "";
  const animationClass = animation && animation !== "none" ? `uk-animation-${animation}` : "";
  const visibilityClass = visibility && visibility !== "always" ? `uk-${visibility}` : "";

  const className = [
    "shop-builder-column-block",
    "shop-builder-column-block--text",
    getUikitTextClass(variant),
    `uk-text-${align}`,
    marginClass,
    animationClass,
    visibilityClass,
    typographyRoleClass(typographyRole),
    textTypography.className,
  ].filter(Boolean).join(" ");
  const style = textTypography.style as CSSProperties | undefined;

  return (
    <div
      className={className}
      style={style}
      data-uikit-text-variant={variant}
      data-uikit-text-align={align}
    >
      {eyebrow ? <div className="uk-text-meta">{eyebrow}</div> : null}
      {title ? <div className="shop-builder-text-title">{title}</div> : null}
      {content ? (
        <div
          className="shop-builder-text-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}
    </div>
  );
}
