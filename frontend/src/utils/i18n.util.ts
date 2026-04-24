import { setCookie } from "cookies-next";
import { LOCALES } from "../i18n/locales";

const SUPPORTED_UI_LOCALES = Object.values(LOCALES).map((l) => l.code);

const BASE_LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
};

/** Maps arbitrary input to a supported UI locale code (e.g. `de` → `de-DE`). */
const normalizeSupportedUiLocale = (locale?: string | null): string => {
  if (!locale) return LOCALES.ENGLISH.code;
  const normalized = locale.trim().toLowerCase();
  const exact = SUPPORTED_UI_LOCALES.find(
    (c) => c.toLowerCase() === normalized,
  );
  if (exact) return exact;
  const base = normalized.split("-")[0];
  return BASE_LANGUAGE_TO_LOCALE[base] ?? LOCALES.ENGLISH.code;
};

export type ResolveDisplayLocaleParams = {
  cookieLang?: string | null;
  creatorLocale?: string | null;
  userLocale?: string | null;
  siteDefaultLocale?: string | null;
  acceptLanguageHeader?: string | null;
  navigatorLanguage?: string | null;
};

/**
 * Priority: explicit cookie → reverse-share creator → logged-in user →
 * site default → Accept-Language → navigator.
 */
const resolveDisplayLocale = (p: ResolveDisplayLocaleParams): string => {
  const fromAccept =
    p.acceptLanguageHeader != null && p.acceptLanguageHeader !== ""
      ? getLanguageFromAcceptHeader(p.acceptLanguageHeader)
      : null;

  const candidates = [
    p.cookieLang,
    p.creatorLocale,
    p.userLocale,
    p.siteDefaultLocale,
    fromAccept,
    p.navigatorLanguage,
  ];

  for (const raw of candidates) {
    if (raw != null && String(raw).trim() !== "") {
      return normalizeSupportedUiLocale(String(raw));
    }
  }
  return LOCALES.ENGLISH.code;
};

const getLocaleByCode = (code: string) => {
  return (
    Object.values(LOCALES).find((l) => l.code === code) ??
    LOCALES.ENGLISH
  );
};

// Parse the Accept-Language header and return the first supported language
const getLanguageFromAcceptHeader = (acceptLanguage?: string) => {
  if (!acceptLanguage) return LOCALES.ENGLISH.code;

  const languages = acceptLanguage.split(",").map((l) => l.split(";")[0]);
  const supportedLanguages = Object.values(LOCALES).map((l) => l.code);
  const supportedLanguagesWithoutRegion = supportedLanguages.map(
    (l) => l.split("-")[0],
  );

  for (const language of languages) {
    const trimmed = language.trim();
    // Try to match the full language code first, then the language code without the region
    if (supportedLanguages.includes(trimmed)) {
      return trimmed;
    } else if (
      supportedLanguagesWithoutRegion.includes(trimmed.split("-")[0])
    ) {
      const similarLanguage = supportedLanguages.find((l) =>
        l.startsWith(trimmed.split("-")[0]),
      );
      if (similarLanguage) return similarLanguage;
    }
  }
  return LOCALES.ENGLISH.code;
};

const isLanguageSupported = (code: string) => {
  return Object.values(LOCALES).some((l) => l.code === code);
};

const setLanguageCookie = (code: string) => {
  setCookie("language", code, {
    sameSite: "lax",
    expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  });
};

export default {
  getLocaleByCode,
  getLanguageFromAcceptHeader,
  isLanguageSupported,
  setLanguageCookie,
  normalizeSupportedUiLocale,
  resolveDisplayLocale,
};
