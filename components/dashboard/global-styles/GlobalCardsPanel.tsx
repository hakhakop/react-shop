"use client";

import { useGlobalStyles } from "../context/GlobalStylesContext";

export default function GlobalCardsPanel() {
  const { shellSettings } = useGlobalStyles();

  return (
    <div className="builder-global-styles-group">
      <div className="builder-card-title">
        <strong>Cards</strong>
        <span>{shellSettings?.cardPreset ?? "global defaults"}</span>
      </div>
      <p className="builder-muted-copy">
        Card controls are currently managed by the active Global Styles cards tab.
      </p>
    </div>
  );
}
