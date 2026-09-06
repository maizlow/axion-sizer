import { create } from "zustand";

export type Theme = "dark" | "light";

function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem("axion-theme");
  return v === "light" || v === "dark" ? v : "dark";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
}

export const useTheme = create<{ theme: Theme; setTheme: (theme: Theme) => void; toggle: () => void }>()((set, get) => ({
  theme: readTheme(),
  setTheme: (theme) => {
    if (typeof window !== "undefined") window.localStorage.setItem("axion-theme", theme);
    applyTheme(theme);
    set({ theme });
  },
  toggle: () => get().setTheme(get().theme === "light" ? "dark" : "light"),
}));

applyTheme(readTheme());
