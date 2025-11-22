"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

/**
 * ThemeToggle
 *
 * Simple client‑side theme switcher that toggles a data-theme attribute
 * on the &lt;html&gt; element between "light" and "dark".
 * The header.css file styles the segmented Light/Dark pill.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Initialize from document on mount (if already set)
  useEffect(() => {
    if (typeof document === "undefined") return;
    const current = (document.documentElement.getAttribute("data-theme") ||
      "light") as ThemeMode;
    setTheme(current);
  }, []);

  // Apply theme to document attribute whenever it changes
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle dark mode"
    >
      <span className="theme-toggle-option theme-toggle-option--light">
        Light
      </span>
      <span className="theme-toggle-option theme-toggle-option--dark">
        Dark
      </span>
      <span className="theme-toggle-indicator" aria-hidden="true" />
    </button>
  );
}