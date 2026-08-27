"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitButtonClass, getUikitButtonLocalOverride } from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { resolveGeneralTextAlignment } from "@/lib/builderElementShell";
import { typographyProps } from "@/lib/builderTypography";
import { uikitGridGapCss } from "@/lib/uikitGridStructure";
import { isRichText, sanitizeHtml } from "@/lib/safeHtml";

type Props = {
  block: any;
  scopeClassName?: string;
};

export default function UikitButton({ block, scopeClassName }: Props) {
  const rawBlock = (block ?? {}) as any;
  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";
  const generalTextAlign = resolveGeneralTextAlignment(rawBlock);
  const alignmentToFlex = (alignment: string | undefined) => alignment === "center" ? "center" : alignment === "right" ? "right" : "left";
  const textAlignBreakpoint = rawBlock.visualStyle?.layout?.textAlignBreakpoint;
  const textAlignFallback = rawBlock.visualStyle?.layout?.textAlignFallback;
  const breakpointSuffix = ({ small: "s", medium: "m", large: "l", xlarge: "xl" } as Record<string, string>)[textAlignBreakpoint ?? ""];
  const flexAlignment = alignmentToFlex(generalTextAlign);

  const alignFlexClass = breakpointSuffix && generalTextAlign && generalTextAlign !== "justify"
    ? `uk-flex-${flexAlignment}@${breakpointSuffix}${textAlignFallback && textAlignFallback !== "none" ? ` uk-flex-${alignmentToFlex(textAlignFallback)}` : ""}`
    : `uk-flex-${flexAlignment}`;

  const isStacked = rawBlock.buttonsLayout === "stacked";
  const isFullWidth = Boolean(rawBlock.fullWidthButton);
  // `buttons` is the canonical multi-action owner. Legacy singular action
  // fields are rendered only when that collection is absent, never alongside
  // it, so the inspector and the rendered content have one source of truth.
  const hasCanonicalItems = Array.isArray(rawBlock.buttons);
  const buttonsList = hasCanonicalItems ? rawBlock.buttons : [];
  const localOverride = getUikitButtonLocalOverride(rawBlock);
  const localTypography = typographyProps(rawBlock.typography, "button");
  const isImportedYoothemeButton = rawBlock.spacingContract === "yootheme" || String(rawBlock.id ?? "").startsWith("yootheme-");
  // Imported YOOtheme Button groups use the UIkit small gutter when older
  // persisted blocks have only the pre-token `buttonGap` field.
  const legacyGap = isImportedYoothemeButton ? uikitGridGapCss("small") : rawBlock.buttonGap || "0.75rem";
  const columnGap = rawBlock.buttonColumnGap ? uikitGridGapCss(rawBlock.buttonColumnGap) : legacyGap;
  const rowGap = rawBlock.buttonRowGap ? uikitGridGapCss(rawBlock.buttonRowGap) : legacyGap;
  const defaultYoothemeButtonTokens = isImportedYoothemeButton && !rawBlock.size
    ? {
        "--uk-button-font-size": "var(--uk-base-font-size, 16px)",
        "--uk-button-line-height": "var(--uk-global-control-height, 48px)",
        "--uk-button-font-weight": "400",
      }
    : {};
  const yoothemeTextButtonTokens = isImportedYoothemeButton && !rawBlock.size
    ? {
        // YOOtheme text links keep the global base typography even when the
        // tenant's native Button token uses a compact control size. The font
        // family remains a semantic global token, never a source-theme value.
        "--uk-button-font-size": "var(--uk-base-font-size, 16px)",
        "--uk-button-line-height": "var(--uk-base-line-height, 1.5)",
        "--uk-button-font-family": "var(--webpages-font-primary, var(--uk-global-font-family, inherit))",
        "--uk-button-font-weight": "400",
      }
    : {};
  const actionClassName = (style: string | undefined, size: string | undefined) =>
    `${getUikitButtonClass(
      // Historic native documents used `link` as a Text-button alias before
      // YOOtheme Link became a distinct, bare-`uk-button` source semantic.
      // Preserve that native alias without allowing it to collapse imported
      // YOOtheme Button items.
      !isImportedYoothemeButton && !rawBlock.headerButtonMode && style === "link"
        ? "native-link"
        : style,
      size,
    )} ${localOverride.className} ${isFullWidth ? "uk-width-1-1" : ""}`.trim();
  const renderLabel = (label: unknown) => {
    const value = String(label ?? "");
    return isRichText(value)
      ? <span className="shop-builder-button-label" dangerouslySetInnerHTML={{ __html: sanitizeHtml(value, { FORBID_ATTR: ["style"] }) }} />
      : value;
  };

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`${scopeClassName ?? ""} shop-builder-column-block shop-builder-column-block--button ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div
        className={`uk-flex uk-flex-wrap ${alignFlexClass} ${isStacked ? "uk-flex-column" : "uk-flex-middle"} ${isFullWidth ? "uk-child-width-1-1" : ""}`.trim()}
        style={{ columnGap, rowGap }}
      >
        {!hasCanonicalItems && rawBlock.buttonLabel && (
          <a
            className={actionClassName(rawBlock.buttonStyle ?? "primary", rawBlock.size)}
            href={rawBlock.buttonUrl || "#"}
            style={{
              ...localOverride.style,
              ...(rawBlock.buttonStyle === "text" ? yoothemeTextButtonTokens : defaultYoothemeButtonTokens),
              ...localTypography.style,
            }}
            {...builderLinkTargetProps(rawBlock.buttonTarget)}
          >
            {renderLabel(rawBlock.buttonLabel)}
          </a>
        )}
        {buttonsList.map((btn: any, btnIdx: number) => (
          <a
            key={btn.id ?? btnIdx}
            className={actionClassName(btn.style ?? rawBlock.buttonStyle ?? "primary", btn.size ?? rawBlock.size)}
            href={btn.url || "#"}
            style={{
              ...localOverride.style,
              ...(btn.style === "text" ? yoothemeTextButtonTokens : defaultYoothemeButtonTokens),
              ...localTypography.style,
            }}
            {...builderLinkTargetProps(btn.target)}
          >
            {renderLabel(btn.label || btn.text || `Button ${btnIdx + 1}`)}
          </a>
        ))}
      </div>
    </div>
  );
}
