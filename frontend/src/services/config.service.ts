import Config, { AdminConfig, UpdateConfig } from "../types/config.type";
import api from "./api.service";
import { stringToTimespan } from "../utils/date.util";
import { getCookie } from "cookies-next";
import { encodePathSegment } from "../utils/url.util";

const LOCALIZED_LEGAL_KEYS = [
  "legal.imprintText",
  "legal.imprintUrl",
  "legal.privacyPolicyText",
  "legal.privacyPolicyUrl",
];

const parseLocalizedMap = (value: string): Record<string, string> | null => {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed))
      return null;

    return Object.entries(parsed).reduce<Record<string, string>>(
      (acc, [key, mapValue]) => {
        if (typeof mapValue === "string") acc[key] = mapValue;
        return acc;
      },
      {},
    );
  } catch {
    return null;
  }
};

const getLocalizedValue = (value: string, locale: string): string => {
  const map = parseLocalizedMap(value);
  if (!map) return value;

  const baseLanguage = locale.split("-")[0];
  return (
    map[locale] ??
    map[baseLanguage] ??
    map["en-US"] ??
    map.en ??
    ""
  );
};

const list = async (): Promise<Config[]> => {
  return (await api.get("/configs")).data;
};

const getByCategory = async (category: string): Promise<AdminConfig[]> => {
  const safeCategory = encodePathSegment(category);
  return (await api.get(`/configs/admin/${safeCategory}`)).data;
};

const updateMany = async (data: UpdateConfig[]): Promise<AdminConfig[]> => {
  return (await api.patch("/configs/admin", data)).data;
};

const get = (key: string, configVariables: Config[]): any => {
  if (!configVariables || configVariables.length === 0) {
    // During static generation, config might not be loaded yet
    // Return null instead of throwing to allow pages to be statically generated
    return null;
  }

  const configVariable = configVariables.filter(
    (variable) => variable.key == key,
  )[0];

  if (!configVariable) {
    // During static generation, return null instead of throwing
    if (typeof window === "undefined") return null;
    throw new Error(`Config variable ${key} not found`);
  }

  const value = configVariable.value ?? configVariable.defaultValue;
  const locale = getCookie("language")?.toString() ?? "en-US";
  const resolvedValue =
    LOCALIZED_LEGAL_KEYS.includes(key) && typeof value === "string"
      ? getLocalizedValue(value, locale)
      : value;

  if (configVariable.type == "number" || configVariable.type == "filesize")
    return parseInt(resolvedValue, 10);
  if (configVariable.type == "boolean") return resolvedValue == "true";
  if (configVariable.type == "string" || configVariable.type == "text")
    return resolvedValue;
  if (configVariable.type == "timespan") return stringToTimespan(resolvedValue);
};

const finishSetup = async (): Promise<AdminConfig[]> => {
  return (await api.post("/configs/admin/finishSetup")).data;
};

const sendTestEmail = async (email: string) => {
  await api.post("/configs/admin/testEmail", { email });
};

const resetEmailTranslations = async (): Promise<AdminConfig[]> => {
  return (await api.post("/configs/admin/email/resetTranslations")).data;
};

const resetLegalTranslations = async (): Promise<AdminConfig[]> => {
  return (await api.post("/configs/admin/legal/resetTranslations")).data;
};

const isNewReleaseAvailable = async () => {
  const response = (await (
    await fetch(
      "https://api.github.com/repos/swissmakers/swiss-datashare/releases/latest",
    )
  ).json()) as { tag_name: string };
  return response.tag_name.replace("v", "") != process.env.VERSION;
};

const changeLogo = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  await api.post("/configs/admin/logo", form);
};
export default {
  list,
  getByCategory,
  updateMany,
  get,
  finishSetup,
  sendTestEmail,
  resetEmailTranslations,
  resetLegalTranslations,
  isNewReleaseAvailable,
  changeLogo,
};
