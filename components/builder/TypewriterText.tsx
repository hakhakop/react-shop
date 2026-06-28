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
  preserveHeight?: boolean;
  reservedLines?: number;
  mobileReservedLines?: number;
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
  preserveHeight = true,
  reservedLines = 1,
  mobileReservedLines = 2,
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
  
  // Resolve line height factor for height preservation calculation
  let resolvedLh = 1.2;
  if (tp.style?.lineHeight) {
    const lhVal = parseFloat(String(tp.style.lineHeight));
    if (!isNaN(lhVal)) {
      resolvedLh = lhVal;
    }
  } else if (typography?.variant) {
    if (typography.variant === "heading") resolvedLh = 0.92;
    else if (typography.variant === "subheading") resolvedLh = 1.0;
    else if (typography.variant === "body") resolvedLh = 1.7;
    else if (typography.variant === "button") resolvedLh = 1.0;
  }

  const outerStyle: React.CSSProperties = { ...tp.style };
  if (preserveHeight) {
    outerStyle.display = "inline-block";
    outerStyle.minHeight = "var(--typewriter-min-height, auto)";
    (outerStyle as any)["--typewriter-lines-desktop"] = reservedLines;
    (outerStyle as any)["--typewriter-lines-mobile"] = mobileReservedLines;
    (outerStyle as any)["--typewriter-lh"] = resolvedLh;
  }

  const combinedClassName = [
    "typewriter-outer",
    preserveHeight ? "typewriter-preserve-height" : "",
    className,
    tp.className
  ].filter(Boolean).join(" ");

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
    ? `typewriter-inner text-gradient--${validPreset} ${fontWeightClass} pr-1`
    : `typewriter-inner ${fontWeightClass} pr-1`;

  const customStyle: React.CSSProperties = (useGradient && isCustom) ? {
    backgroundImage: `linear-gradient(${customAngle ?? 135}deg, ${customStart ?? "#ffffff"} ${customStartOffset ?? 0}%, ${customMiddle ?? "#60a5fa"} ${customMiddleOffset ?? 50}%, ${customEnd ?? "#c084fc"} ${customEndOffset ?? 100}%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "inline-block",
  } : {};

  // Render
  return (
    <span className={combinedClassName || undefined} style={outerStyle}>
      {prefix}
      <span className={typingSpanClass} style={customStyle}>
        {displayText}
      </span>
      <span
        className="typewriter-cursor animate-pulse-cursor"
        style={{
          backgroundColor: "rgb(129, 140, 248)",
          marginLeft: "2px",
          display: "inline-block",
          width: "0.06em",
          minWidth: "2px",
          height: "1.25em",
          verticalAlign: "-0.15em",
          fontSize: "inherit",
        }}
      />
      {suffix}
    </span>
  );
}
