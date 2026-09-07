"use client";

import { useSearch } from "./SearchProvider";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";

type Props = {
  layout?: string;
  stretch?: string;
  large?: boolean;
  iconPosition?: "" | "left" | "right";
  expandInput?: boolean;
  preventSubmit?: boolean;
  dropbarAnimation?: string;
  removeHorizontalPadding?: boolean;
};

export default function HeaderSearchControl({ layout = "input-dropdown", stretch = "", large = false, iconPosition = "left", expandInput = false, preventSubmit = false, dropbarAnimation, removeHorizontalPadding = false }: Props) {
  const { openSearch } = useSearch();
  const inputLayout = layout.startsWith("input-");

  return (
    <div
      className={`site-header-search site-header-search--${layout}${large ? " is-large" : ""}${expandInput ? " is-expanded" : ""}${removeHorizontalPadding ? " is-dropbar-flush" : ""}`}
      data-search-stretch={stretch || "none"}
      data-search-prevent-submit={preventSubmit ? "true" : "false"}
      data-search-dropbar-animation={dropbarAnimation || "fade"}
    >
      {inputLayout ? (
        <button type="button" className="site-header-search-input" onClick={() => openSearch({ preventSubmit })} aria-label="Open search">
          {iconPosition === "left" && <WebPagesIcon name="search" size={18} />}
          <span>Search</span>
          {iconPosition === "right" && <WebPagesIcon name="search" size={18} />}
        </button>
      ) : (
        <button type="button" className="site-header-search-toggle" onClick={() => openSearch({ preventSubmit })} aria-label="Open search">
          <WebPagesIcon name="search" size={20} />
        </button>
      )}
    </div>
  );
}
