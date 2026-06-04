"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function GsapScrollTriggerTest() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { width: "0%" },
        {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50vh",
            end: "+=120vh",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="shop-builder-section shop-builder-section--full shop-builder-section--content-boxed"
      style={{
        position: "relative",
        background: "#f3f0ff",
        padding: 0,
      }}
    >
      <div
        className="shop-builder-section-content"
        style={{
          position: "sticky",
          top: "50vh",
          height: "50vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 22,
            fontWeight: 700,
            color: "#1a1a2e",
          }}
        >
          Sticky + GSAP Scrub (Spacer)
        </h2>
        <p style={{ margin: "0 0 32px", fontSize: 14, color: "#555" }}>
          Section has natural height. A spacer provides scroll room for the sticky duration.
        </p>
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            height: 28,
            background: "#e0d9ff",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            ref={lineRef}
            style={{
              width: "0%",
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
              borderRadius: 14,
            }}
          />
        </div>
      </div>
      <div style={{ height: "120vh", pointerEvents: "none" }} />
    </section>
  );
}
