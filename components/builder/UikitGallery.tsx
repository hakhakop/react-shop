"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import {
  getUikitButtonClass,
  getUikitHeadingClass,
  getUikitImageAttributes,
  getUikitImageClass,
  getUikitImageStyle,
  getUikitImageWrapperClass,
  getUikitTextClass,
  resolveUikitImageSemantics,
} from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { sanitizeHtml, isRichText } from "@/lib/safeHtml";
import { useUikitGridRuntime } from "@/components/builder/useUikitGridRuntime";
import { useUikitLightboxRuntime } from "@/components/builder/useUikitLightboxRuntime";
import { resolveUikitGridStructure, uikitGridAttribute, uikitGridStructureClassName } from "@/lib/uikitGridStructure";
import {
  resolveGalleryImageAspectRatio,
  resolveGalleryImageIntrinsicDimensions,
} from "@/lib/galleryImageGeometry";

type Props = {
  block: BuilderLayoutBlock;
  isCanvas?: boolean;
};

const DEFAULT_GALLERY_ITEMS = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    title: "Creative Artwork",
    meta: "Design & Art",
    content: "3D fluid abstract composition",
    linkUrl: "#",
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    title: "Modern Abstract",
    meta: "Digital Media",
    content: "Vibrant liquid motion art",
    linkUrl: "#",
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    title: "Neon Perspective",
    meta: "Photography",
    content: "High resolution visual showcase",
    linkUrl: "#",
  },
];

const escapeCaptionText = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

export default function UikitGallery({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const gridStructure = resolveUikitGridStructure(rawBlock);
  // Imported YOOtheme Galleries retain their own UIkit presentation contract.
  // Native WebPages Galleries continue through the Card/modal presentation.
  const isYoothemeGallery = rawBlock.spacingContract === "yootheme";
  const gridRef = useRef<HTMLDivElement>(null);

  const rawItems = rawBlock.galleryItems?.length
    ? rawBlock.galleryItems
    : rawBlock.items?.length
    ? rawBlock.items
    : DEFAULT_GALLERY_ITEMS;

  const items = rawItems.map((item: any, idx: number) => {
    const sourceImageUrl = item.imageUrl || item.image || "";
    return {
      id: item.id || String(idx),
      imageUrl: sourceImageUrl || (isYoothemeGallery ? "" : DEFAULT_GALLERY_ITEMS[idx % 3].imageUrl),
      imageAlt: item.imageAlt || item.alt || item.title || "",
      title: item.title || "",
      meta: item.meta || "",
      content: item.content || item.description || "",
      linkUrl: item.linkUrl || item.url || "",
      linkTarget: item.linkTarget || "_self",
      linkLabel: item.linkLabel || item.buttonLabel || "",
      linkAriaLabel: item.linkAriaLabel || "",
      isPendingImage: isYoothemeGallery && !sourceImageUrl,
    };
  });

  const columns = Number(rawBlock.columns) || 3;
  const gap = rawBlock.gridGap ?? "medium";
  const rowGap = rawBlock.gridRowGap ?? gap;
  const isLightbox = !isYoothemeGallery && rawBlock.enableLightbox !== false;
  const usesYoothemeLightbox = isYoothemeGallery && rawBlock.enableLightbox === true;
  const usesYoothemeOverlayLink = isYoothemeGallery && rawBlock.overlayLink === true;
  const overlayMode = rawBlock.overlayMode ?? "cover"; // 'cover' | 'caption'

  // Visibility switches
  const showTitle = rawBlock.gridShowTitle !== false;
  const showMeta = rawBlock.gridShowMeta !== false;
  const showContent = rawBlock.gridShowText !== false;
  const showLink = rawBlock.gridShowButton !== false;

  // React Lightbox Modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev ?? 0) + 1) % items.length);
  }, [lightboxIndex, items.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => ((prev ?? 0) - 1 + items.length) % items.length);
  }, [lightboxIndex, items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handleNext, handlePrev]);

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  const importedChildWidth = (value: unknown, suffix = "") => {
    const count = Number(value);
    return Number.isFinite(count) && count >= 1 && count <= 6 ? `uk-child-width-1-${count}${suffix}` : "";
  };
  const importedChildWidthClass = isYoothemeGallery
    ? [
      importedChildWidth(rawBlock.columnsPhonePortrait),
      importedChildWidth(rawBlock.columnsPhoneLandscape, "@s"),
      importedChildWidth(rawBlock.columnsTabletLandscape, "@m"),
      importedChildWidth(rawBlock.columnsDesktop, "@l"),
      importedChildWidth(rawBlock.columnsLargeScreens, "@xl"),
    ].filter(Boolean).join(" ") || "uk-child-width-1-1 uk-child-width-1-3@m"
    : "";
  const baseGridClass = uikitGridStructureClassName(gridStructure)
    .replace("shop-builder-uikit-grid--column-center", "")
    .trim();
  const gridClass = [
    // Gallery uses UIkit's responsive `uk-child-width-*` cascade directly.
    // The WebPages Grid-only centering helper assigns an explicit item width
    // and would override those responsive Gallery utilities.
    isYoothemeGallery ? baseGridClass.replace("uk-grid-match", "").trim() : baseGridClass,
    importedChildWidthClass,
    gap !== "none" ? `uk-grid-${gap}` : "uk-grid-collapse",
    rowGap !== gap && rowGap !== "none" ? `uk-grid-row-${rowGap}` : "",
    rawBlock.centerColumns === true ? "uk-flex-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const columnWidthClass = isYoothemeGallery ? "" : `uk-width-1-${columns}@m uk-width-1-2@s`;
  const overlayPosition = String(rawBlock.overlayPosition ?? "center");
  const overlayPositionClass = `uk-position-${overlayPosition}`;
  const overlayPaddingClass = rawBlock.overlayPadding === "none" ? "" : rawBlock.overlayPadding === "small" ? "uk-padding-small" : rawBlock.overlayPadding === "large" ? "uk-padding-large" : "uk-padding";
  const overlayMarginClass = rawBlock.overlayMargin === "none" || !rawBlock.overlayMargin ? "" : rawBlock.overlayMargin === "default" ? "uk-position-medium" : `uk-position-${rawBlock.overlayMargin}`;
  const overlayStyleClass = rawBlock.overlayStyle && rawBlock.overlayStyle !== "none"
    ? rawBlock.overlayStyle.startsWith("overlay-") ? `uk-${rawBlock.overlayStyle}` : rawBlock.overlayStyle.startsWith("tile-") ? `uk-tile uk-${rawBlock.overlayStyle}` : ""
    : "";
  const overlayThemeStyle = rawBlock.overlayStyle === "overlay-default"
    ? {
      background: "var(--uk-overlay-default-background)",
      backdropFilter: "var(--uk-overlay-default-backdrop-filter)",
      WebkitBackdropFilter: "var(--uk-overlay-default-backdrop-filter)",
    }
    : rawBlock.overlayStyle === "overlay-primary"
      ? {
        background: "var(--uk-overlay-primary-background)",
        backdropFilter: "var(--uk-overlay-primary-backdrop-filter)",
        WebkitBackdropFilter: "var(--uk-overlay-primary-backdrop-filter)",
      }
      : {};
  const overlayTransitionClass = rawBlock.overlayHover === true ? `uk-transition-${rawBlock.overlayTransition || "fade"}` : "";
  const overlayTextModeClass = rawBlock.overlayTextColor === "light" ? "uk-light" : rawBlock.overlayTextColor === "dark" ? "uk-dark" : "";
  const imageSemantics = resolveUikitImageSemantics(rawBlock);
  const imageStyle = getUikitImageStyle(imageSemantics);
  const imageAttributes = getUikitImageAttributes(imageSemantics);
  const imageClass = getUikitImageClass(imageSemantics);
  const imageWrapperClass = getUikitImageWrapperClass(imageSemantics);
  const imageDecorationClass = rawBlock.imageBoxDecoration && rawBlock.imageBoxDecoration !== "none"
    ? `uk-background-${rawBlock.imageBoxDecoration}`
    : "";
  const imageHeight = rawBlock.imageHeight
    ? /^-?\d+(?:\.\d+)?$/.test(String(rawBlock.imageHeight))
      ? `${rawBlock.imageHeight}px`
      : String(rawBlock.imageHeight)
    : undefined;
  const importedAspectRatio = isYoothemeGallery
    ? resolveGalleryImageAspectRatio(rawBlock.imageWidth, rawBlock.imageHeight)
    : undefined;
  const importedIntrinsicDimensions = isYoothemeGallery
    ? resolveGalleryImageIntrinsicDimensions(rawBlock.imageWidth, rawBlock.imageHeight)
    : undefined;
  const TitleTag = (rawBlock.headingLevel ?? "h2") as React.ElementType;
  const titleClass = getUikitHeadingClass(rawBlock.headingLevel ?? "h2", rawBlock.headingSize);
  const metaClass = getUikitTextClass(rawBlock.metaStyle ?? "text-meta");
  const contentClass = getUikitTextClass(rawBlock.contentStyle);
  const buttonClass = getUikitButtonClass(rawBlock.buttonStyle ?? "primary", rawBlock.size ?? "default");
  const renderRichContent = (value: string) => {
    const safe = sanitizeHtml(value ?? "");
    return isRichText(safe) ? <span dangerouslySetInnerHTML={{ __html: safe }} /> : safe;
  };

  useUikitGridRuntime(gridRef, {
    enabled: isYoothemeGallery && Boolean(gridStructure.masonry || gridStructure.parallax !== undefined),
    masonry: gridStructure.masonry,
    parallax: gridStructure.parallax,
    parallaxJustify: gridStructure.parallaxJustify,
    parallaxStart: gridStructure.parallaxStart,
    parallaxEnd: gridStructure.parallaxEnd,
    revision: items.map((item: any) => `${item.id}:${item.imageUrl}`).join("|"),
  });
  useUikitLightboxRuntime(gridRef, {
    enabled: usesYoothemeLightbox,
    toggle: "a[data-type]",
    revision: items.map((item: any) => `${item.id}:${item.linkUrl || item.imageUrl}:${item.title}:${item.content}`).join("|"),
  });

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--gallery ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div
        ref={gridRef}
        className={gridClass}
        data-uk-grid={uikitGridAttribute(gridStructure)}
        data-uk-lightbox={usesYoothemeLightbox ? "toggle: a[data-type];" : undefined}
      >
        {items.map((item: any, index: number) => {
          const titleAlign = rawBlock.headingAlign ?? rawBlock.textAlign ?? rawBlock.alignment ?? "left";
          const metaAlign = rawBlock.metaAlign ?? titleAlign;
          const contentAlign = rawBlock.contentAlign ?? titleAlign;
          const itemUrl = item.linkUrl;
          const actionLabel = item.linkLabel || rawBlock.linkText || rawBlock.buttonLabel || "";
          const hasAction = Boolean(itemUrl && actionLabel);
          // YOOtheme Lightbox upgrades the existing item link into a UIkit
          // media trigger. If no item link was authored it falls back to the
          // item image; normal links remain normal only when Lightbox is off.
          const lightboxUrl = itemUrl || item.imageUrl;
          const lightboxCaption = sanitizeHtml([
            item.title ? `<h4 class="uk-margin-remove">${escapeCaptionText(item.title)}</h4>` : "",
            item.content || "",
          ].filter(Boolean).join(""));
          const hasLightboxAction = usesYoothemeLightbox && Boolean(lightboxUrl && actionLabel);
          // `overlay_link` is an element-level YOOtheme semantic. Its link is
          // a sibling media surface, never a wrapper around a visible action,
          // so both remain valid, keyboard-accessible anchors.
          const overlayLinkUrl = usesYoothemeLightbox ? lightboxUrl : itemUrl;
          const hasOverlayLink = usesYoothemeOverlayLink && Boolean(overlayLinkUrl);
          const overlayLinkLabel = item.linkAriaLabel || item.title || actionLabel || (usesYoothemeLightbox ? "Open image" : "Open link");
          return (
            <div key={item.id} className={columnWidthClass}>
              <div
                className={isYoothemeGallery ? `el-item ${overlayTextModeClass}`.trim() : "uk-card uk-card-default uk-overflow-hidden"}
                style={{
                  position: "relative",
                  ...(isYoothemeGallery ? {} : { overflow: "hidden", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", width: imageStyle.width, maxWidth: imageStyle.maxWidth, marginInline: imageSemantics.alignment === "left" ? "0 auto" : imageSemantics.alignment === "right" ? "0 0 0 auto" : "auto" }),
                }}
              >
                <div
                  className={`${isYoothemeGallery ? "uk-flex-1" : ""} uk-inline-clip uk-transition-toggle ${isYoothemeGallery ? "" : imageWrapperClass} ${isYoothemeGallery ? "" : imageDecorationClass}`.trim()}
                  style={{
                    ...(isYoothemeGallery ? {} : { width: "100%", display: "block" }),
                    cursor: isLightbox ? "pointer" : undefined,
                    aspectRatio: isYoothemeGallery ? undefined : imageStyle.aspectRatio,
                    height: isYoothemeGallery ? undefined : imageStyle.aspectRatio ? undefined : imageHeight,
                    position: isYoothemeGallery ? undefined : imageStyle.aspectRatio ? "relative" : undefined,
                  }}
                  onClick={(e) => {
                    if (isLightbox) {
                      e.preventDefault();
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }
                  }}
                >
                  {item.isPendingImage ? (
                    <div
                      aria-hidden="true"
                      className="shop-builder-gallery-image-placeholder"
                      style={{
                        width: importedIntrinsicDimensions ? `${importedIntrinsicDimensions.width}px` : "100%",
                        maxWidth: "100%",
                        aspectRatio: importedAspectRatio ?? "1 / 1",
                        background: "var(--uk-global-muted-background, #f8f8f8)",
                      }}
                    />
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt}
                      className={`${isYoothemeGallery ? "el-image" : imageClass} uk-transition-scale-up uk-transition-opaque`}
                      loading={rawBlock.imageLoading ?? "lazy"}
                      width={isYoothemeGallery ? importedIntrinsicDimensions?.width : undefined}
                      height={isYoothemeGallery ? importedIntrinsicDimensions?.height : undefined}
                      {...imageAttributes}
                      style={{
                        width: isYoothemeGallery ? "auto" : "100%",
                        maxWidth: isYoothemeGallery ? "100%" : undefined,
                        height: isYoothemeGallery ? "auto" : imageStyle.aspectRatio ? "100%" : imageHeight ?? "260px",
                        objectFit: isYoothemeGallery ? undefined : imageStyle.objectFit,
                        display: "block",
                        ...(!isYoothemeGallery && imageStyle.position ? { position: imageStyle.position, inset: imageStyle.inset } : {}),
                      }}
                      onError={(e) => {
                        if (isYoothemeGallery) {
                          e.currentTarget.style.visibility = "hidden";
                          return;
                        }
                        // Native Galleries retain their authored default fallback.
                        e.currentTarget.src = DEFAULT_GALLERY_ITEMS[index % 3].imageUrl;
                      }}
                    />
                  )}

                  {hasOverlayLink && (
                    <a
                      href={overlayLinkUrl}
                      className="el-overlay-link uk-position-cover"
                      aria-label={overlayLinkLabel}
                      {...(usesYoothemeLightbox
                        ? {
                          "data-type": "image",
                          "data-caption": lightboxCaption || undefined,
                          "data-alt": item.imageAlt || undefined,
                        }
                        : builderLinkTargetProps(item.linkTarget || rawBlock.linkTarget))}
                      style={{ zIndex: 2 }}
                    />
                  )}

                  {/* YOOtheme overlay: Cover fills the media; Caption is a positioned content box. */}
                  {(showMeta || showTitle || showContent || showLink) && (
                    <div
                      style={isYoothemeGallery ? { ...overlayThemeStyle, ...(hasOverlayLink ? { zIndex: 3, pointerEvents: "none" as const } : {}) } : {
                        position: "absolute", inset: 0, padding: "20px", color: "#ffffff", borderRadius: "12px",
                        background: "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%)",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end", textAlign: titleAlign,
                        ...(hasOverlayLink ? { zIndex: 3, pointerEvents: "none" } : {}),
                      }}
                      className={isYoothemeGallery
                        ? `${overlayMode === "cover" ? "uk-position-cover" : overlayPositionClass} ${overlayMarginClass} ${overlayStyleClass} ${overlayTransitionClass}`.trim()
                        : "uk-transition-fade"}
                    >
                    <div className={isYoothemeGallery ? `uk-overlay ${overlayPaddingClass} uk-margin-remove-first-child`.trim() : ""}>
                      {showMeta && item.meta && rawBlock.panelMetaPosition !== "below-title" && (
                        <div
                          className={`${metaClass} ${typographyRoleClass(rawBlock.metaTypographyRole)}`.trim()}
                          style={{
                            color: isYoothemeGallery ? undefined : "rgba(255, 255, 255, 0.75)",
                            ...(rawBlock.metaStyle ? {} : { fontSize: "0.825rem", textTransform: "uppercase", letterSpacing: "0.05em" }),
                            marginBottom: "4px",
                            textAlign: metaAlign,
                          }}
                        >
                          {item.meta}
                        </div>
                      )}
                      {showTitle && item.title && (
                        <TitleTag
                          className={`${titleClass} ${typographyRoleClass(rawBlock.titleTypographyRole)}`.trim()}
                          style={{ color: isYoothemeGallery ? undefined : "#ffffff", lineHeight: isYoothemeGallery ? undefined : "1.3", textAlign: titleAlign }}
                        >
                          {item.title}
                        </TitleTag>
                      )}
                      {showMeta && item.meta && rawBlock.panelMetaPosition === "below-title" && (
                        <div
                          className={`${metaClass} ${typographyRoleClass(rawBlock.metaTypographyRole)}`.trim()}
                          style={{ color: isYoothemeGallery ? undefined : "rgba(255, 255, 255, 0.75)", textAlign: metaAlign }}
                        >
                          {item.meta}
                        </div>
                      )}
                      {showContent && item.content && (
                        <div
                          className={`${rawBlock.contentMarginTop === "none" ? "" : "uk-margin-small-top"} ${contentClass} ${typographyRoleClass(rawBlock.contentTypographyRole)}`.trim()}
                          style={{
                            color: isYoothemeGallery ? undefined : "rgba(255, 255, 255, 0.9)",
                            ...(rawBlock.contentStyle ? {} : { fontSize: "0.9rem" }),
                            marginTop: rawBlock.contentMarginTop === "none" ? undefined : "6px",
                            textAlign: contentAlign,
                          }}
                        >
                          {renderRichContent(item.content)}
                        </div>
                      )}
                      {showLink && hasLightboxAction && (
                        <div className="uk-margin-small-top" style={{ textAlign: contentAlign, pointerEvents: "auto" }}>
                          <a
                            href={lightboxUrl}
                            data-type="image"
                            data-caption={lightboxCaption || undefined}
                            data-alt={item.imageAlt || undefined}
                            className={buttonClass}
                            aria-label={item.linkAriaLabel || undefined}
                          >
                            {actionLabel}
                          </a>
                        </div>
                      )}
                      {showLink && !usesYoothemeLightbox && hasAction && (
                        <div className="uk-margin-small-top" style={{ textAlign: contentAlign, pointerEvents: "auto" }}>
                          <a
                            href={itemUrl}
                            className={buttonClass}
                            aria-label={item.linkAriaLabel || undefined}
                            {...builderLinkTargetProps(item.linkTarget || rawBlock.linkTarget)}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {actionLabel}
                          </a>
                        </div>
                      )}
                    </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* REACT LIGHTBOX MODAL */}
      {isLightbox && lightboxIndex !== null && items[lightboxIndex] && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(10, 10, 12, 0.94)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#ffffff",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >
            <X size={24} />
          </button>

          {/* Prev Arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              style={{
                position: "absolute",
                left: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Lightbox Content Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={items[lightboxIndex].imageUrl}
              alt={items[lightboxIndex].title}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />

            <div style={{ textAlign: "center", marginTop: "16px", color: "#ffffff" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{items[lightboxIndex].title}</div>
              {items[lightboxIndex].meta && (
                <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
                  {items[lightboxIndex].meta}
                </div>
              )}
              {items[lightboxIndex].content && (
                <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", marginTop: "6px" }}>
                  {items[lightboxIndex].content}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "8px" }}>
                {lightboxIndex + 1} of {items.length}
              </div>
            </div>
          </div>

          {/* Next Arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              style={{
                position: "absolute",
                right: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
