"use client";

import { useTheme } from "@/components/ThemeProvider";
import { SiteIconButton } from "@/components/ui/SiteIconButton";

type ThemeToggleProps = {
  variant?: "muted" | "ghost" | "solid" | "icon";
  size?: "sm" | "md" | "lg";
};

export default function ThemeToggle({
  variant = "muted",
  size = "md",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <SiteIconButton
      icon={theme === "dark" ? "moon" : "sun"}
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    />
  );
}