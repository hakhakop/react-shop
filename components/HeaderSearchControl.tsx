"use client";

import { useSearch } from "./SearchProvider";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";

type Props = {
  layout?: string;
  stretch?: string;
  large?: boolean;
  iconPosition?: "" | "left" | "right";
};

export default function HeaderSearchControl({ layout = "input-dropdown", stretch = "", large = false, iconPosition = "left" }: Props) {
  const { openSearch } = useSearch();
  const inputLayout = layout.startsWith("input-");

  return (
    <div
      className={`site-header-search site-header-search--${layout}${large ? " is-large" : ""}`}
      data-search-stretch={stretch || "none"}
    >
      {inputLayout ? (
        <button type="button" className="site-header-search-input" onClick={openSearch} aria-label="Open search">
          {iconPosition === "left" && <WebPagesIcon name="search" size={18} />}
          <span>Search</span>
          {iconPosition === "right" && <WebPagesIcon name="search" size={18} />}
        </button>
      ) : (
        <button type="button" className="site-header-search-toggle" onClick={openSearch} aria-label="Open search">
          <WebPagesIcon name="search" size={20} />
        </button>
      )}
    </div>
  );
}
