import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "freedom-index-theme";

function preferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

/**
 * Theme hook with three responsibilities: read the persisted choice (or
 * the OS preference when no choice exists), reflect it on `<html>` via
 * the `dark` class plus a `data-theme` attribute, and expose a setter
 * that persists to localStorage.
 *
 * This is the one persisted slice of state in the app — see spec 04.
 */
export function useTheme(): {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
} {
  const [theme, setThemeState] = useState<Theme>(() => preferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // localStorage may be unavailable (private mode etc.); ignore.
    }
    setThemeState(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}
