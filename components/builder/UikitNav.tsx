"use client";
import React from "react";
import { getUikitSvgColor } from "@/lib/uikitTokens";
import { usePathname } from "next/navigation";
import type { BuilderLayoutBlock } from "@/lib/builderLayouts";
import type { BuilderNavItem } from "@/components/dashboard/builderTypes";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { sanitizeHtml } from "@/lib/safeHtml";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";

/** YOOtheme splits items into balanced, consecutive lists before building its grid. */
export function splitNavColumns(items: BuilderNavItem[], count: number) {
  const columns = Math.max(1, Math.min(6, Math.floor(count) || 1));
  let offset = 0;
  return Array.from({ length: columns }, (_, index) => {
    const size = Math.floor(items.length / columns) + (index < items.length % columns ? 1 : 0);
    const result = items.slice(offset, offset + size);
    offset += size;
    return result;
  });
}

export function NavMarkup({ block, pathname }: { block: BuilderLayoutBlock; pathname?: string | null }) {
  const columns = splitNavColumns(block.navItems ?? [], block.navColumns ?? 1);
  const style = block.navStyle ?? "default";
  const listClass = ["uk-margin-remove-bottom uk-nav", style === "navbar" ? "uk-navbar-dropdown-nav" : `uk-nav-${style}`,
    block.navDivider && "uk-nav-divider", style === "primary" && block.navSize && `uk-nav-${block.navSize}`].filter(Boolean).join(" ");
  const renderItem = (item: BuilderNavItem) => {
    if (item.type === "divider") return <li key={item.id} className="el-item uk-nav-divider" role="separator" />;
    if (item.type === "header") return <li key={item.id} className="el-item uk-nav-header" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.label) }} />;
    const active = item.active === "true" || Boolean(item.url && item.url !== "#" && item.url === pathname);
    const hasMeta = block.navShowMeta !== false && Boolean(item.meta);
    const label = <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.label) }} />;
    const text = hasMeta
      ? <div>{label}<div className="uk-nav-subtitle" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.meta ?? "") }} /></div> : label;
    const width = Number(block.imageWidth) || undefined;
    const height = Number(block.imageHeight) || undefined;
    const imageClass = [
      "el-image",
      block.imageBorder && `uk-border-${block.imageBorder}`,
      !hasMeta && block.navImageMargin !== false && "uk-margin-small-right",
    ].filter(Boolean).join(" ");
    const image = item.imageUrl ? <img src={item.imageUrl} alt={item.imageAlt ?? ""} width={width} height={height}
      loading={block.imageLoading ?? "lazy"} className={imageClass} style={width && height ? { objectFit: "cover", width, height } : undefined} /> : item.icon
      ? <span className={imageClass} uk-icon={`icon: ${item.icon}${block.iconSize ? `; width: ${block.iconSize}` : ""}`} /> : null;
    const media = item.imageUrl && block.imageSvgInline && /\.svg(?:[?#]|$)/i.test(item.imageUrl)
      ? <UikitStylableSvg src={item.imageUrl} alt={item.imageAlt} className={imageClass}
          style={{ width, height }} preserveIntrinsicSize={!width && !height} loading={block.imageLoading}
          color={getUikitSvgColor(block.imageSvgColor)} fallback={image} /> : image;
    const content = block.navShowImage !== false && media
      ? hasMeta
        ? <div className={`uk-grid uk-grid-${block.navImageMargin === false ? "collapse" : "small"} uk-child-width-expand uk-flex-nowrap${block.navImageVerticalAlign ? " uk-flex-middle" : ""}`} uk-grid="">
            <div className="uk-width-auto">{media}</div><div>{text}</div>
          </div>
        : <>{media}{text}</>
      : text;
    return <li key={item.id} className={`el-item${active ? " uk-active" : ""}`}>
      {item.url ? <a href={item.url} {...builderLinkTargetProps(item.target)} {...(item.scroll ? { "uk-scroll": "" } : {})}
        aria-current={active ? "page" : undefined} className="el-link">{content}</a>
        : <div className="el-content uk-disabled">{content}</div>}
    </li>;
  };
  const lists = columns.map((items, index) => <ul key={index} className={listClass}>{items.map(renderItem)}</ul>);
  const Wrapper = block.navHtmlElement === "nav" ? "nav" : "div";
  const breakpoint = block.navGridBreakpoint;
  const gapClasses = block.navGridColumnGap === block.navGridRowGap
    ? block.navGridColumnGap ? [`uk-grid-${block.navGridColumnGap}`] : []
    : [block.navGridColumnGap && `uk-grid-column-${block.navGridColumnGap}`, block.navGridRowGap && `uk-grid-row-${block.navGridRowGap}`];
  return <Wrapper className="shop-builder-nav">{columns.length > 1 ? <div className={[
    "uk-grid",
    breakpoint ? `uk-child-width-1-1 uk-child-width-expand@${breakpoint}` : "uk-child-width-expand",
    ...gapClasses, block.navGridDivider && block.navGridColumnGap !== "collapse" && block.navGridRowGap !== "collapse" && "uk-grid-divider",
  ].filter(Boolean).join(" ")} uk-grid="">{lists.map((list, index) => <div key={index}>{list}</div>)}</div> : lists[0]}</Wrapper>;
}

export default function UikitNav({ block }: { block: BuilderLayoutBlock }) {
  return <NavMarkup block={block} pathname={usePathname()} />;
}
