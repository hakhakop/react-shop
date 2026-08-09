"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue } from "@/lib/globalStyleTokens";
import {
  resolveUikitImageSemantics,
  getUikitImageStyle,
  getUikitImageAttributes,
  getUikitImageClass,
  getUikitImageWrapperClass,
} from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { visualStyleToCss } from "@/lib/builderVisualStyle";
import { Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";

type Props = {
  block: any;
  isCanvas?: boolean;
  onUploadImage?: () => void;
  shellSettings?: Partial<BuilderShellSettings>;
};

export default function UikitImage({ block, isCanvas, onUploadImage, shellSettings }: Props) {
  const rawBlock = (block ?? {}) as any;
  const resolveString = (
    local: unknown,
    global: string | undefined,
    componentDefault: string,
  ) =>
    resolveAppearanceValue({
      local: typeof local === "string" ? local : undefined,
      global,
      componentDefault,
    }).value;
  const localImageShape =
    typeof rawBlock.imageShape === "string"
      ? rawBlock.imageShape
      : ["rounded", "circle", "pill"].includes(rawBlock.imageBorder)
        ? rawBlock.imageBorder
        : undefined;
  const resolvedImageBlock = {
    ...rawBlock,
    imageRatio: resolveString(rawBlock.imageRatio, shellSettings?.imageDefaultRatio, "natural"),
    imageFit: resolveString(rawBlock.imageFit, shellSettings?.imageDefaultFit, "cover"),
    imageShape: resolveString(localImageShape, shellSettings?.imageDefaultBorder, "none"),
    imageShadow: resolveString(rawBlock.imageShadow, shellSettings?.imageDefaultShadow, "none"),
    imageAlignment: resolveString(rawBlock.imageAlignment, shellSettings?.imageDefaultAlignment, "center"),
    imageLoading: resolveString(rawBlock.imageLoading, shellSettings?.imageDefaultLoading, "lazy"),
  };
  const imageSemantics = resolveUikitImageSemantics(resolvedImageBlock);
  const imageAlignment =
    imageSemantics.alignment === "left" ||
    imageSemantics.alignment === "right" ||
    imageSemantics.alignment === "center"
      ? imageSemantics.alignment
      : "center";
  const imageLoading =
    resolvedImageBlock.imageLoading === "eager" ? "eager" : "lazy";
  const imageStyle = getUikitImageStyle(imageSemantics);
  const imageAttributes = getUikitImageAttributes(imageSemantics);
  const imageClass = getUikitImageClass(imageSemantics);
  const figureClass = getUikitImageWrapperClass(imageSemantics);
  const isPlaceholder = !rawBlock.imageUrl || !rawBlock.imageUrl.trim();

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  if (isPlaceholder && !isCanvas) {
    return null;
  }

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--image ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
      style={visualStyleToCss(rawBlock.visualStyle)}
    >
      <figure
        className={`shop-builder-image-figure ${figureClass}`}
        style={{
          textAlign: imageAlignment,
          maxWidth: imageStyle.maxWidth ?? (rawBlock.imageMaxWidth ? `${rawBlock.imageMaxWidth}px` : undefined),
          width: imageStyle.width,
          marginInline:
            imageAlignment === "left"
              ? "0 auto"
              : imageAlignment === "right"
              ? "0 0 0 auto"
              : "auto",
        }}
      >
        <div
          className={`shop-builder-image-media ${imageStyle.aspectRatio ? "uk-cover-container" : ""} ${
            isPlaceholder ? "is-empty" : ""
          }`}
          data-image-ratio={imageStyle.aspectRatio ? "true" : undefined}
          style={{
            aspectRatio: imageStyle.aspectRatio,
            width: "100%",
            position: imageStyle.aspectRatio ? "relative" : undefined,
          }}
        >
          {!isPlaceholder ? (
            <>
              {rawBlock.imageLinkUrl ? (
                <a href={rawBlock.imageLinkUrl} {...builderLinkTargetProps(rawBlock.imageLinkTarget)}>
                  <Image
                    className={imageClass}
                    src={rawBlock.imageUrl!}
                    alt={rawBlock.imageAlt ?? ""}
                    width={1200}
                    height={800}
                    loading={imageLoading}
                    {...imageAttributes}
                    style={{
                      width: "100%",
                      height: imageStyle.aspectRatio ? "100%" : "auto",
                      objectFit: imageStyle.objectFit as any,
                      ...(imageStyle.position
                        ? { position: imageStyle.position as any, inset: imageStyle.inset }
                        : {}),
                    }}
                  />
                </a>
              ) : (
                <Image
                  className={imageClass}
                  src={rawBlock.imageUrl!}
                  alt={rawBlock.imageAlt ?? ""}
                  width={1200}
                  height={800}
                  loading={imageLoading}
                  {...imageAttributes}
                  style={{
                    width: "100%",
                    height: imageStyle.aspectRatio ? "100%" : "auto",
                    objectFit: imageStyle.objectFit as any,
                    ...(imageStyle.position
                      ? { position: imageStyle.position as any, inset: imageStyle.inset }
                      : {}),
                  }}
                />
              )}
              {isCanvas && (
                <button
                  type="button"
                  className="builder-preview-image-upload"
                  onClick={onUploadImage}
                >
                  <ImageIcon size={13} />
                  <span>Change image</span>
                </button>
              )}
            </>
          ) : isCanvas ? (
            <div
              className="builder-media-placeholder-container"
              style={{ minHeight: "180px" }}
              onClick={onUploadImage}
            >
              <div className="builder-media-placeholder-content">
                <div className="builder-media-placeholder-icon-frame">
                  <ImageIcon size={24} />
                </div>
                <h4 className="builder-media-placeholder-title">Select an image</h4>
                <p className="builder-media-placeholder-subtitle">
                  Upload or select from media library
                </p>
                <button type="button" className="builder-media-placeholder-btn">
                  <Upload size={14} />
                  <span>Choose Image</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
        {rawBlock.imageCaption && (
          <figcaption className="uk-text-meta uk-margin-small-top">{rawBlock.imageCaption}</figcaption>
        )}
      </figure>
    </div>
  );
}
