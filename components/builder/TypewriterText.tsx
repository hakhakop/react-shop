"use client";

import React, { useState, useEffect } from "react";
import { typographyProps } from "@/lib/builderTypography";

interface TypewriterTextProps {
  text: string;
  speed?: number;       // Speed of typing in ms
  eraseSpeed?: number;   // Speed of erasing in ms
  delay?: number;        // Delay before starting to type/erase in ms
  loop?: boolean;        // Whether to loop typing animation
  className?: string;
  useGradient?: boolean; // Highlight text with color gradient
  gradientPreset?: string; // Gradient preset theme
  customStart?: string;
  customMiddle?: string;
  customEnd?: string;
  customAngle?: number;
  customStartOffset?: number;
  customMiddleOffset?: number;
  customEndOffset?: number;
  typography?: any;      // Typography settings
  area?: "title" | "body" | "button" | "eyebrow";
}

export default function TypewriterText({
  text,
  speed = 80,
  eraseSpeed = 40,
  delay = 2000,
  loop = true,
  className = "",
  useGradient = true,
  gradientPreset = "indigo-purple-cyan",
  customStart,
  customMiddle,
  customEnd,
  customAngle,
  customStartOffset,
  customMiddleOffset,
  customEndOffset,
  typography,
  area,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  // Parse the input: e.g. "We build AI agents to [write code|test features|deploy apps]"
  const parsed = React.useMemo(() => {
    if (!text) return { prefix: "", words: [], suffix: "" };

    const bracketStart = text.indexOf("[");
    const bracketEnd = text.indexOf("]");

    if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
      const prefix = text.substring(0, bracketStart);
      const inner = text.substring(bracketStart + 1, bracketEnd);
      const suffix = text.substring(bracketEnd + 1);
      const words = inner.split("|").map((w) => w.trim());
      return { prefix, words, suffix };
    }

    return { prefix: "", words: [text], suffix: "" };
  }, [text]);

  const { prefix, words, suffix } = parsed;

  useEffect(() => {
    if (words.length === 0) return;

    let timer: NodeJS.Timeout;
    const currentWord = words[loopNum % words.length];

    if (isDeleting) {
      // Erasing effect
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length - 1));
      }, eraseSpeed);
    } else {
      // Typing effect
      timer = setTimeout(() => {
        setDisplayText(currentWord.substring(0, displayText.length + 1));
      }, speed);
    }

    // Determine transitions between typing and deleting
    if (!isDeleting && displayText === currentWord) {
      if (!loop && (loopNum % words.length) === words.length - 1) {
        // If not looping and we've finished typing the last word, stay there
        return;
      }
      // Pausing at full word before starting deletion
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && displayText === "") {
      // Transition to next word
      setIsDeleting(false);
      setLoopNum((prev) => prev + 1);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, words, speed, eraseSpeed, delay, loop]);

  // Reset typewriter when text or loop settings change
  useEffect(() => {
    setDisplayText("");
    setIsDeleting(false);
    setLoopNum(0);
  }, [text]);

  if (!text) return null;

  const tp = typographyProps(typography, area);
  const combinedClassName = ["typewriter-outer", className, tp.className].filter(Boolean).join(" ");

  const hasFontWeight = Boolean(
    tp.style?.fontWeight ||
    (tp.className && tp.className.includes("font-"))
  );
  const fontWeightClass = hasFontWeight ? "" : "font-bold";

  const validPreset = ["indigo-purple", "cyan-blue", "emerald-teal", "sunset-orange", "indigo-purple-cyan", "sunset-pink", "gold-amber", "custom"].includes(gradientPreset)
    ? gradientPreset
    : "indigo-purple-cyan";

  const isCustom = validPreset === "custom";

  const typingSpanClass = useGradient && !isCustom
    ? `typewriter-inner text-gradient--${validPreset} ${fontWeightClass} border-r-2 border-indigo-400 animate-pulse-cursor pr-1`
    : `typewriter-inner ${fontWeightClass} border-r-2 border-indigo-400 animate-pulse-cursor pr-1`;

  const customStyle: React.CSSProperties = (useGradient && isCustom) ? {
    backgroundImage: `linear-gradient(${customAngle ?? 135}deg, ${customStart ?? "#ffffff"} ${customStartOffset ?? 0}%, ${customMiddle ?? "#60a5fa"} ${customMiddleOffset ?? 50}%, ${customEnd ?? "#c084fc"} ${customEndOffset ?? 100}%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "inline-block",
  } : {};

  // Render
  return (
    <span className={combinedClassName || undefined} style={tp.style}>
      {prefix}
      <span className={typingSpanClass} style={customStyle}>{displayText}</span>
      {suffix}
    </span>
  );
}
