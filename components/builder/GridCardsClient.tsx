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
} from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

function getUikitMarginClass(val?: string) {
  if (!val || val === "default" || val === "none") return "";
  return `uk-margin-${val}`;
}

function getUikitTextStyleClass(val?: string) {
  if (!val || val === "none") return "";
  return `uk-${val}`;
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
  if (!val || val === "button-default") return `uk-button uk-button-default ${size && size !== "default" ? `uk-button-${size}` : ""} ${fullWidth ? "uk-width-1-1" : ""}`;
  if (val.startsWith("button-")) return `uk-button uk-${val} ${size && size !== "default" ? `uk-button-${size}` : ""} ${fullWidth ? "uk-width-1-1" : ""}`;
  if (val.startsWith("link-")) return `uk-${val}`;
  return `uk-button uk-button-default`;
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
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const colsCount = rawBlock.columnsDesktop ? (parseInt(rawBlock.columnsDesktop, 10) || (rawBlock.columnsDesktop.includes("column") ? parseInt(rawBlock.columnsDesktop, 10) : 3)) : (block.columns ?? 3);
  const colGapValue = rawBlock.columnGap ?? block.gridGap ?? "medium";
  const rowGapValue = rawBlock.rowGap ?? block.gridGap ?? "medium";

  const filterCategories = Array.from(new Set(items.map((it) => it.eyebrow || it.meta || "Default").filter(Boolean)));
  const filteredItems = activeFilter === "all" ? items : items.filter((it) => (it.eyebrow || it.meta || "Default") === activeFilter);

  const canShowTitle = rawBlock.showTitle !== false && rawBlock.gridShowTitle !== false;
  const canShowMeta = rawBlock.showMeta !== false && block.gridShowMeta !== false;
  const canShowContent = rawBlock.showContent !== false && block.gridShowText !== false;
  const canShowImage = rawBlock.showImage !== false && block.gridShowImage !== false;
  const canShowLink = rawBlock.showLink !== false && block.gridShowButton !== false;

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
            ...(gridGapCustom
              ? { "--shop-builder-grid-gap": gridGapCustom }
              : {}),
            gap: `${colGapValue === "small" ? "15px" : colGapValue === "large" ? "40px" : colGapValue === "none" ? "0px" : "30px"} ${rowGapValue === "small" ? "15px" : rowGapValue === "large" ? "40px" : rowGapValue === "none" ? "0px" : "30px"}`,
          } as CSSProperties
        }
      >
        {filteredItems.slice(0, limit).map((item) =>
          (() => {
            const panelStyle = rawBlock.panelStyle ?? block.gridCardVariant ?? rawBlock.cardVariant ?? "none";
            const panelPadding = rawBlock.panelPadding ?? "none";
            let panelClass = "";

            if (
              panelStyle.startsWith("card-") ||
              panelStyle === "default" ||
              panelStyle === "primary" ||
              panelStyle === "secondary"
            ) {
              const variant = panelStyle.replace("card-", "");
              const paddingCls = panelPadding === "small" ? "uk-card-small" : panelPadding === "large" ? "uk-card-large" : "";
              panelClass = `uk-card uk-card-${variant || "default"} ${paddingCls}`.trim();
            } else if (panelStyle.startsWith("tile-")) {
              const variant = panelStyle.replace("tile-", "");
              const paddingCls = panelPadding === "small" ? "uk-tile-small" : panelPadding === "large" ? "uk-tile-large" : "";
              panelClass = `uk-tile uk-tile-${variant || "default"} ${paddingCls}`.trim();
            }

            const isCard = Boolean(panelClass);
            const cardHover = item.cardHover ?? block.gridCardHover;

            // Title styling & level
            const TitleTag = (block.headingLevel ?? item.titleElement ?? "h3") as any;
            const titleStyleVal = rawBlock.titleStyle ?? item.titleStyle;
            const titleHeadingClass = getUikitTitleHeadingClass(titleStyleVal) || (item.titleStyle && item.titleStyle !== "inherit" ? getUikitHeadingClass(item.titleStyle, item.titleStyle) : "");
            const titleDecorationClass = getUikitTitleDecorationClass(rawBlock.titleDecoration);
            const titleMarginTopClass = getUikitMarginClass(rawBlock.titleMarginTop);

            // Meta styling
            const metaStyleClass = getUikitTextStyleClass(rawBlock.metaStyle ?? "text-meta");
            const metaMarginTopClass = getUikitMarginClass(rawBlock.metaMarginTop);
            const metaAlign = rawBlock.metaAlignment ?? "below-title";

            // Content styling
            const contentStyleClass = getUikitTextStyleClass(rawBlock.contentStyle);
            const contentMarginTopClass = getUikitMarginClass(rawBlock.contentMarginTop);

            // Image styling
            const imageBorderClass = getUikitImageBorderClass(rawBlock.imageBorder);
            const imageBoxShadowClass = getUikitImageBoxShadowClass(rawBlock.imageBoxShadow);
            const imageHoverTransitionClass = getUikitHoverTransitionClass(rawBlock.imageHoverTransition);
            const imageMarginTopClass = getUikitMarginClass(rawBlock.imageMarginTop);
            const imagePaddingClass = rawBlock.alignImageWithoutPadding ? "frameless" : "none";

            // Link / Button styling
            const buttonText = item.buttonLabel || rawBlock.linkText || "Read more";
            const linkStyleClass = getUikitLinkStyleClass(rawBlock.linkStyle, rawBlock.linkButtonSize, rawBlock.linkFullWidth);
            const linkMarginTopClass = getUikitMarginClass(rawBlock.linkMarginTop);
            const linkTarget = rawBlock.linkTarget ?? item.buttonTarget ?? "_self";

            const mediaPlacement = item.mediaPlacement ?? (block as any).gridMediaPlacement ?? "top";
            const isSideMedia = mediaPlacement === "left" || mediaPlacement === "right";
            const mediaWidth = (item as any).mediaWidth ?? (block as any).gridMediaWidth ?? "medium";
            const mediaAlignment = (item as any).mediaAlignment ?? (block as any).gridMediaAlignment ?? "center";
            const mediaStyle = getUikitPanelMediaStyle({
              ratio: isSideMedia ? undefined : (item.mediaRatio ?? block.imageRatio),
              fit: (item.mediaFit ?? block.imageFit ?? "cover") === "contain" ? "contain" : "cover",
              alignment: mediaAlignment,
            });
            const panelLayoutClass = getUikitPanelLayoutClass(mediaPlacement, mediaWidth);
            const itemUrl = item.buttonUrl || "#";

            const renderMeta = () => (
              canShowMeta && item.meta ? (
                <Typog
                  as="div"
                  className={`${metaStyleClass} ${metaMarginTopClass} ${typographyRoleClass(block.metaTypographyRole)}`.trim()}
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
                  className={`shop-builder-title ${titleHeadingClass} ${titleDecorationClass} ${titleMarginTopClass} ${typographyRoleClass(
                    block.titleTypographyRole,
                  )}`.trim()}
                  typography={item.typography ?? block.typography}
                  area="title"
                  style={gridTitleStyle}
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

            return (
              <article
                key={item.id}
                className={`${panelClass} ${cardHover ? "uk-card-hover" : ""} ${panelLayoutClass} shop-builder-grid-card is-image-${imagePaddingClass} is-content-${contentPaddingClass} is-frame-${
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
                {canShowImage && item.imageUrl && (
                  (() => {
                    const placement = item.mediaPlacement ?? (block as any).gridMediaPlacement ?? "top";
                    const isFrameless = rawBlock.alignImageWithoutPadding === true || block.gridImagePadding === "frameless";
                    const mediaClass = isFrameless ? getUikitPanelMediaClass(placement === "left" || placement === "right" ? placement : "top") : "";
                    const imageEl = (
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt || item.title || ""}
                        loading={rawBlock.imageLoading ? "eager" : "lazy"}
                        className={`${imageBorderClass} ${imageBoxShadowClass} ${imageHoverTransitionClass}`.trim()}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: mediaStyle.backgroundSize as CSSProperties["objectFit"],
                        }}
                      />
                    );

                    return (
                      <div
                        className={`${mediaClass} shop-builder-grid-image`}
                        style={{ aspectRatio: mediaStyle.aspectRatio, overflow: "hidden" }}
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
                  })()
                )}

                <div className={`${isCard ? `uk-card-body ${panelPadding === "small" ? "uk-card-small" : panelPadding === "large" ? "uk-card-large" : ""}` : ""} shop-builder-grid-content`}>
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

                  {canShowLink && (buttonText || item.buttonLabel) && (
                    <div
                      className={`shop-builder-grid-button ${linkMarginTopClass} shop-builder-grid-button--${
                        item.buttonAlign ?? "left"
                      }`}
                    >
                      <a
                        className={`shop-builder-grid-action ${linkStyleClass} ${getUikitButtonClass(
                          item.actionStyle ?? item.buttonStyle ?? block.buttonStyle ?? "primary",
                          item.actionSize ?? block.size ?? "default",
                        )}`.trim()}
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
