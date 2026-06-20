"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import AnimationControl from "../../style/AnimationControl";

export default function PremiumEffectsPanel({ allowPause = false }: { allowPause?: boolean }) {
  const { selectedLayoutBlock, selectedSection, updateSelectedLayoutBlockByKey, updateSelected } = useInspector();

  const target = selectedLayoutBlock ?? selectedSection;
  if (!target) return null;

  const animation = target.animation ?? {};

  const handleAnimationChange = (next: any) => {
    if (next.preset === "none") {
      next.delayMs = undefined;
      next.pauseUntilComplete = undefined;
    }
    
    if (selectedLayoutBlock) {
      updateSelectedLayoutBlockByKey({ animation: next });
    } else if (selectedSection) {
      updateSelected({ animation: next });
    }
  };

  return (
    <div className="builder-inspector-stack">
      <details className="builder-collapse" open>
        <summary>
          <span className="builder-group-summary-copy">
            <strong>Scroll Animation</strong>
            <em>Beautiful entrance animation on scroll.</em>
          </span>
          <small>
            {animation.preset && animation.preset !== "none"
              ? animation.preset.replace(/-/g, " ")
              : "None"}
          </small>
        </summary>
        <div className="builder-inspector-section">
          <AnimationControl
            value={animation}
            onChange={handleAnimationChange}
            allowPause={allowPause}
            allowScrub
          />
        </div>
      </details>
    </div>
  );
}
