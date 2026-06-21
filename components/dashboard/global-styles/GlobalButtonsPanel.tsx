"use client";

import { useGlobalStyles } from "../context/GlobalStylesContext";

export default function GlobalButtonsPanel() {
  const { shellSettings } = useGlobalStyles();

  return (
    <div className="builder-global-styles-group">
      <div className="builder-card-title">
        <strong>Buttons</strong>
        <span>{shellSettings?.buttonPreset ?? "global defaults"}</span>
      </div>
      <p className="builder-muted-copy">
        Button controls are currently managed by the active Global Styles buttons tab.
      </p>
    </div>
  );
}
