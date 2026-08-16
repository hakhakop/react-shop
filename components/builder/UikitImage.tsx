"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue } from "@/lib/globalStyleTokens";
import {
  resolveUikitImageSemantics,
  getUikitImageStyle,
  getUikitImageAttributes,
  getUikitImageClass,
  getUikitSvgColor,
  getUikitSvgColorClass,
} from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";

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
  // Pre-Phase-5 imports wrote numeric YOOtheme image_width only to the
  // legacy max-width alias and stored `auto` here. Promote that value at the
  // canonical media boundary so the media composition box, not just its img,
  // retains the source width and can overflow a positioned column.
  const canonicalImageWidth =
    rawBlock.imageWidth && rawBlock.imageWidth !== "auto"
      ? rawBlock.imageWidth
      : typeof rawBlock.imageMaxWidth === "number" && rawBlock.imageMaxWidth > 0
        ? String(rawBlock.imageMaxWidth)
        : rawBlock.imageWidth;
  const resolvedImageBlock = {
    ...rawBlock,
    imageRatio: resolveString(rawBlock.imageRatio, shellSettings?.imageDefaultRatio, "natural"),
    imageFit: resolveString(rawBlock.imageFit, shellSettings?.imageDefaultFit, "natural"),
    imageShape: resolveString(localImageShape, shellSettings?.imageDefaultBorder, "none"),
    imageShadow: resolveString(rawBlock.imageShadow, shellSettings?.imageDefaultShadow, "none"),
    imageWidth: canonicalImageWidth,
    imageLoading: resolveString(rawBlock.imageLoading, shellSettings?.imageDefaultLoading, "lazy"),
  };
  const imageSemantics = resolveUikitImageSemantics(resolvedImageBlock);
  const imageLoading =
    resolvedImageBlock.imageLoading === "eager" ? "eager" : "lazy";
  const imageStyle = getUikitImageStyle(imageSemantics);
  const imageAuthoredMaxWidth = imageStyle.maxWidth ?? (rawBlock.imageMaxWidth ? `${rawBlock.imageMaxWidth}px` : undefined);
  const generalPosition = rawBlock.visualStyle?.layout?.position;
  const allowsPositionedOverflow = generalPosition === "absolute" || generalPosition === "fixed";
  const imageAttributes = getUikitImageAttributes(imageSemantics);
  const imageClass = `${getUikitImageClass(imageSemantics)} el-image`.trim();
  const imageAlignmentClass = imageSemantics.alignment &&
    ["left", "center", "right"].includes(imageSemantics.alignment)
    ? `uk-align-${imageSemantics.alignment}`
    : "";
  const imageDecorationClass = rawBlock.imageBoxDecoration && rawBlock.imageBoxDecoration !== "none"
    ? `uk-background-${rawBlock.imageBoxDecoration}`
    : "";
  const isPlaceholder = !rawBlock.imageUrl || !rawBlock.imageUrl.trim();
  // Framed media deliberately clips cover/ratio content. An explicit element
  // Advanced stylesheet may intentionally move `.el-image` outside that frame
  // (as the YOOtheme play control does), so only that opted-in case may paint
  // beyond the media box.
  const hasAdvancedCss = Boolean(rawBlock.visualStyle?.customCss ?? rawBlock.customCss);
  // A width-only YOOtheme image has no authored frame. Rendering it through
  // Next Image's fixed 1200×800 placeholder dimensions creates a synthetic
  // 3:2 ratio before the real asset can define its natural geometry.
  const usesIntrinsicGeometry = !imageStyle.aspectRatio && !imageStyle.height;
  const preserveIntrinsicImageSize =
    !imageStyle.width && !imageStyle.height && !imageStyle.aspectRatio;
  const isStylableSvg = rawBlock.imageSvgInline === true && /\.svg(?:[?#].*)?$/i.test(rawBlock.imageUrl ?? "");
  // YOOtheme only turns Image sizing into a frame when width, height, or
  // ratio is authored. A site-level Image-fit default must not turn an
  // otherwise un-sized inline SVG into width:100% / height:100% media.
  // Keep the source SVG's intrinsic root/viewBox geometry in that case.
  const preserveIntrinsicSvgSize = isStylableSvg
    && !imageStyle.width
    && !imageStyle.height
    && !imageStyle.aspectRatio;
  const svgColor = getUikitSvgColor(rawBlock.imageSvgColor);
  const svgColorClass = getUikitSvgColorClass(rawBlock.imageSvgColor);
  const usesContextualSvgColor = Boolean(svgColorClass);
  const fallbackImage = usesIntrinsicGeometry ? (
    <img className={imageClass} src={rawBlock.imageUrl!} alt={rawBlock.imageAlt ?? ""} loading={imageLoading} {...imageAttributes} style={{ width: preserveIntrinsicImageSize ? "auto" : "100%", maxWidth: preserveIntrinsicImageSize ? "100%" : undefined, height: imageStyle.height ? "100%" : "auto", objectFit: imageStyle.objectFit as any, objectPosition: imageStyle.objectPosition }} />
  ) : (
    <Image className={imageClass} src={rawBlock.imageUrl!} alt={rawBlock.imageAlt ?? ""} width={1200} height={800} loading={imageLoading} {...imageAttributes} style={{ width: "100%", height: imageStyle.height || imageStyle.aspectRatio ? "100%" : "auto", objectFit: imageStyle.objectFit as any, objectPosition: imageStyle.objectPosition, ...(imageStyle.position ? { position: imageStyle.position as any, inset: imageStyle.inset } : {}) }} />
  );
  const renderImage = () => isStylableSvg ? (
    <UikitStylableSvg
      src={rawBlock.imageUrl!}
      alt={rawBlock.imageAlt}
      className={`${imageClass} ${svgColorClass}`.trim()}
      color={usesContextualSvgColor ? undefined : svgColor}
      fit={preserveIntrinsicSvgSize
        ? "contain"
        : imageSemantics.fit === "cover" || imageSemantics.fit === "fill"
          ? imageSemantics.fit
          : "contain"}
      loading={imageLoading}
      preserveIntrinsicSize={preserveIntrinsicSvgSize}
      fallback={fallbackImage}
      style={{
        width: preserveIntrinsicSvgSize ? undefined : "100%",
        height: imageStyle.height || imageStyle.aspectRatio ? "100%" : preserveIntrinsicSvgSize ? undefined : "auto",
        aspectRatio: imageStyle.aspectRatio,
        position: imageStyle.position,
        inset: imageStyle.inset,
      }}
    />
  ) : fallbackImage;

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  if (isPlaceholder && !isCanvas) {
    return null;
  }

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--image ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
      style={{ display: "block" }}
    >
      <figure
        className={`shop-builder-image-figure ${imageAlignmentClass}`.trim()}
        style={{
          display: "inline-block",
          maxWidth: allowsPositionedOverflow
            ? imageAuthoredMaxWidth
            : imageAuthoredMaxWidth
              ? `min(100%, ${imageAuthoredMaxWidth})`
              : "100%",
          width: allowsPositionedOverflow
            ? imageStyle.width ?? (!imageStyle.aspectRatio ? "fit-content" : undefined)
            : imageStyle.width
              ? `min(${imageStyle.width}, 100%)`
              : (!imageStyle.aspectRatio ? "fit-content" : undefined),
          height: imageStyle.height,
        }}
      >
        <div
          className={`shop-builder-image-media ${imageDecorationClass} ${hasAdvancedCss ? "has-advanced-css" : ""} ${imageStyle.aspectRatio ? "uk-cover-container" : ""} ${
            isPlaceholder ? "is-empty" : ""
          }`}
          data-image-ratio={imageStyle.aspectRatio ? "true" : undefined}
          style={{
            aspectRatio: imageStyle.aspectRatio,
            width: "100%",
            height: imageStyle.height,
            position: imageStyle.aspectRatio ? "relative" : undefined,
          }}
        >
          {!isPlaceholder ? (
            <>
              {rawBlock.imageLinkUrl ? (
                <a className="el-link" href={rawBlock.imageLinkUrl} {...builderLinkTargetProps(rawBlock.imageLinkTarget)}>
                  {renderImage()}
                </a>
              ) : (
                renderImage()
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
