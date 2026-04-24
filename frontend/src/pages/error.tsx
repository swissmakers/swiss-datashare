import React from "react";
import Meta from "../components/Meta";
import useTranslate from "../hooks/useTranslate.hook";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import { safeRedirectPath } from "../utils/router.util";
import { Button, Container } from "../components/ui";

export function getServerSideProps() {
  // Make this page dynamic to avoid static generation issues
  return { props: {} };
}

export const dynamic = "force-dynamic";

type ErrorSlug =
  | "default"
  | "access_denied"
  | "expired_token"
  | "invalid_token"
  | "no_user"
  | "no_email"
  | "already_linked"
  | "not_linked"
  | "unverified_account"
  | "user_not_allowed"
  | "cannot_get_user_info";

const ERROR_KEYS_NEEDING_PARAM = new Set<ErrorSlug>([
  "no_user",
  "no_email",
  "already_linked",
  "not_linked",
  "unverified_account",
  "cannot_get_user_info",
]);

function normalizeErrorSlug(raw: unknown): ErrorSlug {
  if (typeof raw !== "string") return "default";
  switch (raw) {
    case "access_denied":
    case "expired_token":
    case "invalid_token":
    case "no_user":
    case "no_email":
    case "already_linked":
    case "not_linked":
    case "unverified_account":
    case "user_not_allowed":
    case "cannot_get_user_info":
      return raw;
    default:
      return "default";
  }
}

function resolveErrorMessageId(slug: ErrorSlug): string {
  switch (slug) {
    case "access_denied":
      return "error.msg.access_denied";
    case "expired_token":
      return "error.msg.expired_token";
    case "invalid_token":
      return "error.msg.invalid_token";
    case "no_user":
      return "error.msg.no_user";
    case "no_email":
      return "error.msg.no_email";
    case "already_linked":
      return "error.msg.already_linked";
    case "not_linked":
      return "error.msg.not_linked";
    case "unverified_account":
      return "error.msg.unverified_account";
    case "user_not_allowed":
      return "error.msg.user_not_allowed";
    case "cannot_get_user_info":
      return "error.msg.cannot_get_user_info";
    default:
      return "error.msg.default";
  }
}

function translateAllowedParam(
  param: string,
  t: (id: string) => string,
): string | null {
  switch (param) {
    case "provider_github":
      return t("error.param.provider_github");
    case "provider_google":
      return t("error.param.provider_google");
    case "provider_microsoft":
      return t("error.param.provider_microsoft");
    case "provider_discord":
      return t("error.param.provider_discord");
    case "provider_oidc":
      return t("error.param.provider_oidc");
    default:
      return null;
  }
}

export default function Error() {
  const t = useTranslate();
  const router = useRouter();

  const rawParams = router.query.params;
  const paramKeys =
    typeof rawParams === "string"
      ? rawParams.split(",").map((p) => p.trim()).filter(Boolean)
      : [];

  const resolvedParamLabels = paramKeys
    .map((param) => translateAllowedParam(param, t))
    .filter((label): label is string => label != null);

  let errorSlug = normalizeErrorSlug(router.query.error);

  if (
    ERROR_KEYS_NEEDING_PARAM.has(errorSlug) &&
    resolvedParamLabels.length === 0
  ) {
    errorSlug = "default";
  }

  const errorMessageId = resolveErrorMessageId(errorSlug);
  const messageValues = Object.fromEntries(
    resolvedParamLabels.map((label, index) => [String(index), label]),
  );

  const rawRedirect = router.query.redirect;
  const redirectFromQuery =
    typeof rawRedirect === "string"
      ? rawRedirect
      : Array.isArray(rawRedirect) && typeof rawRedirect[0] === "string"
        ? rawRedirect[0]
        : undefined;

  return (
    <>
      <Meta title={t("error.title")} />
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
          <h1 className="text-6xl sm:text-8xl font-black text-text dark:text-text-dark mb-6">
            {t("error.description")}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
            <FormattedMessage id={errorMessageId} values={messageValues} />
          </p>
          <Button
            onClick={() => router.push(safeRedirectPath(redirectFromQuery))}
          >
            {t("error.button.back")}
          </Button>
        </div>
      </Container>
    </>
  );
}
