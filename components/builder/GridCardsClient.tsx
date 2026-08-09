"use client";

import React, { useState } from "react";
import type { CSSProperties } from "react";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { RenderChecklist, Typog, blockLegacyGridMargin } from "@/components/builder/BuilderRenderHelpers";
import {
  getUikitButtonClass,
  getUikitCardClass,
  getUikitHeadingClass,
  getUikitPanelLayoutClass,
  getUikitPanelMediaClass,
  getUikitPanelMediaStyle,
  getUikitTextClass,
} from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { resolveCanonicalGridAction } from "@/lib/builderActions";

function getUikitMarginClass(val?: string) {
  if (!val || val === "default" || val === "none") return "";
  return `uk-margin-${val}`;
}

function getUikitTextStyleClass(val?: string) {
  return getUikitTextClass(val);
}

function getUikitTitleHeadingClass(val?: string) {
  if (!val || val === "none") return "";
  if (val.startsWith("heading-")) return `uk-${val}`;
  if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(val)) return `uk-${val}`;
  return "";
}

function getUikitTitleDecorationClass(val?: string) {
  if (!val || val === "none") return "";
  return `uk-heading-${val}`;
}

function getUikitImageBorderClass(val?: string) {
  if (!val || val === "none") return "";
  return `uk-border-${val}`;
}

function getUikitImageBoxShadowClass(val?: string) {
  if (!val || val === "none") return "";
  return `uk-box-shadow-${val}`;
}

function getUikitHoverTransitionClass(val?: string) {
  if (!val || val === "none") return "";
  return `uk-transition-${val} uk-transition-opaque`;
}

function getUikitLinkStyleClass(val?: string, size?: string, fullWidth?: boolean) {
  const normalized = val?.replace(/^button-/, "").replace(/^link-/, "text") || "default";
  return `${getUikitButtonClass(normalized, size)} ${fullWidth ? "uk-width-1-1" : ""}`.trim();
}

function getUikitGeneralClass(rawBlock: any) {
  const classes: string[] = [];
  if (rawBlock.position && rawBlock.position !== "static") classes.push(`uk-position-${rawBlock.position}`);
  if (rawBlock.margin && rawBlock.margin !== "default" && rawBlock.margin !== "none") classes.push(`uk-margin-${rawBlock.margin}`);
  if (rawBlock.maxWidth && rawBlock.maxWidth !== "none") classes.push(`uk-width-max-${rawBlock.maxWidth}`);
  if (rawBlock.textAlignment && rawBlock.textAlignment !== "left") classes.push(`uk-text-${rawBlock.textAlignment}`);
  if (rawBlock.animation && rawBlock.animation !== "inherit" && rawBlock.animation !== "none") classes.push(`uk-animation-${rawBlock.animation}`);
  if (rawBlock.visibility && rawBlock.visibility !== "always") {
    if (rawBlock.visibility.startsWith("visible-")) classes.push(`uk-visible@${rawBlock.visibility.replace("visible-", "")}`);
    if (rawBlock.visibility.startsWith("hidden-")) classes.push(`uk-hidden@${rawBlock.visibility.replace("hidden-", "")}`);
  }
  return classes.join(" ");
}

export function GridCardsClient({
  block,
  items,
  gridTitleStyle,
  gridGapClass,
  gridGapCustom,
  imagePaddingClass,
  imagePaddingCustom,
  contentPaddingClass,
  contentPaddingCustom,
  limit,
}: {
  block: any;
  items: Array<any>;
  gridTitleStyle: CSSProperties;
  gridGapClass: string;
  gridGapCustom: string | null;
  imagePaddingClass: string;
  imagePaddingCustom: string | null;
  contentPaddingClass: string;
  contentPaddingCustom: string | null;
  limit: number;
}) {
  const rawBlock = block as any;
  const sharedCard = rawBlock.visualStyle?.card ?? {};
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Resolved Column Count across breakpoints & root columns
  const rawCols = block.columns ?? (rawBlock.columnsDesktop && rawBlock.columnsDesktop !== "inherit" ? parseInt(rawBlock.columnsDesktop, 10) : undefined) ?? 3;
  const colsCount = typeof rawCols === "number" && !isNaN(rawCols) ? rawCols : (parseInt(String(rawCols), 10) || 3);

  // Resolved Gaps
  const colGapValue = rawBlock.gridGap ?? rawBlock.columnGap ?? "medium";
  const rowGapValue = rawBlock.gridRowGap ?? rawBlock.rowGap ?? colGapValue ?? "medium";
  const gridColumns = (value: unknown, fallback: number) => {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const filterCategories = Array.from(new Set(items.map((it) => it.eyebrow || it.meta || "Default").filter(Boolean)));
  const filteredItems = activeFilter === "all" ? items : items.filter((it) => (it.eyebrow || it.meta || "Default") === activeFilter);

  // Field Visibility
  const canShowTitle = (rawBlock.gridShowTitle ?? rawBlock.showTitle ?? true) !== false;
  const canShowMeta = (rawBlock.gridShowMeta ?? rawBlock.showMeta ?? true) !== false;
  const canShowContent = (rawBlock.gridShowText ?? rawBlock.gridShowContent ?? rawBlock.showContent ?? true) !== false;
  const canShowImage = (rawBlock.gridShowImage ?? rawBlock.showImage ?? true) !== false;
  const canShowLink = (rawBlock.gridShowButton ?? rawBlock.showLink ?? true) !== false;

  const parseGapPx = (val?: string) => {
    if (val === "small") return "15px";
    if (val === "medium" || val === "default") return "30px";
    if (val === "large") return "40px";
    if (val === "collapse" || val === "none") return "0px";
    return "30px";
  };

  const columnGapCss = parseGapPx(colGapValue);
  const rowGapCss = parseGapPx(rowGapValue);

  return (
    <div className="shop-builder-grid-wrapper" data-uk-lightbox={rawBlock.enableLightbox ? "animation: slide" : undefined}>
      {rawBlock.enableFilter && filterCategories.length > 0 && (
        <ul className={`uk-subnav ${rawBlock.filterStyle === "pill" ? "uk-subnav-pill" : rawBlock.filterStyle === "tabs" ? "uk-tab" : ""} uk-flex-center uk-margin-bottom`}>
          <li className={activeFilter === "all" ? "uk-active" : ""}>
            <button type="button" onClick={() => setActiveFilter("all")} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>All</button>
          </li>
          {filterCategories.map((cat) => (
            <li key={cat} className={activeFilter === cat ? "uk-active" : ""}>
              <button type="button" onClick={() => setActiveFilter(cat)} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>{cat}</button>
            </li>
          ))}
        </ul>
      )}

      <div
        className={`shop-builder-grid shop-builder-grid--gap-${gridGapClass} shop-builder-grid--margin-${blockLegacyGridMargin(block)} ${rawBlock.showDividers ? "uk-grid-divider" : ""} ${rawBlock.centerColumns ? "uk-flex-center" : ""}`}
        style={
          {
            "--shop-builder-grid-columns": colsCount,
            "--shop-builder-grid-columns-phone-landscape": gridColumns(rawBlock.columnsPhoneLandscape, colsCount),
            "--shop-builder-grid-columns-tablet": gridColumns(rawBlock.columns, colsCount),
            "--shop-builder-grid-columns-desktop": gridColumns(rawBlock.columnsDesktop, colsCount),
            "--shop-builder-grid-columns-xlarge": gridColumns(rawBlock.columnsLargeScreens, colsCount),
            columnGap: columnGapCss,
            rowGap: rowGapCss,
            alignItems: rawBlock.justifyColumns ? "end" : rawBlock.centerRows ? "center" : undefined,
            justifyItems: rawBlock.centerColumns ? "center" : undefined,
          } as CSSProperties
        }
      >
        {filteredItems.slice(0, limit).map((item) =>
          (() => {
            const panelStyle = rawBlock.panelStyle ?? rawBlock.panelVariant ?? block.gridCardVariant ?? rawBlock.cardVariant ?? "none";
            const panelPadding = rawBlock.panelSize ?? rawBlock.panelPadding ?? "none";
            let panelClass = "";

            if (
              panelStyle.startsWith("card-") ||
              panelStyle === "default" ||
              panelStyle === "primary" ||
              panelStyle === "secondary"
            ) {
              const variant = panelStyle.replace("card-", "");
              panelClass = `uk-card uk-card-${variant || "default"}`.trim();
            } else if (panelStyle.startsWith("tile-")) {
              const variant = panelStyle.replace("tile-", "");
              panelClass = `uk-tile uk-tile-${variant || "default"}`.trim();
            } else {
              panelClass = "shop-builder-panel-plain";
            }

            const bodyPaddingClass =
              panelPadding === "small"
                ? "shop-builder-panel-padding-small"
                : panelPadding === "large"
                ? "shop-builder-panel-padding-large"
                : panelPadding === "default"
                ? "shop-builder-panel-padding-default"
                : "shop-builder-panel-padding-none";

            const isCard = Boolean(panelClass);
            const cardHover = item.cardHover ?? rawBlock.panelHover ?? block.gridCardHover;

            // Title styling & level
            const TitleTag = (rawBlock.gridTitleLevel ?? item.titleElement ?? block.headingLevel ?? "h3") as any;
            const titleStyleVal = rawBlock.gridTitleSize ?? rawBlock.titleStyle ?? item.titleStyle;
            const titleHeadingClass = getUikitTitleHeadingClass(titleStyleVal) || (titleStyleVal && titleStyleVal !== "inherit" ? getUikitHeadingClass(titleStyleVal, titleStyleVal) : "");
            const titleDecorationClass = getUikitTitleDecorationClass(rawBlock.titleDecoration);
            const titleColorVal = rawBlock.titleColor ?? rawBlock.gridTitleColor ?? sharedCard.titleColor;
            const titleColorClass = titleColorVal && titleColorVal !== "none" && titleColorVal !== "default"
              ? (titleColorVal.startsWith("uk-text-") ? titleColorVal : `uk-text-${titleColorVal}`)
              : "";
            const titleMarginTopClass = getUikitMarginClass(rawBlock.titleMarginTop);

            // Meta styling
            const metaStyleClass = getUikitTextStyleClass(rawBlock.metaStyle ?? "text-meta");
            const metaColorVal = rawBlock.metaColor;
            const metaColorClass = metaColorVal && metaColorVal !== "none" && metaColorVal !== "default"
              ? (metaColorVal.startsWith("uk-text-") ? metaColorVal : `uk-text-${metaColorVal}`)
              : "";
            const metaMarginTopClass = getUikitMarginClass(rawBlock.metaMarginTop);
            const rawMetaAlign = rawBlock.gridMetaAlign ?? rawBlock.metaAlignment ?? "below-title";
            const metaAlign = rawMetaAlign === "above" ? "above-title" : rawMetaAlign === "below" ? "below-title" : rawMetaAlign === "content" ? "below-content" : rawMetaAlign;
            const MetaTag = (rawBlock.gridMetaHtmlElement ?? "div") as any;

            // Content styling
            const contentStyleClass = getUikitTextStyleClass(rawBlock.contentStyle);
            const contentMarginTopClass = getUikitMarginClass(rawBlock.contentMarginTop);

            // Image styling
            const imageBorderClass = getUikitImageBorderClass(rawBlock.imageBorder);
            const imageBoxShadowClass = getUikitImageBoxShadowClass(rawBlock.imageBoxShadow);
            const imageDecorationClass = rawBlock.imageBoxDecoration && rawBlock.imageBoxDecoration !== "none" ? `uk-background-${rawBlock.imageBoxDecoration}` : "";
            const imageHoverTransitionClass = getUikitHoverTransitionClass(rawBlock.imageHoverTransition);
            const isFrameless = (rawBlock as any).alignImageWithoutPadding === true || imagePaddingClass === "frameless";
            const imageDimension = (value: unknown) => value === undefined || value === null || value === "" ? undefined : /^-?\d+(?:\.\d+)?$/.test(String(value)) ? `${value}px` : String(value);
            const imageWidth = imageDimension(rawBlock.imageWidth);
            const imageHeight = imageDimension(rawBlock.imageHeight);
            const imageMaxWidth =
              typeof rawBlock.imageMaxWidth === "number" && rawBlock.imageMaxWidth > 0
                ? `${rawBlock.imageMaxWidth}px`
                : undefined;

            // Link / Button styling
            const action = resolveCanonicalGridAction(block, item);
            const buttonText = action.label;
            const linkStyleClass = getUikitLinkStyleClass(action.style, action.size, action.fullWidth);
            const linkMarginTopClass = getUikitMarginClass(action.margin);
            const linkTarget = action.target;

            const mediaPlacement = item.mediaPlacement ?? (block as any).gridMediaPlacement ?? "top";
            const isSideMedia = mediaPlacement === "left" || mediaPlacement === "right";
            const mediaWidth = (item as any).mediaWidth ?? (block as any).gridMediaWidth ?? "medium";
            const mediaAlignment = (item as any).mediaAlignment ?? (block as any).imageAlignment ?? (block as any).gridMediaAlignment ?? "center";
            const mediaStyle = getUikitPanelMediaStyle({
              ratio: isSideMedia ? undefined : (item.mediaRatio ?? block.imageRatio),
              fit: item.mediaFit ?? block.imageFit,
              alignment: mediaAlignment,
              position: (item as any).imagePosition ?? (block as any).imagePosition,
            });
            const hasCropFrame = !imageWidth && !imageHeight && mediaStyle.aspectRatio && mediaStyle.aspectRatio !== "auto";
            const panelLayoutClass = getUikitPanelLayoutClass(mediaPlacement, mediaWidth);
            const itemUrl = action.url;

            const renderMeta = () => (
              canShowMeta && item.meta ? (
                <Typog
                  as={MetaTag}
                  className={`${metaStyleClass} ${metaColorClass} ${metaMarginTopClass} ${typographyRoleClass(block.metaTypographyRole)}`.trim()}
                  area="body"
                  typography={item.typography ?? block.typography}
                >
                  {item.meta}
                </Typog>
              ) : null
            );

            const renderTitle = () => (
              canShowTitle && item.title ? (
                <Typog
                  as={TitleTag}
                  className={`shop-builder-title ${titleHeadingClass} ${titleDecorationClass} ${titleColorClass} ${titleMarginTopClass} ${typographyRoleClass(
                    rawBlock.titleTypographyRole ?? block.titleTypographyRole,
                  )}`.trim()}
                  typography={item.typography ?? block.typography}
                  area="title"
                  style={{ ...gridTitleStyle, textAlign: sharedCard.titleAlign ?? gridTitleStyle.textAlign, margin: sharedCard.titleMargin ?? gridTitleStyle.margin }}
                >
                  {rawBlock.linkTitle || rawBlock.linkPanel ? (
                    <a href={itemUrl} {...builderLinkTargetProps(linkTarget)}>
                      <BuilderLineBreakText text={item.title} />
                    </a>
                  ) : (
                    <BuilderLineBreakText text={item.title} />
                  )}
                </Typog>
              ) : null
            );

            const renderContent = () => (
              canShowContent && item.text ? (
                <Typog
                  as="p"
                  className={`${contentStyleClass} ${contentMarginTopClass} ${typographyRoleClass(
                    block.contentTypographyRole,
                  )}`.trim()}
                  typography={item.typography ?? block.typography}
                  area="body"
                >
                  {item.text}
                </Typog>
              ) : null
            );

            const renderImage = () => {
              if (!canShowImage || !item.imageUrl) return null;
              const placement = item.mediaPlacement ?? (block as any).gridMediaPlacement ?? "top";
              const mediaClass = isFrameless ? (placement === "left" || placement === "right" ? `uk-card-media-${placement}` : "uk-card-media-top") : "";
              const imageEl = (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title || ""}
                  loading={rawBlock.imageLoading === "eager" || rawBlock.imageLoading === true ? "eager" : "lazy"}
                  className={imageHoverTransitionClass}
                  style={{
                    width: imageWidth ?? "100%",
                    height: imageHeight === "auto" ? "auto" : imageHeight ?? (hasCropFrame ? "100%" : "auto"),
                    maxWidth: "100%",
                    objectFit: mediaStyle.objectFit,
                    objectPosition: mediaStyle.backgroundPosition,
                    borderRadius: isFrameless && isCard ? "4px 4px 0 0" : undefined,
                  }}
                />
              );

              return (
                <div
                  className={`${mediaClass} ${imageBorderClass} ${imageBoxShadowClass} ${imageDecorationClass} shop-builder-grid-image shop-builder-grid-image--align-${mediaAlignment}`.trim()}
                  style={{
                    maxWidth: imageMaxWidth,
                    aspectRatio: hasCropFrame ? mediaStyle.aspectRatio : "auto",
                  } as CSSProperties}
                >
                  {rawBlock.enableLightbox ? (
                    <a href={item.imageUrl} data-caption={item.title || ""}>
                      {imageEl}
                    </a>
                  ) : rawBlock.linkImage || rawBlock.linkPanel ? (
                    <a href={itemUrl} {...builderLinkTargetProps(linkTarget)}>
                      {imageEl}
                    </a>
                  ) : (
                    imageEl
                  )}
                </div>
              );
            };

            return (
              <article
                key={item.id}
                className={`${panelClass} ${cardHover ? "uk-card-hover" : ""} ${panelLayoutClass} shop-builder-grid-card ${isFrameless ? "is-image-frameless" : "is-image-none"} is-content-${contentPaddingClass} is-frame-${
                  block.gridImageFrame ?? "none"
                }`}
                style={
                  {
                    textAlign: item.textAlign ?? rawBlock.textAlignment ?? "left",
                    ...(imagePaddingCustom ? { "--shop-builder-grid-image-padding": imagePaddingCustom } : {}),
                    ...(contentPaddingCustom ? { "--shop-builder-grid-content-padding": contentPaddingCustom } : {}),
                  } as CSSProperties
                }
              >
                {/* Frameless (Flush) image rendered outside card body */}
                {isFrameless && renderImage()}

                <div className={`${bodyPaddingClass} shop-builder-grid-content`.trim()}>
                  {/* Padded image rendered inside card body */}
                  {!isFrameless && renderImage()}

                  {item.iconName && <WebPagesIcon name={item.iconName} size={item.iconSize ?? 20} />}
                  {block.gridShowEyebrow !== false && item.eyebrow && (
                    <Typog
                      as="span"
                      className={`shop-builder-eyebrow ${typographyRoleClass(block.metaTypographyRole)}`}
                      typography={item.typography ?? block.typography}
                      area="eyebrow"
                    >
                      {item.eyebrow}
                    </Typog>
                  )}

                  {metaAlign === "above-title" && renderMeta()}
                  {renderTitle()}
                  {metaAlign === "below-title" && renderMeta()}
                  {renderContent()}
                  {metaAlign === "below-content" && renderMeta()}

                  <RenderChecklist
                    items={item.items}
                    iconName={item.listIcon}
                    colorScheme={item.listIconColorScheme}
                    typography={item.typography ?? block.typography}
                    iconSize={item.listIconSize}
                  />

                  {canShowLink && buttonText && (
                    <div
                      className={`shop-builder-grid-button ${linkMarginTopClass} shop-builder-grid-button--${
                        item.buttonAlign ?? "left"
                      }`}
                    >
                      <a
                        className={`shop-builder-grid-action ${linkStyleClass}`.trim()}
                        href={itemUrl}
                        {...builderLinkTargetProps(linkTarget)}
                      >
                        {buttonText}
                      </a>
                    </div>
                  )}
                </div>
              </article>
            );
          })()
        )}
      </div>
    </div>
  );
}
