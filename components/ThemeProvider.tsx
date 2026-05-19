"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = "wc-store-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  )?.matches;

  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const hasMounted = useRef(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyThemeToDocument(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    applyThemeToDocument(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
