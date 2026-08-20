"use client";

import React, { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";
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
  getUikitSvgColor,
  getUikitSvgColorClass,
} from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { resolveCanonicalGridAction } from "@/lib/builderActions";
import { isRichText, sanitizeHtml } from "@/lib/safeHtml";
import { resolvePanelColorSemantics } from "@/lib/panelPresentation";
import { resolveGeneralTextAlignment } from "@/lib/builderElementShell";
import { resolveUikitGridStructure, uikitGridAttribute, uikitGridGapCss, uikitGridStructureClassName } from "@/lib/uikitGridStructure";
import { useUikitGridRuntime } from "@/components/builder/useUikitGridRuntime";

function getUikitMarginClass(val?: string) {
  if (!val || val === "default" || val === "none") return "";
  return `uk-margin-${val}`;
}

function getUikitTextStyleClass(val?: string) {
  // Grid's Meta and Content fields accept both Text and Heading presets in
  // YOOtheme. Reuse the shared token adapters instead of a Grid-only
  // typography vocabulary.
  return getUikitTextClass(val) || getUikitHeadingClass(val, val);
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
  itemChrome,
  itemProps,
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
  /** Builder-only affordances decorate the shared presentation; they never own Grid styles. */
  itemChrome?: (item: any, index: number) => React.ReactNode;
  /** Builder-only event handlers decorate each shared card without owning presentation. */
  itemProps?: (item: any, index: number) => React.HTMLAttributes<HTMLElement>;
}) {
  const rawBlock = block as any;
  const gridRef = useRef<HTMLDivElement>(null);
  const gridStructure = resolveUikitGridStructure(rawBlock);
  const sharedCard = rawBlock.visualStyle?.card ?? {};
  // YOOtheme Grid owns one General alignment value for the complete item
  // contract. The shared resolver keeps legacy aliases read-compatible while
  // preventing Grid from creating a second precedence chain.
  const itemContentAlignment = resolveGeneralTextAlignment(rawBlock) ?? "left";
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Grid breakpoints are semantic values. In particular YOOtheme `auto` is a
  // real Phone Portrait mode, not a malformed number to replace with 2/3.
  type GridColumns = number | "auto";
  const resolveColumns = (value: unknown, fallback: GridColumns): GridColumns => {
    if (value === undefined || value === null || value === "" || value === "inherit") return fallback;
    if (String(value) === "auto") return "auto";
    const parsed = Number.parseInt(String(value), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  const phonePortraitColumns = resolveColumns(rawBlock.columnsPhonePortrait, resolveColumns(block.columns, 3));
  const phoneLandscapeColumns = resolveColumns(rawBlock.columnsPhoneLandscape, phonePortraitColumns);
  const tabletLandscapeColumns = resolveColumns(rawBlock.columnsTabletLandscape ?? block.columns, phoneLandscapeColumns);
  const desktopColumns = resolveColumns(rawBlock.columnsDesktop, tabletLandscapeColumns);
  const largeScreenColumns = resolveColumns(rawBlock.columnsLargeScreens, desktopColumns);
  const gridTemplate = (columns: GridColumns) =>
    columns === "auto" ? "repeat(auto-fit, minmax(min-content, max-content))" : `repeat(${columns}, minmax(0, 1fr))`;
  const imageWidthForColumns = (columns: GridColumns) => columns === "auto" ? "auto" : "100%";
  const cardWidthForColumns = (columns: GridColumns) => columns === "auto" ? "max-content" : "auto";
  const displayForColumns = (columns: GridColumns) => columns === "auto" ? "flex" : "grid";

  // Resolved Gaps
  const colGapValue = rawBlock.gridGap ?? rawBlock.columnGap ?? "medium";
  const rowGapValue = rawBlock.gridRowGap ?? rawBlock.rowGap ?? colGapValue ?? "medium";

  // `tags` is the canonical per-item filter owner. Older WebPages documents
  // retain the former metadata fallback until they are explicitly tagged.
  const itemFilterTags = (item: any) =>
    Array.isArray(item.tags) && item.tags.length
      ? item.tags.filter((tag: unknown) => typeof tag === "string" && tag.trim()).map((tag: string) => tag.trim())
      : [item.eyebrow || item.meta || "Default"].filter(Boolean);
  const filterCategories = Array.from(new Set(items.flatMap(itemFilterTags)));
  // Preserve source indices after filtering so Builder adapters always act on the
  // persisted items collection rather than the transient filtered list.
  const filteredItems = items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .filter(({ item }) => activeFilter === "all" || itemFilterTags(item).includes(activeFilter));

  // Field Visibility
  const canShowTitle = (rawBlock.gridShowTitle ?? rawBlock.showTitle ?? true) !== false;
  const canShowMeta = (rawBlock.gridShowMeta ?? rawBlock.showMeta ?? true) !== false;
  const canShowContent = (rawBlock.gridShowText ?? rawBlock.gridShowContent ?? rawBlock.showContent ?? true) !== false;
  const canShowImage = (rawBlock.gridShowImage ?? rawBlock.showImage ?? true) !== false;
  const canShowLink = (rawBlock.gridShowButton ?? rawBlock.showLink ?? true) !== false;

  const columnGapCss = uikitGridGapCss(colGapValue);
  const rowGapCss = uikitGridGapCss(rowGapValue);
  const itemBasisForColumns = (columns: GridColumns) => {
    if (columns === "auto") return "auto";
    const gapCount = Math.max(0, columns - 1);
    return `calc((100% - (${gapCount} * ${columnGapCss})) / ${columns})`;
  };
  const selectFilter = (event: React.SyntheticEvent, filter: string) => {
    // UIkit's subnav/tab runtime can stop a bubbling click after changing its
    // visual active state. Pointer/key activation updates the canonical React
    // state before that runtime sees its own click handling.
    event.preventDefault();
    event.stopPropagation();
    setActiveFilter(filter);
  };

  useUikitGridRuntime(gridRef, {
    enabled: Boolean(gridStructure.masonry || gridStructure.parallax !== undefined),
    masonry: gridStructure.masonry,
    parallax: gridStructure.parallax,
    parallaxJustify: gridStructure.parallaxJustify,
    parallaxStart: gridStructure.parallaxStart,
    parallaxEnd: gridStructure.parallaxEnd,
    revision: filteredItems.map(({ item }) => `${item.id}:${item.imageUrl ?? ""}`).join("|"),
  });

  return (
    <div
      className="shop-builder-grid-wrapper"
      data-uk-lightbox={rawBlock.enableLightbox ? "animation: slide" : undefined}
      data-grid-active-filter={activeFilter}
      data-grid-visible-item-count={filteredItems.length}
    >
      {rawBlock.enableFilter && filterCategories.length > 0 && (
        <ul className={`uk-subnav ${rawBlock.filterStyle === "pill" ? "uk-subnav-pill" : rawBlock.filterStyle === "tabs" ? "uk-tab" : ""} uk-flex-center uk-margin-bottom`}>
          <li className={activeFilter === "all" ? "uk-active" : ""}>
            <button
              type="button"
              onPointerDown={(event) => selectFilter(event, "all")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") selectFilter(event, "all");
              }}
              style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
            >
              All
            </button>
          </li>
          {filterCategories.map((cat) => (
            <li key={cat} className={activeFilter === cat ? "uk-active" : ""}>
              <button
                type="button"
                onPointerDown={(event) => selectFilter(event, cat)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") selectFilter(event, cat);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={gridRef}
        className={`shop-builder-grid ${uikitGridStructureClassName(gridStructure)} shop-builder-grid--gap-${gridGapClass} shop-builder-grid--margin-${blockLegacyGridMargin(block)}`}
        data-uk-grid={uikitGridAttribute(gridStructure)}
        style={
          {
            "--shop-builder-grid-template": gridTemplate(phonePortraitColumns),
            "--shop-builder-grid-template-phone-landscape": gridTemplate(phoneLandscapeColumns),
            "--shop-builder-grid-template-tablet": gridTemplate(tabletLandscapeColumns),
            "--shop-builder-grid-template-desktop": gridTemplate(desktopColumns),
            "--shop-builder-grid-template-xlarge": gridTemplate(largeScreenColumns),
            "--shop-builder-grid-image-width-base": imageWidthForColumns(phonePortraitColumns),
            "--shop-builder-grid-image-width-phone-landscape": imageWidthForColumns(phoneLandscapeColumns),
            "--shop-builder-grid-image-width-tablet": imageWidthForColumns(tabletLandscapeColumns),
            "--shop-builder-grid-image-width-desktop": imageWidthForColumns(desktopColumns),
            "--shop-builder-grid-image-width-xlarge": imageWidthForColumns(largeScreenColumns),
            "--shop-builder-grid-card-width-base": cardWidthForColumns(phonePortraitColumns),
            "--shop-builder-grid-card-width-phone-landscape": cardWidthForColumns(phoneLandscapeColumns),
            "--shop-builder-grid-card-width-tablet": cardWidthForColumns(tabletLandscapeColumns),
            "--shop-builder-grid-card-width-desktop": cardWidthForColumns(desktopColumns),
            "--shop-builder-grid-card-width-xlarge": cardWidthForColumns(largeScreenColumns),
            "--shop-builder-grid-display-base": displayForColumns(phonePortraitColumns),
            "--shop-builder-grid-display-phone-landscape": displayForColumns(phoneLandscapeColumns),
            "--shop-builder-grid-display-tablet": displayForColumns(tabletLandscapeColumns),
            "--shop-builder-grid-display-desktop": displayForColumns(desktopColumns),
            "--shop-builder-grid-display-xlarge": displayForColumns(largeScreenColumns),
            "--shop-builder-grid-item-basis-base": itemBasisForColumns(phonePortraitColumns),
            "--shop-builder-grid-item-basis-phone-landscape": itemBasisForColumns(phoneLandscapeColumns),
            "--shop-builder-grid-item-basis-tablet": itemBasisForColumns(tabletLandscapeColumns),
            "--shop-builder-grid-item-basis-desktop": itemBasisForColumns(desktopColumns),
            "--shop-builder-grid-item-basis-xlarge": itemBasisForColumns(largeScreenColumns),
            columnGap: columnGapCss,
            rowGap: rowGapCss,
          } as CSSProperties
        }
      >
        {filteredItems.slice(0, limit).map(({ item, sourceIndex }) =>
          (() => {
            // Grid Card Style is canonical. Legacy Panel aliases may only fill
            // an absent value; they can never override an explicit `None`.
            const panelStyle = item.cardVariant ?? block.gridCardVariant ?? rawBlock.panelVariant ?? rawBlock.panelStyle ?? rawBlock.cardVariant ?? "blank";
            const panelPadding = rawBlock.gridCardSize ?? rawBlock.panelSize ?? rawBlock.panelPadding ?? "none";
            let panelClass = "";

            if (panelStyle === "card-hover") {
              panelClass = "uk-card uk-card-default";
            } else if (
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
            // Explicit false suppresses every Grid-card hover presentation.
            const cardHover = panelStyle === "card-hover" || (item.cardHover ?? (rawBlock.panelHover !== undefined ? rawBlock.panelHover : block.gridCardHover) ?? false);
            const colorSemantics = resolvePanelColorSemantics({
              ...rawBlock,
              cardVariant: panelStyle,
              titleColor: rawBlock.titleColor,
              metaColor: rawBlock.metaColor,
              contentColor: rawBlock.contentColor,
            });

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
            const metaStyleClass = getUikitTextStyleClass(
              rawBlock.metaStyle ?? (rawBlock.spacingContract === "yootheme" ? undefined : "text-meta"),
            );
            const metaColorVal = rawBlock.metaColor;
            const metaColorClass = metaColorVal && metaColorVal !== "none" && metaColorVal !== "default"
              ? (metaColorVal.startsWith("uk-text-") ? metaColorVal : `uk-text-${metaColorVal}`)
              : "";
            const metaMarginTopClass = getUikitMarginClass(rawBlock.metaMarginTop);
            const rawMetaAlign = rawBlock.gridMetaAlign ?? rawBlock.metaAlignment ?? "below-title";
            const metaAlign = rawMetaAlign === "above" ? "above-title" : rawMetaAlign === "below" ? "below-title" : rawMetaAlign === "content" ? "below-content" : rawMetaAlign;
            const MetaTag = (rawBlock.gridMetaHtmlElement ?? (rawBlock.spacingContract === "yootheme" ? "h3" : "div")) as any;
            const metaElement = String(rawBlock.gridMetaHtmlElement ?? (rawBlock.spacingContract === "yootheme" ? "h3" : "div"));
            const metaElementClass = /^h[1-6]$/.test(metaElement)
              ? `uk-${metaElement}`
              : "";

            // Content styling
            const contentStyleClass = getUikitTextStyleClass(rawBlock.contentStyle);
            const contentMarginTopClass = getUikitMarginClass(rawBlock.contentMarginTop);
            const isYoothemeGrid = rawBlock.spacingContract === "yootheme";

            // Image styling
            // `imageShape` and `imageShadow` are the canonical shared Image
            // owners. Older Grid documents may retain the previous aliases,
            // but those are read fallbacks only.
            const imageBorderClass = getUikitImageBorderClass(rawBlock.imageShape ?? rawBlock.imageBorder);
            const imageBoxShadowClass = getUikitImageBoxShadowClass(rawBlock.imageShadow ?? rawBlock.imageBoxShadow);
            const imageDecorationClass = rawBlock.imageBoxDecoration && rawBlock.imageBoxDecoration !== "none"
              ? (rawBlock.imageBoxDecoration === "shadow" ? "uk-box-shadow-bottom" : `uk-background-${rawBlock.imageBoxDecoration}`)
              : "";
            const imageHoverTransitionClass = getUikitHoverTransitionClass(rawBlock.imageHoverTransition);
            const isFrameless = rawBlock.panelImageNoPadding === true || rawBlock.alignImageWithoutPadding === true || imagePaddingClass === "frameless";
            const panelExpand = rawBlock.panelExpand === "image" || rawBlock.panelExpand === "content" || rawBlock.panelExpand === "both"
              ? rawBlock.panelExpand
              : "none";
            const panelHeightClass = rawBlock.panelHeightExpand === true ? "shop-builder-panel--height-expand" : "";
            const panelExpandClass = panelExpand !== "none" ? `shop-builder-panel--expand-${panelExpand}` : "";
            const panelLinkClass = rawBlock.linkPanel === true ? "shop-builder-panel--linked" : "";
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
            // Explicit media alignment has higher precedence than Grid text
            // alignment. Without one, media participates in the same item
            // alignment contract as YOOtheme's inline Grid image.
            const mediaAlignment = (item as any).mediaAlignment ?? itemContentAlignment;
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
                  className={`${metaStyleClass} ${metaElementClass} ${metaColorClass} ${metaMarginTopClass} ${typographyRoleClass(block.metaTypographyRole)}`.trim()}
                  area="body"
                  typography={item.typography ?? block.typography}
                  style={colorSemantics.metaStyle}
                >
                  {item.meta}
                </Typog>
              ) : null
            );

            const safeTitle = item.title ? sanitizeHtml(item.title) : "";
            const safeContent = item.text ? sanitizeHtml(item.text) : "";
            const titleContent = isRichText(safeTitle)
              ? <span dangerouslySetInnerHTML={{ __html: safeTitle }} />
              : <BuilderLineBreakText text={safeTitle} />;

            const renderTitle = () => (
              canShowTitle && safeTitle ? (
                <Typog
                  as={TitleTag}
                  className={`shop-builder-title ${titleHeadingClass} ${titleDecorationClass} ${titleColorClass} ${titleMarginTopClass || (isYoothemeGrid ? "uk-margin-top" : "")} ${isYoothemeGrid ? "uk-margin-remove-bottom" : ""} ${typographyRoleClass(
                    rawBlock.titleTypographyRole ?? block.titleTypographyRole,
                  )}`.trim()}
                  typography={item.typography ?? block.typography}
                  area="title"
                  style={{ ...gridTitleStyle, textAlign: sharedCard.titleAlign ?? gridTitleStyle.textAlign, margin: isYoothemeGrid ? undefined : sharedCard.titleMargin ?? gridTitleStyle.margin }}
                >
                  {rawBlock.linkTitle || rawBlock.linkPanel ? (
                    <a href={itemUrl} {...builderLinkTargetProps(linkTarget)}>
                      {titleContent}
                    </a>
                  ) : (
                    titleContent
                  )}
                </Typog>
              ) : null
            );

            const renderContent = () => (
              canShowContent && safeContent ? (
                <Typog
                  as="div"
                  className={`${contentStyleClass} ${contentMarginTopClass || (isYoothemeGrid ? "uk-margin-top" : "")} ${typographyRoleClass(
                    block.contentTypographyRole,
                  )}`.trim()}
                  typography={item.typography ?? block.typography}
                  area="body"
                >
                  {safeContent}
                </Typog>
              ) : null
            );

            const renderImage = () => {
              if (!canShowImage || !item.imageUrl) return null;
              const placement = item.mediaPlacement ?? (block as any).gridMediaPlacement ?? "top";
              const mediaClass = isFrameless ? (placement === "left" || placement === "right" ? `uk-card-media-${placement}` : "uk-card-media-top") : "";
              const imageElementStyle = {
                // `Auto` columns use UIkit's natural-width semantics.
                // Numeric tiers continue to stretch media within a track.
                width: imageWidth ?? "var(--shop-builder-grid-image-width, var(--shop-builder-grid-image-width-base, 100%))",
                height: imageHeight === "auto" ? "auto" : imageHeight ?? (hasCropFrame ? "100%" : "auto"),
                maxWidth: "100%",
                objectFit: mediaStyle.objectFit,
                objectPosition: mediaStyle.backgroundPosition,
                borderRadius: isFrameless && isCard ? "4px 4px 0 0" : undefined,
              } as CSSProperties;
              const fallbackImage = (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title || ""}
                  loading={rawBlock.imageLoading === "eager" || rawBlock.imageLoading === true ? "eager" : "lazy"}
                  className={imageHoverTransitionClass}
                  style={imageElementStyle}
                />
              );
              const isStylableSvg = rawBlock.imageSvgInline === true && /\.svg(?:[?#].*)?$/i.test(item.imageUrl);
              const svgColorClass = getUikitSvgColorClass(rawBlock.imageSvgColor);
              const preserveIntrinsicSvgSize = isStylableSvg && !imageWidth && !imageHeight && !hasCropFrame;
              const imageEl = isStylableSvg ? (
                <UikitStylableSvg
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title || ""}
                  className={`${imageHoverTransitionClass} ${svgColorClass} el-image`.trim()}
                  color={svgColorClass ? undefined : getUikitSvgColor(rawBlock.imageSvgColor)}
                  fit={mediaStyle.objectFit === "cover" ? "cover" : "contain"}
                  loading={rawBlock.imageLoading === "eager" || rawBlock.imageLoading === true ? "eager" : "lazy"}
                  preserveIntrinsicSize={preserveIntrinsicSvgSize}
                  fallback={fallbackImage}
                  style={preserveIntrinsicSvgSize ? { maxWidth: "100%" } : imageElementStyle}
                />
              ) : fallbackImage;

              return (
                <div
                  className={`${mediaClass} ${imageBorderClass} ${imageBoxShadowClass} ${imageDecorationClass} shop-builder-grid-image shop-builder-grid-image--align-${mediaAlignment}`.trim()}
                  data-image-ratio={hasCropFrame ? "true" : undefined}
                  style={{
                    maxWidth: imageMaxWidth,
                    aspectRatio: hasCropFrame ? mediaStyle.aspectRatio : "auto",
                    justifyContent: mediaAlignment === "right" ? "flex-end" : mediaAlignment === "center" ? "center" : "flex-start",
                    // The Grid content body is a column flex container. Its
                    // intrinsic-width media wrapper therefore needs an
                    // explicit cross-axis position; justify-content only
                    // aligns the SVG inside that wrapper.
                    alignSelf: mediaAlignment === "right" ? "flex-end" : mediaAlignment === "center" ? "center" : "flex-start",
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

            const builderItemProps = itemProps?.(item, sourceIndex) ?? {};
            const {
              className: builderItemClassName,
              style: builderItemStyle,
              ...builderItemEventProps
            } = builderItemProps;

            return (
              <article
                key={item.id}
                className={`${panelClass} ${colorSemantics.className} ${cardHover ? "uk-card-hover shop-builder-grid-card--hover-enabled" : "shop-builder-grid-card--hover-disabled"} ${panelLayoutClass} shop-builder-grid-card ${isFrameless ? "is-image-frameless" : "is-image-none"} is-content-${contentPaddingClass} is-frame-${
                  block.gridImageFrame ?? "none"
                } ${panelHeightClass} ${panelExpandClass} ${panelLinkClass} ${rawBlock.spacingContract === "yootheme" ? "shop-builder-grid-card--yootheme" : ""} ${builderItemClassName ?? ""}`.trim()}
                style={
                  {
                    textAlign: itemContentAlignment,
                    ...colorSemantics.style,
                    ...(imagePaddingCustom ? { "--shop-builder-grid-image-padding": imagePaddingCustom } : {}),
                    ...(contentPaddingCustom ? { "--shop-builder-grid-content-padding": contentPaddingCustom } : {}),
                    ...(builderItemStyle ?? {}),
                  } as CSSProperties
                }
                {...builderItemEventProps}
              >
                {itemChrome?.(item, sourceIndex)}
                {rawBlock.linkPanel === true && itemUrl && (
                  <a
                    className="shop-builder-panel-link-overlay"
                    href={itemUrl}
                    aria-label={item.title || buttonText || "Open item"}
                    {...builderLinkTargetProps(linkTarget)}
                  />
                )}
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
                  {metaAlign === "above-content" && renderMeta()}
                  {renderContent()}
                  {metaAlign === "below-content" && renderMeta()}

                  <RenderChecklist
                    items={item.items}
                    iconName={item.listIcon}
                    colorScheme={item.listIconColorScheme}
                    typography={item.typography ?? block.typography}
                    iconSize={item.listIconSize}
                  />

                  {canShowLink && itemUrl && buttonText && (
                    <div
                      className={`shop-builder-grid-button ${linkMarginTopClass} shop-builder-grid-button--${
                        item.buttonAlign ?? "left"
                      }`}
                    >
                      <a
                        className={`shop-builder-grid-action ${linkStyleClass}`.trim()}
                        style={action.fullWidth ? { width: "100%" } : undefined}
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
