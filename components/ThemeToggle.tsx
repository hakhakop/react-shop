"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle dark mode"
    >
      <span className="theme-toggle-icon">{isDark ? "🌙" : "☀️"}</span>
    </button>
  );
}