"use client";

import { useTheme } from "@/components/ThemeProvider";
import { SiteIconButton } from "@/components/ui/SiteIconButton";
import { useOptionalTranslation } from "@/components/i18n/LanguageProvider";

type ThemeToggleProps = {
  variant?: "muted" | "ghost" | "solid" | "icon";
  size?: "sm" | "md" | "lg";
};

export default function ThemeToggle({
  variant = "muted",
  size = "md",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const i18n = useOptionalTranslation();

  return (
    <SiteIconButton
      icon={theme === "dark" ? "moon" : "sun"}
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={i18n?.t("theme.toggle") ?? "Toggle dark mode"}
    />
  );
}
