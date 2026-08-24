import type { CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import {
  getUikitButtonClass,
  getUikitHeadingClass,
  getUikitTextClass,
} from "@/lib/uikitTokens";
import { resolveUikitIconName } from "@/lib/uikitIconRegistry";
import {
  typographyProps,
  type TypographyArea,
} from "@/lib/builderTypography";
import { hasBuilderVisualSpacing, type BuilderVisualStyle } from "@/lib/builderVisualStyle";
import type { BuilderLayoutBlock } from "@/lib/builderLayouts";

const HAS_RICH_TEXT_HTML = /<[a-z][\s\S]*>/i;

function inferTypographyArea(tagName: string, className?: string): TypographyArea {
  const tag = tagName.toLowerCase();
  const classHint = String(className || "").toLowerCase();
  if (classHint.includes("eyebrow")) return "eyebrow";
  if (classHint.includes("cta") || tag === "a" || tag === "button") return "button";
  if (/^h[1-6]$/.test(tag) || tag === "strong" || tag === "em") return "title";
  return "body";
}

function buttonTypographyStyle(
  className: string | undefined,
  style: CSSProperties | undefined,
) {
  if (!style || !String(className || "").includes("cta")) return style;
  const buttonSafeStyle = { ...style };
  delete buttonSafeStyle.color;
  return buttonSafeStyle;
}

export function isRichPreviewText(value: string | null | undefined) {
  return typeof value === "string" && HAS_RICH_TEXT_HTML.test(value);
}

export function getRichTextSafeTag(tag: string) {
  return tag === "p" ? "div" : tag;
}

export function Typog({
  as: As = "div",
  area,
  typography,
  className,
  children,
  style,
  ...props
}: any) {
  const resolvedArea = area ?? inferTypographyArea(String(As), className);
  const tp = typographyProps(typography, resolvedArea);
  const isHeading = /^h[1-6]$/i.test(String(As)) || resolvedArea === "title";
  // A YOOtheme element can use semantic `<h3>` markup with a separate
  // presentation class such as `uk-h5`. Do not append a second heading
  // class from the semantic tag: the imported visual style is authoritative.
  const hasHeadingPresentation = /(?:^|\s)uk-(?:h[1-6]|heading-[\w-]+)/.test(String(className ?? ""));
  const uikitHeading = isHeading && !hasHeadingPresentation ? getUikitHeadingClass(As, typography?.preset) : "";
  const uikitText = resolvedArea === "eyebrow" && !hasHeadingPresentation
    ? getUikitTextClass("meta")
    : resolvedArea === "lead"
      ? getUikitTextClass("lead")
      : "";
  const isCta = String(className || "").includes("cta");
  // Renderers that already selected a semantic UIkit button variant must not
  // receive this legacy Primary fallback as a second, competing class.
  const uikitButton = isCta && !String(className || "").includes("uk-button")
    ? getUikitButtonClass(props.buttonStyle || "primary", props.buttonSize)
    : "";
  const combined = [className, tp.className, uikitHeading, uikitText, uikitButton].filter(Boolean).join(" ");
  const combinedStyle = buttonTypographyStyle(combined, {
    ...style,
    ...tp.style,
  });
  if (isRichPreviewText(children)) {
    const Tag = getRichTextSafeTag(String(As)) as any;
    return <Tag className={combined || undefined} style={combinedStyle} {...props} dangerouslySetInnerHTML={{ __html: children }} />;
  }
  const Tag = As as any;
  return <Tag className={combined || undefined} style={combinedStyle} {...props}>{children}</Tag>;
}

export function RenderChecklist({
  items,
  iconName = "check",
  colorScheme = "default",
  typography,
  iconSize = 15,
  renderWithUikit = false,
}: {
  items?: string[];
  iconName?: string;
  colorScheme?: string;
  typography?: any;
  iconSize?: number;
  renderWithUikit?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const isGradientCycle = colorScheme === "gradient-cycle";
  const legacyIcon = {
    check: <Check size={iconSize} />,
    circleCheck: <CircleCheck size={iconSize} />,
    arrowRight: <ArrowRight size={iconSize} />,
    star: <Star size={iconSize} />,
    heart: <Heart size={iconSize} />,
    sparkles: <Sparkles size={iconSize} />,
    shield: <ShieldCheck size={iconSize} />,
  }[iconName] ?? <Check size={iconSize} />;
  return (
    <ul className={`shop-builder-column-block--list-items ${isGradientCycle ? "is-icon-gradient-cycle" : ""}`} style={{ listStyle: "none", padding: 0, margin: "1rem 0", display: "grid", gap: "0.5rem" }}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
          {renderWithUikit && resolveUikitIconName(iconName) ? <WebPagesIcon name={iconName} size={iconSize} /> : legacyIcon}
          <Typog as="span" typography={typography}>{item}</Typog>
        </li>
      ))}
    </ul>
  );
}

export function blockLegacyGridMargin(block: BuilderLayoutBlock) {
  return hasBuilderVisualSpacing(
    (block.visualStyle as BuilderVisualStyle | undefined)?.margin,
  )
    ? "none"
    : block.gridMargin && block.gridMargin !== "inherit"
      ? block.gridMargin
      : "none";
}
