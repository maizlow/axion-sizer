import { create } from "zustand";
import { MESSAGES, type Locale } from "./messages";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

function readStored(): Locale {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem("axion-locale");
  return v === "sv" || v === "en" ? v : "en";
}

export const useLocale = create<LocaleState>()((set) => ({
  locale: readStored(),
  setLocale: (locale) => {
    if (typeof window !== "undefined") window.localStorage.setItem("axion-locale", locale);
    set({ locale });
  },
}));

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

export function useT() {
  const locale = useLocale((s) => s.locale);
  return (key: string, vars?: Record<string, string | number>) => t(locale, key, vars);
}
