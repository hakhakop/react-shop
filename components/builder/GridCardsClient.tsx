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
import { isRichText, sanitizeHtml } from "@/lib/safeHtml";
import { resolvePanelColorSemantics } from "@/lib/panelPresentation";

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
  const sharedCard = rawBlock.visualStyle?.card ?? {};
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

  const parseGapPx = (val?: string) => {
    if (val === "small") return "15px";
    if (val === "medium" || val === "default") return "30px";
    if (val === "large") return "40px";
    if (val === "collapse" || val === "none") return "0px";
    return "30px";
  };

  const columnGapCss = parseGapPx(colGapValue);
  const rowGapCss = parseGapPx(rowGapValue);
  const usesYoothemeColumnCentering = rawBlock.spacingContract === "yootheme" && Boolean(rawBlock.centerColumns);
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
        className={`shop-builder-grid shop-builder-grid--gap-${gridGapClass} shop-builder-grid--margin-${blockLegacyGridMargin(block)} ${rawBlock.showDividers ? "uk-grid-divider" : ""} ${usesYoothemeColumnCentering ? "shop-builder-grid--yootheme-column-center uk-flex-center" : ""}`}
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
            alignItems: rawBlock.justifyColumns ? "end" : rawBlock.centerRows ? "center" : undefined,
            justifyItems: rawBlock.centerColumns ? "center" : undefined,
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
            // Explicit false suppresses every Grid-card hover presentation.
            const cardHover = item.cardHover ?? (block.gridCardHover !== undefined ? block.gridCardHover : rawBlock.panelHover) ?? false;
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
                  className={`shop-builder-title ${titleHeadingClass} ${titleDecorationClass} ${titleColorClass} ${titleMarginTopClass} ${typographyRoleClass(
                    rawBlock.titleTypographyRole ?? block.titleTypographyRole,
                  )}`.trim()}
                  typography={item.typography ?? block.typography}
                  area="title"
                  style={{ ...gridTitleStyle, textAlign: sharedCard.titleAlign ?? gridTitleStyle.textAlign, margin: sharedCard.titleMargin ?? gridTitleStyle.margin }}
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
                  className={`${contentStyleClass} ${contentMarginTopClass} ${typographyRoleClass(
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
              const imageEl = (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title || ""}
                  loading={rawBlock.imageLoading === "eager" || rawBlock.imageLoading === true ? "eager" : "lazy"}
                  className={imageHoverTransitionClass}
                  style={{
                    // `Auto` columns use UIkit's natural-width semantics.
                    // Numeric tiers continue to stretch media within a track.
                    width: imageWidth ?? "var(--shop-builder-grid-image-width, var(--shop-builder-grid-image-width-base, 100%))",
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
                } ${builderItemClassName ?? ""}`.trim()}
                style={
                  {
                    textAlign: item.textAlign ?? rawBlock.textAlignment ?? "left",
                    ...colorSemantics.style,
                    ...(imagePaddingCustom ? { "--shop-builder-grid-image-padding": imagePaddingCustom } : {}),
                    ...(contentPaddingCustom ? { "--shop-builder-grid-content-padding": contentPaddingCustom } : {}),
                    ...(builderItemStyle ?? {}),
                  } as CSSProperties
                }
                {...builderItemEventProps}
              >
                {itemChrome?.(item, sourceIndex)}
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

                  {canShowLink && itemUrl && buttonText && (
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
