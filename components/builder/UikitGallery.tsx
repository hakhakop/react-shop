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

  const items = rawItems.map((item: any, idx: number) => ({
    id: item.id || String(idx),
    imageUrl: item.imageUrl || item.image || DEFAULT_GALLERY_ITEMS[idx % 3].imageUrl,
    imageAlt: item.imageAlt || item.alt || item.title || "",
    title: item.title || "",
    meta: item.meta || "",
    content: item.content || item.description || "",
    linkUrl: item.linkUrl || item.url || "",
    linkTarget: item.linkTarget || "_self",
    linkLabel: item.linkLabel || item.buttonLabel || "",
    linkAriaLabel: item.linkAriaLabel || "",
  }));

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

  const gridClass = [
    uikitGridStructureClassName(gridStructure),
    gap !== "none" ? `uk-grid-${gap}` : "uk-grid-collapse",
    rowGap !== gap && rowGap !== "none" ? `uk-grid-row-${rowGap}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const importedWidth = (value: unknown, suffix = "") => {
    const count = Number(value);
    return Number.isFinite(count) && count >= 1 && count <= 6 ? `uk-width-1-${count}${suffix}` : "";
  };
  const columnWidthClass = isYoothemeGallery
    ? `${importedWidth(rawBlock.columnsPhonePortrait)} ${importedWidth(rawBlock.columnsTabletLandscape, "@m")}`.trim() || "uk-width-1-1 uk-width-1-3@m"
    : `uk-width-1-${columns}@m uk-width-1-2@s`;
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
  const importedImageWidth = isYoothemeGallery ? imageStyle.width : undefined;
  const importedImageHeight = isYoothemeGallery ? imageStyle.height : undefined;
  const importedHasBothDimensions = Boolean(importedImageWidth && importedImageHeight);
  const importedMediaWrapperStyle = isYoothemeGallery
    ? {
      width: importedImageWidth ?? "100%",
      maxWidth: "100%",
      display: "block",
      ...(importedHasBothDimensions ? { aspectRatio: `${importedImageWidth} / ${importedImageHeight}`, position: "relative" as const } : {}),
    }
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
          const titleAlign = rawBlock.headingAlign ?? rawBlock.alignment ?? "left";
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
                className={isYoothemeGallery ? "el-item uk-light uk-transition-toggle uk-inline-clip" : "uk-card uk-card-default uk-overflow-hidden"}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  ...(isYoothemeGallery ? {} : { borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", width: imageStyle.width, maxWidth: imageStyle.maxWidth, marginInline: imageSemantics.alignment === "left" ? "0 auto" : imageSemantics.alignment === "right" ? "0 0 0 auto" : "auto" }),
                }}
              >
                <div
                  className={`uk-inline-clip uk-transition-toggle ${isYoothemeGallery ? "" : imageWrapperClass} ${isYoothemeGallery ? "" : imageDecorationClass}`.trim()}
                  style={{
                    ...(importedMediaWrapperStyle ?? { width: "100%", display: "block" }),
                    cursor: isLightbox ? "pointer" : "default",
                    aspectRatio: isYoothemeGallery ? undefined : imageStyle.aspectRatio,
                    height: isYoothemeGallery ? undefined : imageStyle.aspectRatio ? undefined : imageHeight,
                    position: isYoothemeGallery ? importedMediaWrapperStyle?.position : imageStyle.aspectRatio ? "relative" : undefined,
                  }}
                  onClick={(e) => {
                    if (isLightbox) {
                      e.preventDefault();
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className={`${imageClass} uk-transition-scale-up uk-transition-opaque`}
                    loading={rawBlock.imageLoading ?? "lazy"}
                    {...imageAttributes}
                    style={{
                      width: isYoothemeGallery
                        ? importedHasBothDimensions ? "100%" : importedImageWidth ?? (importedImageHeight ? "auto" : "100%")
                        : "100%",
                      maxWidth: isYoothemeGallery ? "100%" : undefined,
                      height: isYoothemeGallery
                        ? importedHasBothDimensions ? "100%" : importedImageHeight ?? "auto"
                        : imageStyle.aspectRatio ? "100%" : imageHeight ?? "260px",
                      objectFit: isYoothemeGallery
                        ? importedHasBothDimensions ? "cover" : imageStyle.objectFit
                        : imageStyle.objectFit,
                      display: "block",
                      ...(isYoothemeGallery
                        ? importedHasBothDimensions ? { position: "absolute" as const, inset: 0 } : {}
                        : imageStyle.position ? { position: imageStyle.position, inset: imageStyle.inset } : {}),
                    }}
                    onError={(e) => {
                      // Fallback to high res gradient placeholder if network image fails
                      (e.target as HTMLImageElement).src = DEFAULT_GALLERY_ITEMS[index % 3].imageUrl;
                    }}
                  />

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

                  {/* OVERLAY COVER MODE */}
                  {overlayMode === "cover" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: isYoothemeGallery ? undefined : "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: isYoothemeGallery ? "center" : "flex-end",
                        padding: isYoothemeGallery ? "20px" : "20px",
                        color: "#ffffff",
                        borderRadius: isYoothemeGallery ? undefined : "12px",
                        textAlign: titleAlign,
                        ...(hasOverlayLink ? { zIndex: 3, pointerEvents: "none" } : {}),
                      }}
                    className={isYoothemeGallery ? `${rawBlock.overlayStyle === "overlay-primary" ? "uk-overlay-primary" : "uk-overlay"} uk-transition-${rawBlock.overlayTransition || "fade"} uk-position-cover` : "uk-transition-fade"}>
                      {showMeta && item.meta && (
                        <div
                          className={`${metaClass} ${typographyRoleClass(rawBlock.metaTypographyRole)}`.trim()}
                          style={{
                            color: "rgba(255, 255, 255, 0.75)",
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
                          style={{ color: "#ffffff", lineHeight: "1.3", textAlign: titleAlign }}
                        >
                          {item.title}
                        </TitleTag>
                      )}
                      {showContent && item.content && (
                        <div
                          className={`uk-margin-small-top ${contentClass} ${typographyRoleClass(rawBlock.contentTypographyRole)}`.trim()}
                          style={{
                            color: "rgba(255, 255, 255, 0.9)",
                            ...(rawBlock.contentStyle ? {} : { fontSize: "0.9rem" }),
                            marginTop: "6px",
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
                  )}
                </div>

                {/* OVERLAY CAPTION MODE */}
                {overlayMode === "caption" && (
                  <div style={{ padding: "16px", background: "#ffffff", textAlign: titleAlign }}>
                    {showMeta && item.meta && (
                      <div
                        className={`${metaClass} ${typographyRoleClass(rawBlock.metaTypographyRole)}`.trim()}
                        style={{
                          ...(rawBlock.metaStyle ? {} : { fontSize: "0.8rem" }),
                          color: "#666",
                          marginBottom: "4px",
                          textAlign: metaAlign,
                        }}
                      >
                        {item.meta}
                      </div>
                    )}
                    {showTitle && item.title && (
                      <TitleTag className={`${titleClass} ${typographyRoleClass(rawBlock.titleTypographyRole)}`.trim()} style={{ color: "#111", textAlign: titleAlign }}>
                        {item.title}
                      </TitleTag>
                    )}
                    {showContent && item.content && (
                      <div
                        className={`uk-margin-small-top ${contentClass} ${typographyRoleClass(rawBlock.contentTypographyRole)}`.trim()}
                        style={{
                          ...(rawBlock.contentStyle ? {} : { fontSize: "0.875rem" }),
                          color: "#444",
                          marginTop: "4px",
                          textAlign: contentAlign,
                        }}
                      >
                          {renderRichContent(item.content)}
                      </div>
                    )}
                    {showLink && hasLightboxAction && (
                      <div className="uk-margin-small-top" style={{ textAlign: contentAlign }}>
                        <a href={lightboxUrl} data-type="image" data-caption={lightboxCaption || undefined} data-alt={item.imageAlt || undefined} className={buttonClass} aria-label={item.linkAriaLabel || undefined}>
                          {actionLabel}
                        </a>
                      </div>
                    )}
                    {showLink && !usesYoothemeLightbox && hasAction && (
                      <div className="uk-margin-small-top" style={{ textAlign: contentAlign }}>
                        <a href={itemUrl} className={buttonClass} aria-label={item.linkAriaLabel || undefined} {...builderLinkTargetProps(item.linkTarget || rawBlock.linkTarget)}>
                          {actionLabel}
                        </a>
                      </div>
                    )}
                  </div>
                )}
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
