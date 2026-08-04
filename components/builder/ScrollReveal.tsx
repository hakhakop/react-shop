"use client";

import { type ReactNode } from "react";

export type ScrollRevealPreset =
  | "none"
  | "fade-up"
  | "fade-down"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "scale-up"
  | "zoom-in"
  | "flip-up"
  | "blur-in"
  | "stagger";

export type ScrollRevealEasing = "ease-out" | "ease-in-out" | "spring";

export type ScrollRevealConfig = {
  preset?: ScrollRevealPreset;
  duration?: number;
  delay?: number;
  easing?: ScrollRevealEasing;
  playOnce?: boolean;
  triggerOffset?: number;
};

type Props = {
  children: ReactNode;
  config?: ScrollRevealConfig | null;
  as?: "div" | "section";
  className?: string;
  id?: string;
};

// Compatibility-only component retained for ignored historical backup files.
// The active storefront renderer uses the canonical data-attribute animation path.
export default function ScrollReveal({
  children,
  config,
  as = "div",
  className = "",
  id,
}: Props) {
  const preset = config?.preset ?? "none";
  const Tag = as;

  if (preset === "none") {
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}
