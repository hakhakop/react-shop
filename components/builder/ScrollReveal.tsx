"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const entryVariants: Record<Exclude<ScrollRevealPreset, "none">, any> = {
  stagger: { opacity: 0, y: 30 },
  "fade-up": { opacity: 0, y: 40, scale: 0.98 },
  "fade-down": { opacity: 0, y: -32 },
  "fade-in": { opacity: 0 },
  "slide-left": { opacity: 0, x: -60 },
  "slide-right": { opacity: 0, x: 60 },
  "scale-up": { opacity: 0, scale: 0.92 },
  "zoom-in": { opacity: 0, scale: 0.6 },
  "flip-up": { opacity: 0, rotateX: 18, y: 30 },
  "blur-in": { opacity: 0, filter: "blur(12px)", scale: 1.04 },
};

const visible = { opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0, filter: "blur(0px)" };

const entryTransition = (cfg: ScrollRevealConfig) => {
  const duration = cfg.duration ?? 0.7;
  const delay = cfg.delay ?? 0;
  if (cfg.easing === "spring") {
    return { type: "spring" as const, stiffness: 100, damping: 20, mass: 1, delay };
  }
  return {
    duration,
    delay,
    ease: cfg.easing === "ease-in-out"
      ? [0.4, 0, 0.2, 1] as [number, number, number, number]
      : [0.16, 1, 0.3, 1] as [number, number, number, number],
  };
};

export default function ScrollReveal({
  children,
  config,
  as = "div",
  className = "",
  id,
}: Props) {
  const cfg: ScrollRevealConfig = config ?? { preset: "none" };
  const preset = cfg.preset ?? "none";
  const playOnce = cfg.playOnce ?? true;

  if (preset === "none") {
    const Tag = as;
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  const initial = entryVariants[preset];
  if (!initial) {
    const Tag = as;
    return (
      <Tag id={id} className={className}>
        {children}
      </Tag>
    );
  }

  const Tag = motion[as];

  return (
    <Tag
      id={id}
      className={className}
      initial={initial}
      whileInView={visible}
      viewport={{ once: playOnce, amount: cfg.triggerOffset != null ? cfg.triggerOffset / 100 : 0.15 }}
      transition={entryTransition(cfg)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </Tag>
  );
}
