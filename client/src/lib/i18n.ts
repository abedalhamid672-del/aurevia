import { useEffect, useMemo, useState } from "react";
import { getLocaleFromPathname, localeConfig, localizedCopy, type Locale } from "@shared/seo";

export type TranslationKey = keyof typeof localizedCopy.en;

export function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const pathLocale = getLocaleFromPathname(window.location.pathname);
  if (pathLocale === "ar") return "ar";
  try {
    const stored = window.localStorage.getItem("aurevia:locale:v1");
    if (stored === "ar" || stored === "en") return stored;
  } catch {
    // Storage is optional.
  }
  return window.navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  useEffect(() => {
    const next = getInitialLocale();
    setLocale(next);
    document.documentElement.lang = localeConfig[next].htmlLang;
    document.documentElement.dir = localeConfig[next].dir;
    try { window.localStorage.setItem("aurevia:locale:v1", next); } catch { /* optional */ }
  }, []);
  const copy = useMemo(() => localizedCopy[locale], [locale]);
  return { locale, copy, dir: localeConfig[locale].dir };
}

export function assertTranslationParity() {
  const englishKeys = Object.keys(localizedCopy.en).sort();
  const arabicKeys = Object.keys(localizedCopy.ar).sort();
  if (englishKeys.join("|") !== arabicKeys.join("|")) throw new Error("Translation key parity failed");
}
