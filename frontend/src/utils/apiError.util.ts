import axios from "axios";
import { getCookie } from "cookies-next";
import { LOCALES } from "../i18n/locales";

const TIMEOUT_KEY = "common.error.request-timeout";

export function isTransientApiError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return true;
  if (!error.response && error.message === "Network Error") return true;
  const status = error.response?.status;
  return status === 502 || status === 503 || status === 504;
}

export function getRequestTimeoutMessage(): string {
  const code = (getCookie("language") as string | undefined) ?? "en-US";
  const locale =
    Object.values(LOCALES).find((l) => l.code === code) ?? LOCALES.ENGLISH;
  const msg = (locale.messages as Record<string, string | undefined>)[
    TIMEOUT_KEY
  ];
  if (typeof msg === "string" && msg.trim()) return msg;
  return (LOCALES.ENGLISH.messages as Record<string, string>)[TIMEOUT_KEY] ??
    "The server did not respond in time. Please try again.";
}
