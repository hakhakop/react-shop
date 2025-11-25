"use client";

import { useTheme } from "@/components/ThemeProvider";
import { AppIconButton } from "@/components/ui/AppIconButton";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppIconButton
      icon={theme === "dark" ? "🌙" : "☀️"}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    />
  );
}