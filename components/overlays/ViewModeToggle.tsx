"use client";

import { useEffect, useState } from "react";

// Three view modes: list (1 per row), comfortable (default grid), compact (2-wide)
type ViewMode = "list" | "comfortable" | "compact";
const STORAGE_KEY = "webpages_view_mode";

function getInitialMode(): ViewMode {
  if (typeof window === "undefined") return "comfortable";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "list" || stored === "compact" || stored === "comfortable") {
    return stored as ViewMode;
  }
  return "comfortable";
}

export default function ViewModeToggle() {
  const [mode, setMode] = useState<ViewMode>(getInitialMode);

  // Persist + apply to <html> when mode changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, mode);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.viewMode = mode;
    }
  }, [mode]);

  const baseBtn: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 11,
    border: "none",
    cursor: "pointer",
    background: "transparent",
  };

  function styleFor(target: ViewMode): React.CSSProperties {
    const active = mode === target;
    return {
      ...baseBtn,
      backgroundColor: active ? "#ffffff" : "transparent",
      color: active ? "#111827" : "#e5e7eb",
    };
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "rgba(15,23,42,0.9)",
        padding: 2,
        fontSize: 11,
      }}
      aria-label="Change product grid density"
    >
      {/* List (1 per row, flatter look) */}
      <button
        type="button"
        onClick={() => setMode("list")}
        style={styleFor("list")}
      >
        <span style={{ fontSize: 13 }}>☰</span>
        <span
          style={{ display: "none", marginLeft: 2 }}
          className="view-toggle-label-list"
        >
          List
        </span>
      </button>

      {/* Comfortable (default) */}
      <button
        type="button"
        onClick={() => setMode("comfortable")}
        style={styleFor("comfortable")}
      >
        <span style={{ fontSize: 13 }}>▢▢</span>
        <span
          style={{ display: "none", marginLeft: 2 }}
          className="view-toggle-label-comfort"
        >
          Comfort
        </span>
      </button>

      {/* Compact: 2-wide */}
      <button
        type="button"
        onClick={() => setMode("compact")}
        style={styleFor("compact")}
      >
        <span style={{ fontSize: 13 }}>▥▥</span>
        <span
          style={{ display: "none", marginLeft: 2 }}
          className="view-toggle-label-compact"
        >
          2-wide
        </span>
      </button>
    </div>
  );
}
