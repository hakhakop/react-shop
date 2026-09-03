"use client";

import type { BuilderLayoutBlock, BuilderSocialItem } from "@/components/dashboard/builderTypes";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { inferSocialIcon, socialLinkLabel } from "@/lib/socialIcons";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";

const gapValue = (gap?: string) => ({ none: "0", small: "10px", medium: "20px", default: "30px", large: "40px" }[gap ?? "small"] ?? "10px");
const breakpointSuffix = (breakpoint?: string) => ({ small: "s", medium: "m", large: "l", xlarge: "xl" }[breakpoint ?? "always"]);

export default function UikitSocial({ block }: { block: BuilderLayoutBlock }) {
  const items = (block.socialItems ?? []).filter((item): item is BuilderSocialItem => Boolean(item?.link));
  const style = block.socialStyle ?? "icon";
  const vertical = block.socialGrid === "vertical";
  const breakpoint = breakpointSuffix(block.socialGridBreakpoint);
  const iconSize = Math.max(8, Number(block.socialIconWidth) || 20);
  const listClass = style === "thumbnav" ? "uk-thumbnav" : style === "iconnav" ? "uk-iconnav" : "uk-subnav";

  return (
    <ul
      className={`shop-builder-social ${listClass} ${vertical ? `shop-builder-social--vertical${breakpoint ? `-${breakpoint}` : ""}` : "shop-builder-social--horizontal"}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: gapValue(block.socialColumnGap),
        rowGap: gapValue(block.socialRowGap),
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {items.map((item) => {
        const label = socialLinkLabel(item.link, item.linkAriaLabel || block.socialLinkAriaLabel);
        const image = item.imageUrl ? (
          // Imported WordPress/YOOtheme media may be remote and is intentionally rendered from its authored URL.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" width={block.socialImageWidth || iconSize} height={block.socialImageHeight || iconSize} loading={block.socialImageLoading === "eager" ? "eager" : "lazy"} />
        ) : null;
        const content = item.imageUrl && block.socialImageSvgInline && /\.svg(?:$|[?#])/i.test(item.imageUrl) ? (
          <UikitStylableSvg
            src={item.imageUrl}
            loading={block.socialImageLoading ?? "lazy"}
            preserveIntrinsicSize={!block.socialImageWidth && !block.socialImageHeight}
            style={{ width: block.socialImageWidth || iconSize, height: block.socialImageHeight || iconSize }}
            fallback={image}
          />
        ) : item.imageUrl ? (
          image
        ) : (
          <WebPagesIcon name={inferSocialIcon(item.link, item.iconName)} size={iconSize} />
        );
        const className = [
          style === "button" ? "uk-icon-button" : "",
          style === "icon" ? "uk-icon-link" : "",
          style === "muted" ? "uk-link-muted" : "",
          style === "text" ? "uk-link-text" : "",
          style === "reset" ? "uk-link-reset" : "",
        ].filter(Boolean).join(" ");
        return (
          <li key={item.id}>
            <a href={item.link} aria-label={label} className={className || undefined} {...builderLinkTargetProps(block.socialLinkTarget ?? "_self")}>
              {content}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
