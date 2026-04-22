import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbInfoCircle } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { getCookie } from "cookies-next";
import Meta from "../../../components/Meta";
import AdminConfigInput from "../../../components/admin/configuration/AdminConfigInput";
import ConfigurationHeader from "../../../components/admin/configuration/ConfigurationHeader";
import ConfigurationNavBar from "../../../components/admin/configuration/ConfigurationNavBar";
import LogoConfigInput from "../../../components/admin/configuration/LogoConfigInput";
import TestEmailButton from "../../../components/admin/configuration/TestEmailButton";
import CenterLoader from "../../../components/core/CenterLoader";
import useConfig from "../../../hooks/config.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import useUser from "../../../hooks/user.hook";
import configService from "../../../services/config.service";
import saasService from "../../../services/saas.service";
import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { ExemptUser, SaasPaymentHistoryResponse } from "../../../types/saas.type";
import { camelToKebab } from "../../../utils/string.util";
import toast from "../../../utils/toast.util";
import { Container, Alert, Button, Input, Table } from "../../../components/ui";
import clsx from "clsx";
import { LOCALES } from "../../../i18n/locales";
import { Select } from "../../../components/ui";

const LOCALIZABLE_EMAIL_KEYS = [
  "email.shareRecipientsSubject",
  "email.shareRecipientsMessage",
  "email.reverseShareSubject",
  "email.reverseShareMessage",
  "email.resetPasswordSubject",
  "email.resetPasswordMessage",
  "email.inviteSubject",
  "email.inviteMessage",
] as const;

const LOCALIZABLE_LEGAL_KEYS = [
  "legal.imprintText",
  "legal.imprintUrl",
  "legal.privacyPolicyText",
  "legal.privacyPolicyUrl",
] as const;

const EMAIL_KEY_TO_TRANSLATION: Record<string, string> = {
  "email.shareRecipientsSubject": "email.shareRecipientsSubject",
  "email.shareRecipientsMessage": "email.shareRecipientsMessage",
  "email.reverseShareSubject": "email.reverseShareSubject",
  "email.reverseShareMessage": "email.reverseShareMessage",
  "email.resetPasswordSubject": "email.resetPasswordSubject",
  "email.resetPasswordMessage": "email.resetPasswordMessage",
  "email.inviteSubject": "email.inviteSubject",
  "email.inviteMessage": "email.inviteMessage",
};

const parseLocalizedValue = (rawValue?: string) => {
  if (!rawValue) return { "en-US": "" };
  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed).reduce<Record<string, string>>(
        (acc, [locale, value]) => {
          if (typeof value === "string") acc[locale] = value;
          return acc;
        },
        {},
      );
    }
  } catch {
    // Legacy plain value: interpret as English override.
  }

  return { "en-US": rawValue };
};

const getLocalizedDisplayValue = (
  locale: string,
  localizedMap: Record<string, string>,
) => {
  const baseLanguage = locale.split("-")[0];
  if (localizedMap[locale] !== undefined) return localizedMap[locale];
  if (localizedMap[baseLanguage] !== undefined) return localizedMap[baseLanguage];
  if (locale.startsWith("en") && localizedMap["en-US"] !== undefined)
    return localizedMap["en-US"];
  if (locale.startsWith("en") && localizedMap.en !== undefined)
    return localizedMap.en;
  return "";
};

export default function AdminConfigPage() {
  const router = useRouter();
  const t = useTranslate();
  const { user } = useUser();

  const [isMobileNavBarOpened, setIsMobileNavBarOpened] = useState(false);
  const config = useConfig();

  const categoryId = (router.query.category as string | undefined) ?? "general";

  const [configVariables, setConfigVariables] = useState<AdminConfig[]>();
  const [updatedConfigVariables, setUpdatedConfigVariables] = useState<
    UpdateConfig[]
  >([]);
  const [selectedEmailLocale, setSelectedEmailLocale] = useState(
    getCookie("language")?.toString() ?? LOCALES.ENGLISH.code,
  );

  const [logo, setLogo] = useState<File | null>(null);
  const [isResettingEmailTranslations, setIsResettingEmailTranslations] =
    useState(false);
  const [isResettingLegalTranslations, setIsResettingLegalTranslations] =
    useState(false);

  const isEditingAllowed = (): boolean => {
    return !configVariables || configVariables[0].allowEdit;
  };

  const saveConfigVariables = async () => {
    if (logo) {
      configService
        .changeLogo(logo)
        .then(() => {
          setLogo(null);
          toast.success(t("admin.config.notify.logo-success"));
        })
        .catch(toast.axiosError);
    }

    if (updatedConfigVariables.length > 0) {
      await configService
        .updateMany(updatedConfigVariables)
        .then(() => {
          setUpdatedConfigVariables([]);
          toast.success(t("admin.config.notify.success"));
        })
        .catch(toast.axiosError);
      void config.refresh();
    } else {
      toast.success(t("admin.config.notify.no-changes"));
    }
  };

  const updateConfigVariable = (configVariable: UpdateConfig) => {
    if (configVariable.key === "general.appUrl") {
      configVariable.value = sanitizeUrl(configVariable.value);
    }

    const index = updatedConfigVariables.findIndex(
      (item) => item.key === configVariable.key,
    );

    if (index > -1) {
      const next = [...updatedConfigVariables];
      next[index] = {
        ...next[index],
        ...configVariable,
      };
      setUpdatedConfigVariables(next);
    } else {
      setUpdatedConfigVariables([...updatedConfigVariables, configVariable]);
    }
  };

  const sanitizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
  };

  const getConfigValue = (key: string, fallback: string) => {
    const updated = updatedConfigVariables.find((item) => item.key === key);
    return updated?.value ?? fallback;
  };

  const renderConfigBlock = (configVariable: AdminConfig) => (
    <div
      key={configVariable.key}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
    >
      <div className="flex-1 sm:max-w-[40%]">
        <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">
          <FormattedMessage
            id={`admin.config.${camelToKebab(configVariable.key)}`}
          />
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
          <FormattedMessage
            id={`admin.config.${camelToKebab(configVariable.key)}.description`}
            values={{ br: <br /> }}
          />
        </p>
      </div>
      <div className="w-full sm:w-[50%]">
        <AdminConfigInput
          key={configVariable.key}
          configVariable={configVariable}
          updateConfigVariable={updateConfigVariable}
        />
      </div>
    </div>
  );

  const renderLocalizedConfigBlock = (configVariable: AdminConfig) => {
    const rawValue = getConfigValue(
      configVariable.key,
      configVariable.value ?? configVariable.defaultValue,
    );
    const localizedMap = parseLocalizedValue(rawValue);
    const currentValue = getLocalizedDisplayValue(
      selectedEmailLocale,
      localizedMap,
    );
    const translationKey =
      EMAIL_KEY_TO_TRANSLATION[configVariable.key] ?? configVariable.key;

    return (
      <div
        key={configVariable.key}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
      >
        <div className="flex-1 sm:max-w-[40%]">
          <h3 className="text-base font-semibold text-text dark:text-text-dark mb-1">
            <FormattedMessage id={`admin.config.${camelToKebab(translationKey)}`} />
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
            <FormattedMessage
              id={`admin.config.${camelToKebab(translationKey)}.description`}
              values={{ br: <br /> }}
            />
          </p>
        </div>
        <div className="w-full sm:w-[50%]">
          {configVariable.type === "text" ? (
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              disabled={!configVariable.allowEdit}
              rows={5}
              value={currentValue}
              onChange={(event) => {
                const nextMap = {
                  ...localizedMap,
                  [selectedEmailLocale]: event.target.value,
                };
                updateConfigVariable({
                  key: configVariable.key,
                  value: JSON.stringify(nextMap),
                });
              }}
            />
          ) : (
            <Input
              className="w-full"
              disabled={!configVariable.allowEdit}
              value={currentValue}
              onChange={(event) => {
                const nextMap = {
                  ...localizedMap,
                  [selectedEmailLocale]: event.target.value,
                };
                updateConfigVariable({
                  key: configVariable.key,
                  value: JSON.stringify(nextMap),
                });
              }}
            />
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    configService.getByCategory(categoryId).then((configVariables) => {
      setConfigVariables(configVariables);
    });
  }, [categoryId]);

  useEffect(() => {
    if (user?.locale) setSelectedEmailLocale(user.locale);
  }, [user?.locale]);

  const resetEmailTranslationsToDefault = async () => {
    const shouldReset = window.confirm(
      "Reset all email translations to default templates for every language?",
    );
    if (!shouldReset) return;

    setIsResettingEmailTranslations(true);
    await configService
      .resetEmailTranslations()
      .then(async () => {
        setUpdatedConfigVariables([]);
        const reloadedConfig = await configService.getByCategory(categoryId);
        setConfigVariables(reloadedConfig);
        toast.success("Email translations reset to defaults");
      })
      .catch(toast.axiosError)
      .finally(() => setIsResettingEmailTranslations(false));
  };

  const resetLegalTranslationsToDefault = async () => {
    const shouldReset = window.confirm(
      "Reset all legal translations to default Switzerland templates for every language?",
    );
    if (!shouldReset) return;

    setIsResettingLegalTranslations(true);
    await configService
      .resetLegalTranslations()
      .then(async () => {
        setUpdatedConfigVariables([]);
        const reloadedConfig = await configService.getByCategory(categoryId);
        setConfigVariables(reloadedConfig);
        toast.success("Legal translations reset to defaults");
      })
      .catch(toast.axiosError)
      .finally(() => setIsResettingLegalTranslations(false));
  };

  return (
    <>
      <Meta title={t("admin.config.title")} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ConfigurationHeader
          isMobileNavBarOpened={isMobileNavBarOpened}
          setIsMobileNavBarOpened={setIsMobileNavBarOpened}
        />
        <ConfigurationNavBar
          categoryId={categoryId}
          isMobileNavBarOpened={isMobileNavBarOpened}
          setIsMobileNavBarOpened={setIsMobileNavBarOpened}
        />
        <main
          className={clsx(
            "transition-all",
            "sm:ml-64 lg:ml-80"
          )}
        >
          <Container size="lg" className="py-8">
            {!configVariables ? (
              <CenterLoader />
            ) : (
              <>
                <div className="space-y-6">
                  {!isEditingAllowed() && (
                    <Alert
                      color="blue"
                      title={t("admin.config.config-file-warning.title")}
                      icon={<TbInfoCircle size={16} />}
                      className="mb-6"
                    >
                      <FormattedMessage id="admin.config.config-file-warning.description" />
                    </Alert>
                  )}
                  <h2 className="page-title mb-6">
                    {t("admin.config.category." + categoryId)}
                  </h2>
                  {(categoryId === "email" || categoryId === "legal") && (
                    <div className="pb-2">
                      <Select
                        label={t("account.card.language.title")}
                        value={selectedEmailLocale}
                        options={Object.values(LOCALES).map((locale) => ({
                          value: locale.code,
                          label: locale.name,
                        }))}
                        onChange={(event) => {
                          if (!event) return;
                          setSelectedEmailLocale(event.target.value);
                        }}
                      />
                    </div>
                  )}
                  {configVariables.map((configVariable) => {
                    if (
                      categoryId === "email" &&
                      LOCALIZABLE_EMAIL_KEYS.includes(
                        configVariable.key as (typeof LOCALIZABLE_EMAIL_KEYS)[number],
                      )
                    ) {
                      return renderLocalizedConfigBlock(configVariable);
                    }
                    if (
                      categoryId === "legal" &&
                      LOCALIZABLE_LEGAL_KEYS.includes(
                        configVariable.key as (typeof LOCALIZABLE_LEGAL_KEYS)[number],
                      )
                    ) {
                      return renderLocalizedConfigBlock(configVariable);
                    }
                    return renderConfigBlock(configVariable);
                  })}
                  {categoryId == "general" && (
                    <div className="py-4 border-b border-gray-200 dark:border-gray-700">
                      <LogoConfigInput logo={logo} setLogo={setLogo} />
                    </div>
                  )}
                  {categoryId == "saas" && <SaasAdminPanel />}
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  {categoryId == "email" && (
                    <Button
                      variant="danger"
                      onClick={resetEmailTranslationsToDefault}
                      loading={isResettingEmailTranslations}
                    >
                      Reset translations to default
                    </Button>
                  )}
                  {categoryId == "legal" && (
                    <Button
                      variant="danger"
                      onClick={resetLegalTranslationsToDefault}
                      loading={isResettingLegalTranslations}
                    >
                      Reset legal translations to default
                    </Button>
                  )}
                  {categoryId == "smtp" && (
                    <TestEmailButton
                      configVariablesChanged={updatedConfigVariables.length != 0}
                      saveConfigVariables={saveConfigVariables}
                    />
                  )}
                  <Button onClick={saveConfigVariables}>
                    <FormattedMessage id="common.button.save" />
                  </Button>
                </div>
              </>
            )}
          </Container>
        </main>
      </div>
    </>
  );
}

const SaasAdminPanel = () => {
  const t = useTranslate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ExemptUser[]>([]);
  const [payments, setPayments] = useState<SaasPaymentHistoryResponse | null>(null);

  const load = () => {
    saasService
      .getExemptUsers(search)
      .then(setUsers)
      .catch(toast.axiosError);
    saasService.getPayments().then(setPayments).catch(toast.axiosError);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="pt-6 space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-text dark:text-text-dark">
          <FormattedMessage id="admin.config.saas.exempt-users.title" />
        </h3>
        <div className="flex gap-3 mb-4">
          <Input
            value={search}
            placeholder={t("admin.config.saas.exempt-users.search")}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" onClick={load}>
            <FormattedMessage id="common.button.submit" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Cell header>
                  <FormattedMessage id="admin.users.table.username" />
                </Table.Cell>
                <Table.Cell header>
                  <FormattedMessage id="admin.users.table.email" />
                </Table.Cell>
                <Table.Cell header>
                  <FormattedMessage id="admin.users.table.admin" />
                </Table.Cell>
                <Table.Cell header>
                  <FormattedMessage id="admin.config.saas.exempt-users.exempt" />
                </Table.Cell>
                <Table.Cell header></Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>{user.isAdmin ? "Yes" : "No"}</Table.Cell>
                  <Table.Cell>{user.billingExempt ? "Yes" : "No"}</Table.Cell>
                  <Table.Cell>
                    {!user.isAdmin && (
                      <Button
                        variant={user.billingExempt ? "outline" : "primary"}
                        onClick={async () => {
                          if (user.billingExempt) {
                            await saasService.removeExemptUser(user.id);
                          } else {
                            await saasService.addExemptUser(user.id);
                          }
                          load();
                        }}
                      >
                        {user.billingExempt
                          ? t("admin.config.saas.exempt-users.remove")
                          : t("admin.config.saas.exempt-users.add")}
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-text dark:text-text-dark">
          <FormattedMessage id="admin.config.saas.payments.title" />
        </h3>
        {payments && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="admin.config.saas.payments.month" />
              </p>
              <p className="text-lg font-semibold">
                CHF {(payments.totals.monthChfCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="admin.config.saas.payments.year" />
              </p>
              <p className="text-lg font-semibold">
                CHF {(payments.totals.yearChfCents / 100).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <FormattedMessage id="admin.config.saas.payments.all-time" />
              </p>
              <p className="text-lg font-semibold">
                CHF {(payments.totals.allTimeChfCents / 100).toFixed(2)}
              </p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Cell header>
                  <FormattedMessage id="admin.users.table.username" />
                </Table.Cell>
                <Table.Cell header>
                  <FormattedMessage id="admin.config.saas.payments.amount" />
                </Table.Cell>
                <Table.Cell header>
                  <FormattedMessage id="admin.config.saas.payments.status" />
                </Table.Cell>
                <Table.Cell header>
                  <FormattedMessage id="account.shares.table.createdAt" />
                </Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {(payments?.history || []).map((payment) => (
                <Table.Row key={payment.id}>
                  <Table.Cell>{payment.user.username}</Table.Cell>
                  <Table.Cell>CHF {(payment.amountChfCents / 100).toFixed(2)}</Table.Cell>
                  <Table.Cell>{payment.status}</Table.Cell>
                  <Table.Cell>
                    {new Date(payment.createdAt).toLocaleString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};
