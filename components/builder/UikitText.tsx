import type { CSSProperties } from "react";
import type { TypographySettings, TypographyGroup } from "@/lib/builderTypography";
import { resolveTypographyInput, typographyProps, typographyRoleClass, type SemanticTypographyRole } from "@/lib/builderTypography";
import { getUikitTextClass } from "@/lib/uikitTokens";

type Props = {
  eyebrow?: string;
  title?: string;
  content?: string;
  variant?: "default" | "lead" | "meta" | "small" | "large" | "muted";
  align?: "left" | "center" | "right";
  typography?: TypographySettings | TypographyGroup;
  typographyRole?: SemanticTypographyRole;
};

export default function UikitText({
  eyebrow,
  title,
  content,
  variant = "default",
  align = "left",
  typography,
  typographyRole,
}: Props) {
  const resolvedTypography = resolveTypographyInput(typography, "body") ?? {};
  const { fontSize: _fontSize, variant: _variant, textAlign: _textAlign, ...complementaryTypography } = resolvedTypography;
  const textTypography = typographyProps(complementaryTypography, "body");
  const className = [
    "shop-builder-column-block",
    "shop-builder-column-block--text",
    getUikitTextClass(variant),
    `uk-text-${align}`,
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
