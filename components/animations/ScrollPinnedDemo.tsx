"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import {
  CheckCircle2,
  LayoutTemplate,
  Check,
  ArrowRight,
  Star,
  Heart,
  Sparkles,
  Shield
} from "lucide-react";
import type { BuilderSection, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

type ScrollPinnedDemoProps = {
  section?: any;
  block?: any;
  isPreview?: boolean;
};

export default function ScrollPinnedDemo({ section, block, isPreview = false }: ScrollPinnedDemoProps) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<any>(null);

  // Normalize data sources between section and block configurations
  const activeData = section || block;
  let eyebrow = activeData?.eyebrow;
  let title = activeData?.title;
  let body = activeData?.body;
  let slides = activeData?.slides || [];

  const panelStyle = activeData?.panelStyle ?? "default";
  const isDark = panelStyle === "default" || panelStyle === "dark" || panelStyle === "flat-dark" || panelStyle === "antigravity";
  const textColorClass = isDark ? "text-white" : "text-neutral-900";
  const mutedTextColorClass = isDark ? "text-neutral-400" : "text-neutral-600";

  // If section has normalized layoutItems, extract values from the columns/blocks
  if (section && section.layoutItems && section.layoutItems.length >= 2) {
    const leftItem = section.layoutItems[0];
    const rightItem = section.layoutItems[1];

    const textBlock = leftItem.blocks?.find((b: any) => b.kind === "text");
    if (textBlock) {
      eyebrow = textBlock.eyebrow || eyebrow;
      title = textBlock.title || title;
      body = textBlock.body || body;
    }

    if (rightItem.blocks && rightItem.blocks.length > 0) {
      slides = rightItem.blocks.map((b: any, idx: number) => ({
        id: b.id || `slide-${idx}`,
        badge: b.eyebrow,
        title: b.title,
        text: b.body,
        buttonLabel: b.buttonLabel,
        buttonUrl: b.buttonUrl,
        imageUrl: b.imageUrl,
        imageAlt: b.imageAlt
      }));
    }
  }

  // Keep activeCardIndex in bounds if slides change
  const currentSlidesCount = slides.length;
  useEffect(() => {
    if (activeCardIndex >= currentSlidesCount) {
      setActiveCardIndex(Math.max(0, currentSlidesCount - 1));
    }
  }, [currentSlidesCount, activeCardIndex]);

  // Set default fallbacks if values are missing
  eyebrow = eyebrow || "The Experience";
  title = title || "Stopping the Scroll.";
  body = body || "Notice how the layout is locked. The scrollbar no longer moves the page vertically. Instead, it directs all energy into fueling the progressive card reveal on the right.";
  const background = section?.background || block?.elementBackground || "#0a0a0a";

  // Configuration options for scroll behavior and animation variations
  const settings = activeData?.carouselSettings;
  const variant = settings?.variant ?? "perfect";
  const scrubSpeed = settings?.scrubSpeed ?? 1.2;
  const pinHeightFactor = settings?.pinHeightFactor ?? 100;
  const showNavigation = settings?.showNavigation ?? true;

  const checklistItems = activeData?.items && activeData.items.length > 0
    ? activeData.items
    : [
        "Natively linked with local state settings",
        "Fully customizable badge numbers and tags",
        "Smooth mobile & desktop layout responsiveness",
      ];

  const listIconName = activeData?.listIcon ?? "circleCheck";

  const renderIcon = (iconName: string, colorClass: string, size?: number) => {
    const iconProps = { 
      className: `${colorClass} flex-shrink-0 ${!size ? "w-5 h-5" : ""}`,
      style: size ? { width: `${size}px`, height: `${size}px` } : undefined,
      size: size ?? 20
    };
    switch (iconName) {
      case "check":
        return <Check {...iconProps} />;
      case "arrowRight":
        return <ArrowRight {...iconProps} />;
      case "star":
        return <Star {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "sparkles":
        return <Sparkles {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "circleCheck":
      default:
        return <CheckCircle2 {...iconProps} />;
    }
  };

  const handleNavClick = (idx: number) => {
    if (scrollTriggerRef.current) {
      const st = scrollTriggerRef.current;
      const start = st.start;
      const end = st.end;
      const total = end - start;
      const targetScroll = start + (idx / slides.length) * total + 2;
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth"
      });
    } else {
      setActiveCardIndex(idx);
    }
  };

  useEffect(() => {
    if (isPreview) return;

    // 1. Accessibility Check
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // 2. GSAP Context setup
    const ctx = gsap.context(() => {
      if (!triggerRef.current) return;

      const cards = gsap.utils.toArray<HTMLElement>(
        triggerRef.current.querySelectorAll(".scroll-pinned-card-item")
      );
      if (cards.length === 0) return;

      // Master Scroll-Driven Pinning Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",                     // Pins when the top of the container hits the top of the viewport
          end: `+=${cards.length * pinHeightFactor}%`, // Dynamic pinning height based on slide count and height factor
          pin: true,                            // Locks container visual state
          scrub: scrubSpeed,                    // Link scroll to timeline smoothly with configurable speed
          anticipatePin: 1,                     // Prevents minor pinning jumps
          onUpdate: (self) => {
            const idx = Math.min(Math.floor(self.progress * cards.length), cards.length - 1);
            setActiveCardIndex(idx);
          }
        }
      });

      scrollTriggerRef.current = tl.scrollTrigger;

      // Dynamically chain animations for each card
      cards.forEach((card, index) => {
        const progressPercentage = ((index + 1) / cards.length) * 100;

        // Step A: Animate the vertical progress bar indicator
        tl.to(progressLineRef.current, {
          height: `${progressPercentage}%`,
          duration: 1,
          ease: "none",
        });

        // Step B: Fade out previous card if it exists
        if (index > 0) {
          if (variant === "fade") {
            tl.to(cards[index - 1], {
              autoAlpha: 0,
              duration: 1,
            }, "-=1");
          } else if (variant === "slide") {
            tl.to(cards[index - 1], {
              autoAlpha: 0,
              x: -100,
              duration: 1,
            }, "-=1");
          } else { // "perfect"
            tl.to(cards[index - 1], {
              autoAlpha: 0,
              scale: 0.9,
              y: -50,
              duration: 1,
            }, "-=1");
          }
        }

        // Step C: Fade in current card
        if (variant === "fade") {
          tl.fromTo(
            card,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 1.2, ease: "power1.inOut" },
            "-=0.5" // Overlap by 0.5s with the previous animation step
          );
        } else if (variant === "slide") {
          tl.fromTo(
            card,
            { autoAlpha: 0, x: 200 },
            { autoAlpha: 1, x: 0, duration: 1.5, ease: "power3.out" },
            "-=0.5"
          );
        } else { // "perfect" (Our current perfect default variant)
          tl.fromTo(
            card,
            { autoAlpha: 0, scale: 0.8, y: 100 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 1.5, ease: "power2.out" },
            "-=0.5"
          );
        }
      });

    }, triggerRef);

    // 3. Cleanup on unmount
    return () => {
      ctx.revert();
      scrollTriggerRef.current = null;
    };
  }, [slides.length, isPreview, variant, scrubSpeed, pinHeightFactor]);

  const isRichText = (val: string) => /<[a-z][\s\S]*>/i.test(val);

  // Resolve section spacing from builder settings
  const sectionSpacingStyle: Record<string, string | undefined> = {};
  if (section) {
    if (section.topSpacing && section.topSpacing !== "inherit") {
      sectionSpacingStyle["--builder-section-padding-top"] = resolveBuilderSpacing(section.topSpacing, "sectionPadding").css;
    }
    if (section.bottomSpacing && section.bottomSpacing !== "inherit") {
      sectionSpacingStyle["--builder-section-padding-bottom"] = resolveBuilderSpacing(section.bottomSpacing, "sectionPadding").css;
    }
    if (section.topMargin && section.topMargin !== "inherit") {
      sectionSpacingStyle["--builder-section-margin-top"] = resolveBuilderSpacing(section.topMargin, "sectionMargin").css;
    }
    if (section.bottomMargin && section.bottomMargin !== "inherit") {
      sectionSpacingStyle["--builder-section-margin-bottom"] = resolveBuilderSpacing(section.bottomMargin, "sectionMargin").css;
    }
  }

  // Build dynamic inline padding/margin from resolved spacing or fallback to CSS variables
  const resolvedPaddingTop = sectionSpacingStyle["--builder-section-padding-top"]
    ?? "var(--builder-global-section-padding-top, clamp(28px, 5vw, 72px))";
  const resolvedPaddingBottom = sectionSpacingStyle["--builder-section-padding-bottom"]
    ?? "var(--builder-global-section-padding-bottom, clamp(28px, 5vw, 72px))";
  const resolvedMarginTop = sectionSpacingStyle["--builder-section-margin-top"]
    ?? "var(--builder-global-section-margin-top, 0px)";
  const resolvedMarginBottom = sectionSpacingStyle["--builder-section-margin-bottom"]
    ?? "var(--builder-global-section-margin-bottom, 0px)";

  if (!slides || slides.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-3xl">
        <LayoutTemplate className="w-8 h-8 mx-auto mb-4 text-neutral-600" />
        <p>No slides defined for Scroll Pinned section.</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full font-sans ${textColorClass} antialiased`}
      style={{
        marginTop: resolvedMarginTop,
        marginBottom: resolvedMarginBottom,
        ...sectionSpacingStyle,
      } as React.CSSProperties}
    >
      {/* PINNED SECTION ZONE */}
      <section 
        ref={triggerRef} 
        className={`scroll-pinned-section relative w-full flex items-center justify-center overflow-hidden ${
          isPreview ? "min-h-[500px]" : "min-h-screen"
        }`}
        style={{
          paddingTop: resolvedPaddingTop,
          paddingBottom: resolvedPaddingBottom,
        } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.04),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.04),transparent_40%)]" />

        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center min-h-[70vh] relative z-10">
          
          {/* Left Panel: Static content with Scroll Progress Tracker */}
          <div className="md:col-span-5 flex flex-col justify-center h-full">
            <div className="flex items-start gap-4">
              {/* Vertical Progress Bar Tracker */}
              <div className={`w-[4px] h-[240px] ${isDark ? "bg-neutral-800" : "bg-neutral-200"} rounded-full relative overflow-hidden flex-shrink-0 mt-2`}>
                <div 
                  ref={progressLineRef} 
                  className="absolute top-0 left-0 w-full h-[0%] bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={isPreview ? { height: `${((activeCardIndex + 1) / slides.length) * 100}%` } : undefined}
                />
              </div>

              <div className="flex flex-col gap-6">
                <span className="text-sm font-bold text-sky-400 uppercase tracking-wider">
                  {eyebrow}
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  {title}
                </h2>
                
                {isRichText(body) ? (
                  <div 
                    className={`${mutedTextColorClass} text-base md:text-lg leading-relaxed space-y-4`}
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                ) : (
                  <p className={`${mutedTextColorClass} text-base md:text-lg leading-relaxed`}>
                    {body}
                  </p>
                )}

                <ul className="scroll-pinned-checklist">
                  {checklistItems.map((item: string, index: number) => {
                    const colorClass = [
                      "text-sky-400",
                      "text-indigo-400",
                      "text-purple-400",
                    ][index % 3];
                    return (
                      <li key={`${item}-${index}`} className="scroll-pinned-checklist-item">
                        {renderIcon(listIconName, colorClass, activeData?.listIconSize)}
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>

                {showNavigation && (
                  <div className={`flex items-center gap-4 mt-2 pt-4 border-t ${isDark ? "border-neutral-800/80" : "border-neutral-200"}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetIdx = Math.max(0, activeCardIndex - 1);
                        handleNavClick(targetIdx);
                      }}
                      disabled={activeCardIndex === 0}
                      className="scroll-pinned-nav-btn px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all border"
                    >
                      Prev
                    </button>
                    <div className="flex items-center gap-1.5">
                      {slides.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavClick(idx);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            idx === activeCardIndex 
                              ? "bg-sky-400 w-6" 
                              : (isDark ? "bg-neutral-700 hover:bg-neutral-600" : "bg-neutral-300 hover:bg-neutral-400")
                          }`}
                          title={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetIdx = Math.min(slides.length - 1, activeCardIndex + 1);
                        handleNavClick(targetIdx);
                      }}
                      disabled={activeCardIndex === slides.length - 1}
                      className="scroll-pinned-nav-btn px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all border"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Progressive Visual Cards stack */}
          <div 
            className="md:col-span-7 relative flex items-center justify-center min-h-[480px] w-full cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();
              const nextIdx = (activeCardIndex + 1) % slides.length;
              handleNavClick(nextIdx);
            }}
          >
            {slides.map((slide: any, index: number) => {
              const slideBadge = slide.badge || `0${index + 1}`;
              const gradientClass = [
                "from-sky-500 to-indigo-600 shadow-sky-500/20",
                "from-indigo-500 to-purple-600 shadow-indigo-500/20",
                "from-purple-500 to-pink-600 shadow-purple-500/20",
                "from-pink-500 to-rose-600 shadow-pink-500/20",
              ][index % 4];

              const isActive = index === activeCardIndex;
              let previewClasses = "";
              if (isPreview) {
                if (variant === "fade") {
                  previewClasses = isActive
                    ? "opacity-100 pointer-events-auto z-10"
                    : "opacity-0 pointer-events-none z-0";
                } else if (variant === "slide") {
                  previewClasses = isActive
                    ? "opacity-100 translate-x-0 pointer-events-auto z-10"
                    : "opacity-0 translate-x-8 pointer-events-none z-0";
                } else { // "perfect"
                  previewClasses = isActive
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto z-10"
                    : "opacity-0 scale-95 translate-y-8 pointer-events-none z-0";
                }
              }

              return (
                <div 
                  key={slide.id || `pinned-slide-${index}`}
                  className={`scroll-pinned-card-item scroll-pinned-card-item--${panelStyle} w-full max-w-[500px] p-8 flex flex-col gap-6 absolute ${
                    isPreview
                      ? `transition-all duration-500 ease-out transform ${previewClasses}`
                      : "opacity-0"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center font-bold text-lg text-white shadow-lg`}>
                    {slideBadge}
                  </div>
                  <h3 className="scroll-pinned-card-title text-2xl font-bold">
                    {slide.title || "Untitled Card"}
                  </h3>
                  
                  {slide.text && (
                    isRichText(slide.text) ? (
                      <div 
                        className="scroll-pinned-card-text text-sm md:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: slide.text }}
                      />
                    ) : (
                      <p className="scroll-pinned-card-text text-sm md:text-base leading-relaxed">
                        {slide.text}
                      </p>
                    )
                  )}

                  {slide.items && slide.items.length > 0 && (
                    <ul className="scroll-pinned-checklist" style={{ marginTop: '10px' }}>
                      {slide.items.map((item: string, itemIdx: number) => {
                        const isGradient = slide.listIconColorScheme === "gradient-cycle";
                        const colorClass = isGradient
                          ? [
                              "text-sky-400",
                              "text-indigo-400",
                              "text-purple-400",
                            ][itemIdx % 3]
                          : "text-current opacity-85";
                        return (
                          <li key={`${item}-${itemIdx}`} className="scroll-pinned-checklist-item">
                            {renderIcon(slide.listIcon || "check", colorClass, slide.listIconSize)}
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {slide.imageUrl ? (
                    <div 
                      className="h-[140px] rounded-2xl bg-cover bg-center border border-neutral-800/30"
                      style={{ backgroundImage: `url(${slide.imageUrl})` }}
                    />
                  ) : (
                    <div className="scroll-pinned-card-fallback-image h-[120px] rounded-2xl flex items-center justify-center">
                      <LayoutTemplate className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {slide.buttonLabel && slide.buttonUrl && (
                    <a 
                      href={slide.buttonUrl}
                      className="scroll-pinned-card-button inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors self-start"
                    >
                      {slide.buttonLabel}
                    </a>
                  )}
                </div>
              );
            })}

          </div>

        </div>
      </section>
    </div>
  );
}
