"use client";
import { usePathname } from "next/navigation";
import type { BuilderLayoutBlock } from "@/lib/builderLayouts";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

export default function UikitNav({ block }: { block: BuilderLayoutBlock }) {
  const pathname = usePathname();
  const columns = Math.max(1, Math.min(6, block.navColumns ?? 1));
  return <ul className={`uk-nav uk-nav-${block.navStyle ?? "default"}`} style={columns > 1 ? { columns } : undefined}>
    {(block.navItems ?? []).map(item => {
      if (item.type === "divider") return <li key={item.id} className="uk-nav-divider" role="separator" />;
      if (item.type === "header") return <li key={item.id} className="uk-nav-header">{item.label}</li>;
      const active = item.active === "true" || Boolean(item.url && item.url !== "#" && item.url === pathname);
      return <li key={item.id} className={active ? "uk-active" : undefined}>
        <a href={item.url || undefined} {...builderLinkTargetProps(item.target)} aria-current={active ? "page" : undefined} className={item.imageUrl && block.navShowImage !== false ? `uk-flex ${block.navImageVerticalAlign ? "uk-flex-middle" : "uk-flex-top"}` : undefined}>
          {block.navShowImage !== false && item.imageUrl && <img src={item.imageUrl} alt="" width={24} height={24} />}
          <span>{item.label}{block.navShowMeta !== false && item.meta && <span className="uk-display-block uk-text-meta">{item.meta}</span>}</span>
        </a>
      </li>;
    })}
  </ul>;
}
