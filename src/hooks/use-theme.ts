import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "auvp-theme-v1";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * Tema claro/escuro do DS. O estado inicial vem da classe já aplicada pelo
 * script inline em index.html (que respeita localStorage e prefers-color-scheme).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* armazenamento indisponível — tema segue apenas em memória */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}
