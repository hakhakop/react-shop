"use client";

import type { BuilderLayoutBlock, BuilderListItem } from "@/components/dashboard/builderTypes";
import { getUikitListClass, getUikitTextClass } from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import { resolveUikitIconName } from "@/lib/uikitIconRegistry";
import { typographyRoleClass } from "@/lib/builderTypography";

type Props = {
  block: any;
};

export default function UikitList({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const listClass = getUikitListClass({
    presentation: rawBlock.listPresentation ?? rawBlock.listStyle,
    marker: rawBlock.listMarker,
    align: rawBlock.listAlign,
    spacing: rawBlock.listSpacing,
  });

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

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--list ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.title && (
        <h3 className="uk-margin-small-bottom">
          {rawBlock.title}
        </h3>
      )}
      <ul className={listClass}>
        {listItems.map((item) => {
          const iconName = item.iconName ?? rawBlock.listIcon;
          const resolvedIcon = resolveUikitIconName(iconName);
          const iconSize = item.iconSize ?? rawBlock.listIconSize ?? 16;
          const target = item.target ?? rawBlock.listLinkTarget ?? "_self";

          return (
            <li key={item.id} className="webpages-list-item">
              {resolvedIcon && (
                <span className="webpages-list-item__icon">
                  <WebPagesIcon name={resolvedIcon} size={iconSize} />
                </span>
              )}
              {item.url ? (
                <a className={itemTextClass} href={item.url} {...builderLinkTargetProps(target)}>
                  {item.text}
                </a>
              ) : (
                <span className={itemTextClass}>{item.text}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
