"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitButtonClass, getUikitButtonLocalOverride } from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

type Props = {
  block: any;
};

export default function UikitButton({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  const alignFlexClass =
    rawBlock.buttonAlign === "center" || rawBlock.textAlign === "center"
      ? "uk-flex-center"
      : rawBlock.buttonAlign === "right" || rawBlock.textAlign === "right"
      ? "uk-flex-right"
      : "uk-flex-left";

  const isStacked = rawBlock.buttonsLayout === "stacked";
  const isFullWidth = Boolean(rawBlock.fullWidthButton);
  // `buttons` is the canonical multi-action owner. Legacy singular action
  // fields are rendered only when that collection is absent, never alongside
  // it, so the inspector and the rendered content have one source of truth.
  const hasCanonicalItems = Array.isArray(rawBlock.buttons);
  const buttonsList = hasCanonicalItems ? rawBlock.buttons : [];
  const localOverride = getUikitButtonLocalOverride(rawBlock);
  const isImportedYoothemeButton = rawBlock.spacingContract === "yootheme" || String(rawBlock.id ?? "").startsWith("yootheme-");
  const actionClassName = (style: string | undefined, size: string | undefined) =>
    `${getUikitButtonClass(
      // Historic native documents used `link` as a Text-button alias before
      // YOOtheme Link became a distinct, bare-`uk-button` source semantic.
      // Preserve that native alias without allowing it to collapse imported
      // YOOtheme Button items.
      !isImportedYoothemeButton && style === "link" ? "native-link" : style,
      size,
    )} ${localOverride.className} ${isFullWidth ? "uk-width-1-1" : ""}`.trim();

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--button ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div
        className={`uk-flex uk-flex-wrap ${alignFlexClass} ${isStacked ? "uk-flex-column" : "uk-flex-middle"} ${isFullWidth ? "uk-child-width-1-1" : ""}`.trim()}
        style={{ gap: rawBlock.buttonGap || "0.75rem" }}
      >
        {!hasCanonicalItems && rawBlock.buttonLabel && (
          <a
            className={actionClassName(rawBlock.buttonStyle ?? "primary", rawBlock.size)}
            href={rawBlock.buttonUrl || "#"}
            style={localOverride.style}
            {...builderLinkTargetProps(rawBlock.buttonTarget)}
          >
            {rawBlock.buttonLabel}
          </a>
        )}
        {buttonsList.map((btn: any, btnIdx: number) => (
          <a
            key={btn.id ?? btnIdx}
            className={actionClassName(btn.style ?? rawBlock.buttonStyle ?? "primary", btn.size ?? rawBlock.size)}
            href={btn.url || "#"}
            style={localOverride.style}
            {...builderLinkTargetProps(btn.target)}
          >
            {btn.label || btn.text || `Button ${btnIdx + 1}`}
          </a>
        ))}
      </div>
    </div>
  );
}
