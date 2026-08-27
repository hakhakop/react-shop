"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitDividerClass } from "@/lib/uikitTokens";

type Props = {
  block: any;
};

export default function UikitDivider({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const dividerStyle = rawBlock.dividerStyle || rawBlock.preset || "icon";
  const importedYootheme = rawBlock.spacingContract === "yootheme" || String(rawBlock.id ?? "").startsWith("yootheme-");
  const dividerClass = importedYootheme && dividerStyle === "default"
    ? "shop-builder-divider--bare"
    : getUikitDividerClass(dividerStyle);

  // YOOtheme's default divider is a bare <hr>. Its row owns the UIkit grid
  // rhythm; adding WebPages' default element margin here creates a 20px top
  // and bottom margin that does not exist in the source document. Keep the
  // native default for non-imported dividers, but let imported dividers stay
  // structurally bare when no explicit source margin was authored.
  const marginClass = importedYootheme && (!rawBlock.margin || rawBlock.margin === "default")
    ? ""
    : rawBlock.margin && rawBlock.margin !== "none"
      ? `uk-margin-${rawBlock.margin}`
      : "uk-margin";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--divider ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <hr className={dividerClass} />
    </div>
  );
}
