"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitImageClass, resolveUikitImageSemantics } from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

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

export default function UikitGallery({ block }: Props) {
  const rawBlock = (block ?? {}) as any;

  const rawItems = rawBlock.galleryItems?.length
    ? rawBlock.galleryItems
    : rawBlock.items?.length
    ? rawBlock.items
    : DEFAULT_GALLERY_ITEMS;

  const items = rawItems.map((item: any, idx: number) => ({
    id: item.id || String(idx),
    imageUrl: item.imageUrl || item.image || DEFAULT_GALLERY_ITEMS[idx % 3].imageUrl,
    title: item.title || `Gallery Item ${idx + 1}`,
    meta: item.meta || "",
    content: item.content || item.description || "",
    linkUrl: item.linkUrl || item.url || "#",
    linkTarget: item.linkTarget || "_self",
  }));

  const columns = Number(rawBlock.columns) || 3;
  const gap = rawBlock.gridGap ?? "medium";
  const rowGap = rawBlock.gridRowGap ?? gap;
  const isLightbox = rawBlock.enableLightbox !== false;
  const overlayMode = rawBlock.overlayMode ?? "cover"; // 'cover' | 'caption'

  // Visibility switches
  const showTitle = rawBlock.gridShowTitle !== false;
  const showMeta = rawBlock.gridShowMeta !== false;
  const showContent = rawBlock.gridShowText !== false;

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
    "uk-grid",
    gap !== "none" ? `uk-grid-${gap}` : "uk-grid-collapse",
    rowGap !== gap && rowGap !== "none" ? `uk-grid-row-${rowGap}` : "",
    rawBlock.masonry && rawBlock.masonry !== "none" ? "uk-grid-masonry" : "",
    rawBlock.showDividers ? "uk-grid-divider" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const columnWidthClass = `uk-width-1-${columns}@m uk-width-1-2@s`;

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--gallery ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div className={gridClass} data-uk-grid={rawBlock.masonry && rawBlock.masonry !== "none" ? `masonry: ${rawBlock.masonry}` : ""}>
        {items.map((item: any, index: number) => {
          const imageSemantics = resolveUikitImageSemantics(rawBlock);
          const imageClass = getUikitImageClass(imageSemantics);

          return (
            <div key={item.id} className={columnWidthClass}>
              <div
                className="uk-card uk-card-default uk-overflow-hidden"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  className="uk-inline-clip uk-transition-toggle"
                  style={{ width: "100%", display: "block", cursor: isLightbox ? "pointer" : "default" }}
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
                    alt={item.title}
                    className={`${imageClass} uk-transition-scale-up uk-transition-opaque`}
                    loading={rawBlock.imageLoading ?? "lazy"}
                    style={{
                      width: "100%",
                      height: "260px",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: overlayMode === "caption" ? "12px 12px 0 0" : "12px",
                    }}
                    onError={(e) => {
                      // Fallback to high res gradient placeholder if network image fails
                      (e.target as HTMLImageElement).src = DEFAULT_GALLERY_ITEMS[index % 3].imageUrl;
                    }}
                  />

                  {/* OVERLAY COVER MODE */}
                  {overlayMode === "cover" && (
                    <div
                      className="uk-transition-fade"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "20px",
                        color: "#ffffff",
                        borderRadius: "12px",
                        textAlign: rawBlock.alignment || "left",
                      }}
                    >
                      {showMeta && item.meta && (
                        <div
                          className={`uk-text-meta ${typographyRoleClass(rawBlock.metaTypographyRole)}`}
                          style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: "0.825rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}
                        >
                          {item.meta}
                        </div>
                      )}
                      {showTitle && item.title && (
                        <div
                          className={`uk-text-bold ${typographyRoleClass(rawBlock.titleTypographyRole)}`}
                          style={{ color: "#ffffff", fontSize: "1.15rem", fontWeight: 700, lineHeight: "1.3" }}
                        >
                          {item.title}
                        </div>
                      )}
                      {showContent && item.content && (
                        <div
                          className={`uk-margin-small-top ${typographyRoleClass(rawBlock.contentTypographyRole)}`}
                          style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "0.9rem", marginTop: "6px" }}
                        >
                          {item.content}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* OVERLAY CAPTION MODE */}
                {overlayMode === "caption" && (
                  <div style={{ padding: "16px", background: "#ffffff", textAlign: rawBlock.alignment || "left" }}>
                    {showMeta && item.meta && (
                      <div className={`uk-text-meta ${typographyRoleClass(rawBlock.metaTypographyRole)}`} style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px" }}>
                        {item.meta}
                      </div>
                    )}
                    {showTitle && item.title && (
                      <div className={`uk-text-bold ${typographyRoleClass(rawBlock.titleTypographyRole)}`} style={{ fontSize: "1.05rem", fontWeight: 600, color: "#111" }}>
                        {item.title}
                      </div>
                    )}
                    {showContent && item.content && (
                      <div className={`uk-margin-small-top ${typographyRoleClass(rawBlock.contentTypographyRole)}`} style={{ fontSize: "0.875rem", color: "#444", marginTop: "4px" }}>
                        {item.content}
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
