"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import { ChevronDown, Grid3X3, Menu } from "lucide-react";

type HeaderCategoriesDropdownProps = {
  children: ReactNode;
  label?: string;
  showLabel?: boolean;
  display?: "icon" | "icon-label" | "label";
  icon?: "menu" | "grid";
  iconPosition?: "left" | "right";
  dropdownAlign?: "left" | "right";
  isBuilder?: boolean;
  triggerStyle?: CSSProperties;
};

export default function HeaderCategoriesDropdown({
  children,
  label = "Categories",
  showLabel = true,
  display,
  icon = "menu",
  iconPosition = "left",
  dropdownAlign = "left",
  isBuilder = false,
  triggerStyle,
}: HeaderCategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const configuredBackground = String(
    triggerStyle?.background || triggerStyle?.backgroundColor || "",
  ).trim();
  const hasOwnBackground = Boolean(
    configuredBackground && !configuredBackground.includes("var(--builder-"),
  );
  const configuredTextColor = String(triggerStyle?.color ?? "").trim();
  // Inherited Builder token chains are automatic colors, not an explicit
  // component choice. Literal values remain authoritative user overrides.
  const hasExplicitTextColor = Boolean(
    configuredTextColor && !configuredTextColor.includes("var("),
  );
  const [automaticTextColor, setAutomaticTextColor] = useState<string | null>(
    null,
  );
  const panelId = `header-categories-${useId().replace(/:/g, "")}`;
  const effectiveDisplay = display ?? (showLabel ? "icon-label" : "icon");
  const showIcon = effectiveDisplay !== "label";
  const showVisibleLabel = effectiveDisplay !== "icon";

  const isOpenEffective = isBuilder ? isPinnedOpen : isOpen;

  useEffect(() => {
    setIsHoverEnabled(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    if (!hasOwnBackground || hasExplicitTextColor) {
      setAutomaticTextColor(null);
      return;
    }

    const trigger = triggerRef.current;
    if (!trigger) return;
    const updateAutomaticTextColor = () => {
      const background = window.getComputedStyle(trigger).backgroundColor;
      const match = background.match(
        /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/,
      );
      if (!match) {
        setAutomaticTextColor(null);
        return;
      }

      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      if (!Number.isFinite(alpha) || alpha < 0.15) {
        setAutomaticTextColor(null);
        return;
      }
      const red = Number(match[1]);
      const green = Number(match[2]);
      const blue = Number(match[3]);
      const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      setAutomaticTextColor(luminance < 0.48 ? "#ffffff" : "#0f172a");
    };

    updateAutomaticTextColor();
    const themeBoundary = trigger.closest<HTMLElement>(
      ".builder-preview-shell, .site-header",
    );
    const observer = new MutationObserver(updateAutomaticTextColor);
    if (themeBoundary) {
      observer.observe(themeBoundary, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "style"],
      });
    }
    return () => observer.disconnect();
  }, [
    hasExplicitTextColor,
    hasOwnBackground,
    triggerStyle?.background,
    triggerStyle?.backgroundColor,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      setIsPinnedOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (isBuilder) {
        setIsPinnedOpen(true);
      } else {
        setIsOpen(true);
      }
      requestAnimationFrame(() => {
        rootRef.current
          ?.querySelector<HTMLElement>(".site-header-categories-panel a, .site-header-categories-panel button")
          ?.focus();
      });
    }
  }

  const iconNode = icon === "grid" ? <Grid3X3 size={16} /> : <Menu size={17} />;

  return (
    <div
      ref={rootRef}
      className={`site-header-categories is-display-${effectiveDisplay} is-align-${dropdownAlign}${isOpenEffective ? " is-open" : ""}`}
      onMouseEnter={() => {
        if (!isBuilder && isHoverEnabled) {
          setIsOpen(true);
        }
      }}
      onMouseLeave={() => {
        if (!isBuilder && isHoverEnabled) {
          setIsOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="site-header-categories-toggle"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={panelId}
        data-category-own-background={hasOwnBackground ? "true" : "false"}
        data-category-explicit-text={hasExplicitTextColor ? "true" : "false"}
        style={{
          ...triggerStyle,
          ...(!hasExplicitTextColor && automaticTextColor
            ? ({
                color: automaticTextColor,
                "--header-category-foreground": automaticTextColor,
              } as CSSProperties)
            : {}),
        }}
        onClick={() => {
          if (isBuilder) {
            setIsPinnedOpen((current) => !current);
          } else {
            setIsOpen((current) => !current);
          }
        }}
        onKeyDown={handleKeyDown}
      >
        {showIcon && iconPosition === "left" ? iconNode : null}
        {showVisibleLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
        {showIcon && iconPosition === "right" ? iconNode : null}
        {showVisibleLabel && (
          <ChevronDown size={14} className="site-header-categories-chevron" />
        )}
      </button>

      <div
        id={panelId}
        className="site-header-categories-panel"
        role="menu"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
            setIsPinnedOpen(false);
            triggerRef.current?.focus();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
