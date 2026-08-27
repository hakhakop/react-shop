"use client";

import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import type { BuilderSubnavItem } from "@/components/dashboard/builderTypes";

type Props = {
  block: {
    id?: string;
    customId?: string;
    customClass?: string;
    margin?: string;
    subnavItems?: BuilderSubnavItem[];
    subnavStyle?: "default" | "divider" | "pill";
    subnavAlign?: "left" | "center" | "right";
    spacingContract?: "native" | "yootheme";
  };
};

/** Render the canonical UIkit Subnav element used by imported YOOtheme layouts. */
export default function UikitSubnav({ block }: Props) {
  const items = block.subnavItems ?? [];
  const style = block.subnavStyle ?? "default";
  const marginClass = block.margin && block.margin !== "none" ? `uk-margin-${block.margin}` : "";
  const alignClass = block.subnavAlign && block.subnavAlign !== "left"
    ? `uk-flex-${block.subnavAlign}`
    : "";
  const isImportedYoothemeSubnav = block.spacingContract === "yootheme" || block.id?.startsWith("yootheme-");
  const contractClass = isImportedYoothemeSubnav ? "shop-builder-subnav--yootheme" : "";
  const listClass = [
    "uk-subnav",
    style === "divider" ? "uk-subnav-divider" : "",
    style === "pill" ? "uk-subnav-pill" : "",
    isImportedYoothemeSubnav ? "uk-margin-remove-bottom" : "",
    alignClass,
  ].filter(Boolean).join(" ");

  return (
    <div
      id={block.customId || block.id}
      className={`shop-builder-column-block shop-builder-column-block--subnav ${contractClass} ${marginClass} ${block.customClass ?? ""}`.trim()}
    >
      <ul className={listClass}>
        {items.map((item) => (
          <li key={item.id}>
            {item.url ? (
              <a
                href={item.url}
                {...builderLinkTargetProps(item.target)}
                {...(item.scroll ? { "uk-scroll": "" } : {})}
              >
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
