"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

type Props = {
  block: any;
  items?: { label: string; url?: string }[];
};

export default function UikitBreadcrumbs({ block, items }: Props) {
  const rawBlock = (block ?? {}) as any;
  const listItems = items ?? rawBlock.breadcrumbItems ?? [
    { label: "Home", url: "/" },
    { label: "Category", url: "/category" },
    { label: "Current Page" },
  ];

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--breadcrumbs ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <ul className="uk-breadcrumb">
        {listItems.map((item: any, index: number) => {
          const isLast = index === listItems.length - 1;
          return (
            <li key={index}>
              {!isLast && item.url ? (
                <a href={item.url}>{item.label}</a>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
