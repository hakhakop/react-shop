"use client";

import { useEffect, useRef } from "react";
import UikitText from "@/components/builder/UikitText";
import {
  getUikitAccordionClass,
  getUikitAccordionItemClass,
  getUikitHeadingClass,
  getUikitTextClass,
  getUikitButtonClass,
  getUikitMarginClass,
  getUikitImageAttributes,
  getUikitImageClass,
  getUikitImageStyle,
  getUikitImageWrapperClass,
  resolveUikitImageSemantics,
} from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

export type UikitAccordionItem = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  mediaPlacement?: "top" | "bottom" | "left" | "right";
  mediaWidth?: "1-2" | "1-3" | "1-4" | "auto";
  buttonUrl?: string;
  buttonLabel?: string;
  buttonStyle?: string;
  buttonSize?: string;
  buttonTarget?: string;
  customId?: string;
  customClass?: string;
};

type Props = {
  block?: any;
  items?: UikitAccordionItem[];
  multiple?: boolean;
  collapsible?: boolean;
  active?: number[];
  style?: "default" | "divided" | "striped" | "minimal" | "boxed";
  indicator?: "default" | "plus-minus" | "chevron" | "none";
  indicatorPosition?: "start" | "end";
  titleEmphasis?: "inherit" | "muted" | "default" | "emphasis" | "bold";
  itemSpacing?: "inherit" | "small" | "default" | "large";
  contentSpacing?: "inherit" | "small" | "default" | "large";
  divider?: boolean;
  titleStyle?: "inherit" | "h3" | "h4" | "h5" | string;
  contentStyle?: "inherit" | "default" | "lead" | "small" | "large" | "muted" | string;
  legacyRowStyle?: "plain" | "divided" | "striped";
  legacySpacing?: "compact" | "default" | "large";
  legacyOpenEmphasis?: "none" | "muted" | "primary";
};

export default function UikitAccordion({
  block,
  items: itemsProp,
  multiple: multipleProp,
  collapsible: collapsibleProp,
  active: activeProp,
  style: styleProp,
  indicator: indicatorProp,
  indicatorPosition: indicatorPositionProp,
  titleEmphasis: titleEmphasisProp,
  itemSpacing: itemSpacingProp,
  contentSpacing: contentSpacingProp = "inherit",
  divider: dividerProp = true,
  titleStyle: titleStyleProp = "inherit",
  contentStyle: contentStyleProp = "inherit",
  legacyRowStyle,
  legacySpacing,
  legacyOpenEmphasis,
}: Props) {
  const rawBlock = (block ?? {}) as any;
  const items: UikitAccordionItem[] = itemsProp ?? rawBlock.accordionItems ?? [];
  const multiple = multipleProp ?? rawBlock.accordionMultiple ?? false;
  const collapsible = collapsibleProp ?? rawBlock.accordionCollapsible ?? true;
  const active = activeProp ?? rawBlock.accordionOpenItems ?? [];

  const style =
    styleProp === "boxed"
      ? "striped"
      : styleProp ??
        rawBlock.accordionStyle ??
        (legacyRowStyle === "divided" ? "divided" : legacyRowStyle === "striped" ? "striped" : "default");
  const indicator = indicatorProp ?? rawBlock.accordionIndicator ?? "default";
  const indicatorPosition = indicatorPositionProp ?? rawBlock.accordionIndicatorPosition ?? "end";
  const titleEmphasis =
    titleEmphasisProp === "bold"
      ? "emphasis"
      : titleEmphasisProp ??
        rawBlock.accordionTitleEmphasis ??
        (legacyOpenEmphasis === "muted" ? "muted" : legacyOpenEmphasis === "primary" ? "emphasis" : "inherit");
  const itemSpacing =
    itemSpacingProp ??
    rawBlock.accordionItemSpacing ??
    (legacySpacing === "compact" ? "small" : legacySpacing === "large" ? "large" : "inherit");
  const contentSpacing = contentSpacingProp ?? rawBlock.accordionContentSpacing ?? "inherit";
  const divider = dividerProp ?? rawBlock.accordionDivider ?? true;

  // Title Settings
  const TitleTag = (rawBlock.accordionTitleLevel ?? rawBlock.headingLevel ?? "h3") as any;
  const titleStyleVal = rawBlock.accordionTitleSize ?? rawBlock.accordionTitleStyle ?? titleStyleProp;
  const titleHeadingClass =
    titleStyleVal && titleStyleVal !== "inherit" && titleStyleVal !== "none"
      ? getUikitHeadingClass(titleStyleVal, titleStyleVal)
      : "";
  const titleFontFamilyClass = typographyRoleClass(
    rawBlock.titleTypographyRole ?? rawBlock.accordionTitleFontFamily
  );
  const titleColorVal = rawBlock.accordionTitleColor ?? rawBlock.titleColor;
  const titleColorClass =
    titleColorVal && titleColorVal !== "none" && titleColorVal !== "default"
      ? titleColorVal.startsWith("uk-text-")
        ? titleColorVal
        : `uk-text-${titleColorVal}`
      : "";
  const titleAlignVal = rawBlock.accordionTitleAlign ?? rawBlock.textAlign;
  const titleAlignClass = titleAlignVal && titleAlignVal !== "none" ? `uk-text-${titleAlignVal}` : "";

  // Content Settings
  const contentStyleVal = rawBlock.accordionContentStyle ?? rawBlock.contentStyle ?? contentStyleProp;
  const contentMarginTopClass = getUikitMarginClass(rawBlock.accordionContentMarginTop);
  const imageSemantics = resolveUikitImageSemantics(rawBlock);
  const imageStyle = getUikitImageStyle(imageSemantics);
  const imageClass = getUikitImageClass(imageSemantics);
  const imageWrapperClass = getUikitImageWrapperClass(imageSemantics);
  const imageDecorationClass = rawBlock.imageBoxDecoration && rawBlock.imageBoxDecoration !== "none" ? `uk-background-${rawBlock.imageBoxDecoration}` : "";
  const cssLength = (value: unknown, fallback: string) => {
    const stringValue = String(value ?? "").trim();
    if (!stringValue || stringValue === "auto") return fallback;
    return /^\d+$/.test(stringValue) ? `${stringValue}px` : stringValue;
  };
  const mediaWidth = (value: unknown) => ({ "1-2": "50%", "1-3": "33.333%", "1-4": "25%" } as Record<string, string>)[String(value)] ?? "100%";

  // Field Visibility Flags
  const canShowTitle = (rawBlock.accordionShowTitle ?? rawBlock.showTitle ?? true) !== false;
  const canShowContent = (rawBlock.accordionShowContent ?? rawBlock.showContent ?? true) !== false;
  const canShowImage = (rawBlock.accordionShowImage ?? rawBlock.showImage ?? true) !== false;
  const canShowLink = (rawBlock.accordionShowLink ?? rawBlock.showLink ?? true) !== false;

  // General Block Wrapper Classes
  const generalMarginClass = getUikitMarginClass(rawBlock.margin);
  const generalTextClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const generalAnimClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const generalVisClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  const rootRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let instance: { $destroy?: (remove?: boolean) => void } | undefined;
    let cancelled = false;

    Promise.all([import("uikit"), import("uikit/dist/js/uikit-icons")]).then(([module, iconsModule]) => {
      if (cancelled || !rootRef.current) return;
      const UIkit = (module.default ?? module) as {
        accordion: (element: HTMLElement, options: Record<string, unknown>) => { $destroy?: (remove?: boolean) => void };
        icon?: (element: HTMLElement) => unknown;
        use?: (plugin: unknown) => void;
      };
      const registerPlugin = UIkit.use;
      registerPlugin?.(iconsModule.default ?? iconsModule);
      instance = UIkit.accordion(rootRef.current, {
        multiple,
        collapsible,
        active: active.length > 0 ? active : false,
        animation: true,
      });
      rootRef.current.querySelectorAll<HTMLElement>("[uk-icon]").forEach((icon) => UIkit.icon?.(icon));
    });

    return () => {
      cancelled = true;
      instance?.$destroy?.();
    };
  }, [active, collapsible, multiple, items, indicator]);

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--accordion ${generalMarginClass} ${generalTextClass} ${generalAnimClass} ${generalVisClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <ul
        ref={rootRef}
        className={getUikitAccordionClass({
          style: style as any,
          indicator: indicator as any,
          indicatorPosition: indicatorPosition as any,
          titleEmphasis: titleEmphasis as any,
          itemSpacing: itemSpacing as any,
          contentSpacing: contentSpacing as any,
          divider,
        })}
        uk-accordion=""
        data-accordion-multiple={multiple ? "true" : "false"}
        data-accordion-collapsible={collapsible ? "true" : "false"}
      >
        {items.map((item, index) => {
          const itemUrl = item.buttonUrl || rawBlock.accordionLinkUrl || "#";
          const buttonText = item.buttonLabel || rawBlock.accordionLinkText || "Read more";
          const btnVariant = item.buttonStyle || rawBlock.accordionButtonStyle || "primary";
          const btnSize = item.buttonSize || rawBlock.accordionButtonSize || "default";
          const linkTarget = item.buttonTarget || rawBlock.accordionLinkTarget || "_self";
          const linkStyleClass = getUikitButtonClass(btnVariant, btnSize);
          const mediaPlacement = item.mediaPlacement ?? rawBlock.accordionMediaPlacement ?? "top";
          const sideMedia = mediaPlacement === "left" || mediaPlacement === "right";
          const renderMedia = () => (
            <div
              className={`shop-builder-accordion-media ${imageWrapperClass} ${imageDecorationClass}`.trim()}
              style={{
                width: sideMedia ? mediaWidth(item.mediaWidth ?? rawBlock.accordionMediaWidth) : cssLength(rawBlock.imageWidth, imageStyle.width ?? "100%"),
                maxWidth: sideMedia ? mediaWidth(item.mediaWidth ?? rawBlock.accordionMediaWidth) : imageStyle.maxWidth ?? "100%",
                aspectRatio: imageStyle.aspectRatio,
                position: imageStyle.aspectRatio ? "relative" : undefined,
                flex: sideMedia ? `0 0 ${mediaWidth(item.mediaWidth ?? rawBlock.accordionMediaWidth)}` : undefined,
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.imageAlt || item.title || ""}
                className={imageClass}
                loading={rawBlock.imageLoading === "eager" ? "eager" : "lazy"}
                {...getUikitImageAttributes(imageSemantics)}
                style={{
                  width: "100%",
                  height: imageStyle.aspectRatio ? "100%" : cssLength(rawBlock.imageHeight, "auto"),
                  maxWidth: "100%",
                  objectFit: imageStyle.objectFit,
                  position: imageStyle.position,
                  inset: imageStyle.inset,
                }}
              />
            </div>
          );
          const renderContent = () => (
            <>
              {canShowContent && item.content && (
                <div className={contentMarginTopClass}>
                  <UikitText content={item.content} variant={contentStyleVal === "inherit" ? "default" : contentStyleVal} />
                </div>
              )}
              {canShowLink && (item.buttonUrl || rawBlock.accordionLinkUrl) && (
                <div className={getUikitMarginClass(rawBlock.accordionLinkMargin ?? "default", "top")}>
                  <a href={itemUrl} className={`${linkStyleClass} ${rawBlock.accordionFullWidth ? "uk-width-1-1" : ""}`.trim()} {...builderLinkTargetProps(linkTarget)}>{buttonText}</a>
                </div>
              )}
            </>
          );

          return (
            <li
              key={item.id || `accordion-item-${index}`}
              id={item.customId}
              data-accordion-item-id={item.id || index}
              className={`${getUikitAccordionItemClass(style as any)} ${item.customClass ?? ""}`.trim()}
            >
              <a className="uk-accordion-title" href="#" onClick={(e) => e.preventDefault()}>
                {(indicator === "default" || indicator === "plus-minus") && (
                  <>
                    <span
                      className="shop-builder-accordion-indicator shop-builder-accordion-indicator--plus"
                      uk-icon="icon: plus"
                      aria-hidden="true"
                    />
                    <span
                      className="shop-builder-accordion-indicator shop-builder-accordion-indicator--minus"
                      uk-icon="icon: minus"
                      aria-hidden="true"
                    />
                  </>
                )}
                {indicator === "chevron" && (
                  <span
                    className="shop-builder-accordion-indicator"
                    uk-icon="icon: chevron-down"
                    aria-hidden="true"
                  />
                )}
                {canShowTitle && item.title && (
                  <TitleTag
                    className={`shop-builder-accordion-title-text ${titleHeadingClass} ${titleFontFamilyClass} ${titleColorClass} ${titleAlignClass}`.trim()}
                  >
                    {item.title}
                  </TitleTag>
                )}
              </a>

              <div className="uk-accordion-content">
                {canShowImage && item.imageUrl && mediaPlacement === "top" && (
                  <div className="uk-margin-bottom">{renderMedia()}</div>
                )}
                {sideMedia ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--uk-margin-small)", alignItems: "flex-start" }}>
                    {mediaPlacement === "left" && canShowImage && item.imageUrl && renderMedia()}
                    <div style={{ flex: "1 1 12rem", minWidth: 0 }}>{renderContent()}</div>
                    {mediaPlacement === "right" && canShowImage && item.imageUrl && renderMedia()}
                  </div>
                ) : renderContent()}
                {canShowImage && item.imageUrl && mediaPlacement === "bottom" && (
                  <div className="uk-margin-top">{renderMedia()}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
