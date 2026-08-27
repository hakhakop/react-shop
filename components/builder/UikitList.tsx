"use client";

import type { BuilderLayoutBlock, BuilderListItem } from "@/components/dashboard/builderTypes";
import { getUikitListClass, getUikitTextClass } from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import { resolveUikitIconName } from "@/lib/uikitIconRegistry";
import { typographyRoleClass } from "@/lib/builderTypography";
import { decodeHtmlEntities, sanitizeHtml, isRichText } from "@/lib/safeHtml";

type Props = {
  block: any;
};

export default function UikitList({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const listClass = [getUikitListClass({
    presentation: rawBlock.listPresentation ?? rawBlock.listStyle,
    marker: rawBlock.listMarker,
    align: rawBlock.listAlign,
    spacing: rawBlock.listSpacing,
  }), rawBlock.listMarkerColor ? `uk-list-${rawBlock.listMarkerColor}` : ""].filter(Boolean).join(" ");

  const listItems: BuilderListItem[] =
    rawBlock.listItems?.length
      ? rawBlock.listItems
      : (rawBlock.items ?? []).map((text: string, index: number) => ({
      id: `${rawBlock.id ?? "list"}-item-${index}`,
      text,
    }));

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";
  const contentStyleClass = getUikitTextClass(rawBlock.contentStyle);
  const contentRoleClass = typographyRoleClass(rawBlock.contentTypographyRole);
  const itemTextClass = `${contentStyleClass} ${contentRoleClass}`.trim();
  const isHorizontal = rawBlock.listType === "horizontal";
  const ListTag = rawBlock.listElement === "ol" ? "ol" : "ul";
  const linkStyle = rawBlock.listLinkStyle ?? "default";
  const linkClass = [
    itemTextClass,
    linkStyle === "muted" ? "uk-link-muted" : "",
    linkStyle === "text" ? "uk-link-text" : "",
    linkStyle === "heading" ? "uk-link-heading" : "",
    linkStyle === "reset" ? "uk-link-reset" : "",
  ].filter(Boolean).join(" ");
  const renderItemText = (item: BuilderListItem) => {
    const safe = sanitizeHtml(item.text ?? "");
    const text = isRichText(safe)
      ? <span dangerouslySetInnerHTML={{ __html: safe }} />
      : safe;
    return item.url && rawBlock.listShowLink !== false
      ? <a className={linkClass} href={item.url} {...builderLinkTargetProps(item.target ?? rawBlock.listLinkTarget ?? "_self")}>{text}</a>
      : <span className={itemTextClass}>{text}</span>;
  };

  const list = isHorizontal ? (
    <div className="shop-builder-list--horizontal">
      {listItems.map((item, index) => (
        <span key={item.id} className="webpages-list-item">
          {renderItemText(item)}
          {index < listItems.length - 1 ? rawBlock.listHorizontalSeparator ?? ", " : ""}
        </span>
      ))}
    </div>
  ) : (
    <ListTag className={listClass}>
      {listItems.map((item) => {
        const iconName = item.iconName ?? rawBlock.listIcon;
        const resolvedIcon = resolveUikitIconName(iconName);
        const iconSize = item.iconSize ?? rawBlock.listIconSize ?? 16;
        return (
          <li key={item.id} className="webpages-list-item">
            {rawBlock.listShowImage !== false && resolvedIcon && (
              <span className="webpages-list-item__icon">
                <WebPagesIcon name={resolvedIcon} size={iconSize} className={rawBlock.listIconColor ? `uk-text-${rawBlock.listIconColor}` : undefined} />
              </span>
            )}
            {renderItemText(item)}
          </li>
        );
      })}
    </ListTag>
  );

  const content = (
    <>
      {rawBlock.title && (
        <h3 className="uk-margin-small-bottom">
          {decodeHtmlEntities(String(rawBlock.title))}
        </h3>
      )}
      {list}
    </>
  );
  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--list ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.listWrapNav && !isHorizontal ? <nav>{content}</nav> : content}
    </div>
  );
}
