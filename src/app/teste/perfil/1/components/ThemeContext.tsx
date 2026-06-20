"use client";

import React, { createContext, useContext, useState } from "react";
import type { Theme } from "../types";
import { THEME_ACCENT } from "../mock-data";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "cyberpunk",
  setTheme: () => {},
  accent: THEME_ACCENT["cyberpunk"],
});

export function ProfileThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("cyberpunk");

  const setTheme = (t: Theme) => setThemeState(t);
  const accent = THEME_ACCENT[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useProfileTheme() {
  return useContext(ThemeContext);
}
