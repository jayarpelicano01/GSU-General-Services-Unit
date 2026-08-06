"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const THEME_KEY = "gsu-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const listeners = new Set<() => void>();

let cachedTheme: Theme | null = null;

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  if (cachedTheme === null) {
    cachedTheme = (localStorage.getItem(THEME_KEY) as Theme | null) ?? "light";
  }
  return cachedTheme;
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Theme {
  return readTheme();
}

function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = theme;
}

function commitTheme(theme: Theme) {
  cachedTheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  emitChange();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    commitTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    commitTheme(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
