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
  textColor?: "none" | "muted" | "emphasis" | "primary" | "secondary" | "success" | "warning" | "danger";
  dropcap?: boolean;
  columns?: "none" | "1-2" | "1-3" | "1-4" | "1-5" | "1-6";
  columnDivider?: boolean;
  columnBreakpoint?: "always" | "small" | "medium" | "large" | "xlarge";
  htmlElement?: "div" | "address" | "aside" | "footer";
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
  align,
  textColor = "none",
  dropcap = false,
  columns = "none",
  columnDivider = false,
  columnBreakpoint = "always",
  htmlElement = "div",
  typography,
  typographyRole,
  margin,
  animation,
  visibility,
}: Props) {
  const resolvedTypography = resolveTypographyInput(typography, "body") ?? {};
  const { fontSize: _fontSize, variant: _variant, textAlign: _textAlign, ...complementaryTypography } = resolvedTypography;
  const textTypography = typographyProps(complementaryTypography, "body");
  // A concrete Typography color is the strongest local text override. Put it
  // into the same local token used by UIkit Text utilities so utility classes
  // never defeat it with `!important` color declarations.
  const { color: localTypographyColor, ...textTypographyStyle } = (textTypography.style ?? {}) as CSSProperties;
  const marginClass = margin && margin !== "none" && margin !== "default" ? `uk-margin-${margin}` : "";
  const animationClass = animation && animation !== "none" ? `uk-animation-${animation}` : "";
  const visibilityClass = visibility && visibility !== "always" ? `uk-${visibility}` : "";
  const colorClass = textColor !== "none" ? `uk-text-${textColor}` : "";
  // Responsive text columns use the rendered-page policy rather than
  // UIkit's static @s/@m/@l/@xl media rules. `always` remains UIkit's normal
  // unqualified column class.
  const columnClass = columns === "none"
    ? ""
    : columnBreakpoint === "always"
      ? `uk-column-${columns}`
      : `builder-text-columns-${columns}-from-${columnBreakpoint}`;
  const ContentTag = htmlElement as "div" | "address" | "aside" | "footer";

  const className = [
    "shop-builder-column-block",
    "shop-builder-column-block--text",
    getUikitTextClass(variant),
    align ? `uk-text-${align}` : "",
    marginClass,
    animationClass,
    visibilityClass,
    typographyRoleClass(typographyRole),
    textTypography.className,
    colorClass,
  ].filter(Boolean).join(" ");
  const style = {
    ...textTypographyStyle,
    ...(localTypographyColor ? { "--uikit-text-local-color": localTypographyColor } : {}),
  } as CSSProperties;

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
        <ContentTag
          className={`shop-builder-text-content ${columnClass} ${columnDivider && columns !== "none" ? "uk-column-divider" : ""} ${dropcap ? "uk-dropcap" : ""}`.trim()}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : null}
    </div>
  );
}
