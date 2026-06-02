"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, LayoutTemplate } from "lucide-react";
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

  // Normalize data sources between section and block configurations
  const activeData = section || block;
  let eyebrow = activeData?.eyebrow;
  let title = activeData?.title;
  let body = activeData?.body;
  let slides = activeData?.slides || [];

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

  const checklistItems = [
    "Natively linked with local state settings",
    "Fully customizable badge numbers and tags",
    "Smooth mobile & desktop layout responsiveness",
  ];

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
          end: `+=${cards.length * 100}%`,       // Dynamic pinning height based on slide count
          pin: true,                            // Locks container visual state
          scrub: 1.2,                           // Link scroll to timeline smoothly (1.2s lag/catchup)
          anticipatePin: 1,                     // Prevents minor pinning jumps
        },
      });

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
          tl.to(cards[index - 1], {
            autoAlpha: 0,
            scale: 0.9,
            y: -50,
            duration: 1,
          }, "-=1"); // Start at same time as progress bar line animation
        }

        // Step C: Fade in current card
        tl.fromTo(
          card,
          { autoAlpha: 0, scale: 0.8, y: 100 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 1.5, ease: "power2.out" },
          "-=0.5" // Overlap by 0.5s with the previous animation step
        );
      });

    }, triggerRef);

    // 3. Cleanup on unmount
    return () => ctx.revert();
  }, [slides.length, isPreview]);

  const isRichText = (val: string) => /<[a-z][\s\S]*>/i.test(val);

  if (!slides || slides.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-3xl">
        <LayoutTemplate className="w-8 h-8 mx-auto mb-4 text-neutral-600" />
        <p>No slides defined for Scroll Pinned section.</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans text-white antialiased" style={{ backgroundColor: background }}>
      {/* PINNED SECTION ZONE */}
      <section 
        ref={triggerRef} 
        className={`relative w-full flex items-center justify-center overflow-hidden py-12 ${
          isPreview ? "min-h-[500px]" : "min-h-screen"
        }`}
        style={{ backgroundColor: background }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.04),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.04),transparent_40%)]" />

        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center min-h-[70vh] relative z-10">
          
          {/* Left Panel: Static content with Scroll Progress Tracker */}
          <div className="md:col-span-5 flex flex-col justify-center h-full">
            <div className="flex items-start gap-4">
              {/* Vertical Progress Bar Tracker */}
              <div className="w-[4px] h-[240px] bg-neutral-800 rounded-full relative overflow-hidden flex-shrink-0 mt-2">
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
                    className="text-neutral-400 text-base md:text-lg leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: body }}
                  />
                ) : (
                  <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                    {body}
                  </p>
                )}

                <div className="flex flex-col gap-3 text-neutral-500 text-sm">
                  {checklistItems.map((item, index) => {
                    const colorClass = [
                      "text-sky-400",
                      "text-indigo-400",
                      "text-purple-400",
                    ][index % 3];
                    return (
                      <div key={`${item}-${index}`} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-5 h-5 ${colorClass} flex-shrink-0`} />
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>

                {isPreview && (
                  <div className="flex items-center gap-4 mt-2 pt-4 border-t border-neutral-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardIndex(prev => Math.max(0, prev - 1));
                      }}
                      disabled={activeCardIndex === 0}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white border border-neutral-700/50"
                    >
                      Prev
                    </button>
                    <div className="flex items-center gap-1.5">
                      {slides.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCardIndex(idx);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            idx === activeCardIndex ? "bg-sky-400 w-6" : "bg-neutral-700 hover:bg-neutral-600"
                          }`}
                          title={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardIndex(prev => Math.min(slides.length - 1, prev + 1));
                      }}
                      disabled={activeCardIndex === slides.length - 1}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all text-white border border-neutral-700/50"
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
              if (isPreview) {
                e.stopPropagation();
                setActiveCardIndex((prev) => (prev + 1) % slides.length);
              }
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

              return (
                <div 
                  key={slide.id || `pinned-slide-${index}`}
                  className={`scroll-pinned-card-item w-full max-w-[500px] bg-neutral-900/70 border border-neutral-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col gap-6 absolute ${
                    isPreview
                      ? `transition-all duration-500 ease-out transform ${
                          isActive
                            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto z-10"
                            : "opacity-0 scale-95 translate-y-8 pointer-events-none z-0"
                        }`
                      : "opacity-0"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center font-bold text-lg text-white shadow-lg`}>
                    {slideBadge}
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                    {slide.title || "Untitled Card"}
                  </h3>
                  
                  {slide.text && (
                    isRichText(slide.text) ? (
                      <div 
                        className="text-neutral-400 text-sm md:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: slide.text }}
                      />
                    ) : (
                      <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                        {slide.text}
                      </p>
                    )
                  )}

                  {slide.imageUrl ? (
                    <div 
                      className="h-[140px] rounded-2xl bg-cover bg-center border border-neutral-800"
                      style={{ backgroundImage: `url(${slide.imageUrl})` }}
                    />
                  ) : (
                    <div className="h-[120px] rounded-2xl bg-gradient-to-br from-neutral-800/10 to-transparent border border-neutral-800/40 flex items-center justify-center">
                      <LayoutTemplate className="w-8 h-8 text-neutral-600" />
                    </div>
                  )}

                  {slide.buttonLabel && slide.buttonUrl && (
                    <a 
                      href={slide.buttonUrl}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors self-start"
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
