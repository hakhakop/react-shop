// components/layout/PageSection.tsx
import { ReactNode } from "react";
import clsx from "clsx";

type BackgroundVariant =
  | "default"
  | "muted"
  | "soft"
  | "dark"
  | "primary"
  | "accent"
  | "red";

type SpacingSize = "none" | "sm" | "md" | "lg" | "xl";

interface PageSectionProps {
  children: ReactNode;
  id?: string;
  backgroundVariant?: string | null;
  topSpacing?: string | null;
  bottomSpacing?: string | null;
  className?: string;
}

/**
 * Normalize ACF value (e.g. "large", "lg") into internal sizes
 */
function normalizeSpacing(value?: string | null): SpacingSize {
  if (!value) return "md";

  const v = value.toLowerCase();

  if (["none", "0"].includes(v)) return "none";
  if (["small", "sm"].includes(v)) return "sm";
  if (["large", "lg"].includes(v)) return "lg";
  if (["xlarge", "xl"].includes(v)) return "xl";

  // "medium" or anything else → default
  return "md";
}

function spacingToPx(size: SpacingSize): number {
  switch (size) {
    case "none":
      return 0;
    case "sm":
      return 24; // 1.5rem
    case "md":
      return 40; // 2.5rem
    case "lg":
      return 64; // 4rem
    case "xl":
      return 80; // 5rem
    default:
      return 40;
  }
}

function spacingClass(prefix: "pt" | "pb", size: SpacingSize) {
  switch (size) {
    case "none":
      return `${prefix}-0`;
    case "sm":
      return `${prefix}-6 md:${prefix}-8`;
    case "lg":
      return `${prefix}-16 md:${prefix}-24`;
    case "xl":
      return `${prefix}-20 md:${prefix}-28`;
    case "md":
    default:
      return `${prefix}-10 md:${prefix}-14`;
  }
}

function normalizeBackground(value?: string | null): BackgroundVariant {
  if (!value) return "default";

  const v = value.toLowerCase();

  if (["muted", "grey", "gray"].includes(v)) return "muted";
  if (["soft", "light"].includes(v)) return "soft";
  if (["dark"].includes(v)) return "dark";
  if (["primary", "blue"].includes(v)) return "primary";
  if (["accent", "orange"].includes(v)) return "accent";
  if (["red", "danger"].includes(v)) return "red";

  return "default";
}

function backgroundClasses(variant: BackgroundVariant) {
  switch (variant) {
    case "muted":
      return "bg-[var(--surface-muted,#f3f4f6)]";
    case "soft":
      return "bg-[var(--surface-soft,#f9fafb)]";
    case "dark":
      return "bg-[var(--surface-dark,#0f172a)] text-[var(--surface-dark-foreground,#f9fafb)]";
    case "primary":
      return "bg-[var(--primary-soft,rgba(59,130,246,0.08))]";
    case "accent":
      return "bg-[var(--accent-soft,rgba(251,146,60,0.08))]";
    case "red":
      return "bg-[var(--danger-soft,rgba(248,113,113,0.08))]";
    case "default":
    default:
      return "bg-[var(--surface-main,#ffffff)]";
  }
}

export function PageSection({
  children,
  id,
  backgroundVariant,
  topSpacing,
  bottomSpacing,
  className,
}: PageSectionProps) {
  const bg = normalizeBackground(backgroundVariant);
  const top = normalizeSpacing(topSpacing);
  const bottom = normalizeSpacing(bottomSpacing);

  console.log("[PageSection]", {
  id,
  rawTop: topSpacing,
  rawBottom: bottomSpacing,
  normalizedTop: top,
  normalizedBottom: bottom,
});

  const paddingTop = spacingToPx(top);
  const paddingBottom = spacingToPx(bottom);

  return (
    <section
      id={id}
      className={clsx(
        backgroundClasses(bg),
        className
      )}
      style={{
        paddingTop,
        paddingBottom,
      }}
    >
      {children}
    </section>
  );
}