import type { NextPageContext } from "next";
import type Config from "../types/config.type";
import { LOCALES } from "../i18n/locales";
import i18nUtil from "./i18n.util";

export function parseCookieHeader(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    const raw = trimmed.slice(name.length + 1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

export async function fetchPublicConfigList(): Promise<Config[]> {
  const endpoint =
    typeof window === "undefined"
      ? `${process.env.API_URL || "http://localhost:8080"}/api/configs`
      : "/api/configs";

  const res = await fetch(endpoint, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to load public configs: ${res.status}`);
  }
  return res.json() as Promise<Config[]>;
}

export function getSiteDefaultLocaleFromConfigs(configs: Config[]): string {
  const row = configs.find((c) => c.key === "general.defaultLocale");
  return (
    (row?.value as string | undefined) ??
    row?.defaultValue ??
    LOCALES.ENGLISH.code
  ).toString();
}

/** Resolved text for a public config key (`category.name`), or empty string. */
export function getPublicConfigText(
  configs: Config[] | null | undefined,
  key: string,
): string {
  if (!configs?.length) return "";
  const row = configs.find((c) => c.key === key);
  const raw = row?.value ?? row?.defaultValue;
  if (raw == null) return "";
  return String(raw);
}

export type PageLocaleProps = {
  creatorLocale?: string | null;
  initialResolvedLocale?: string;
};

function readAcceptLanguage(ctx: NextPageContext): string | null {
  const h = ctx.req?.headers["accept-language"];
  if (typeof h === "string") return h;
  if (Array.isArray(h) && typeof h[0] === "string") return h[0];
  return null;
}

function cookieLangForLocale(ctx: NextPageContext): string | null {
  if (ctx.req?.headers.cookie) {
    return parseCookieHeader(ctx.req.headers.cookie, "language");
  }
  if (typeof document !== "undefined") {
    return parseCookieHeader(document.cookie, "language");
  }
  return null;
}

/**
 * Resolves UI locale for the first paint (SSR or client getInitialProps).
 * If the page already supplied `initialResolvedLocale` (e.g. reverse-share GSSP), that wins.
 */
export function resolveAppInitialLocale(
  ctx: NextPageContext,
  pageProps: PageLocaleProps | undefined,
  configs: Config[] | null,
): string {
  if (pageProps?.initialResolvedLocale) {
    return i18nUtil.normalizeSupportedUiLocale(pageProps.initialResolvedLocale);
  }

  const siteDefault =
    configs && configs.length > 0
      ? getSiteDefaultLocaleFromConfigs(configs)
      : LOCALES.ENGLISH.code;

  const acceptLanguageHeader = ctx.req ? readAcceptLanguage(ctx) : null;
  const navigatorLanguage =
    !ctx.req && typeof navigator !== "undefined"
      ? navigator.language
      : null;

  return i18nUtil.resolveDisplayLocale({
    cookieLang: cookieLangForLocale(ctx),
    creatorLocale: pageProps?.creatorLocale ?? null,
    userLocale: null,
    siteDefaultLocale: siteDefault,
    acceptLanguageHeader,
    navigatorLanguage,
  });
}
