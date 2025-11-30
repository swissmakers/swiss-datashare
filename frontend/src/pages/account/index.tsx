import { useEffect, useState } from "react";
import { TbAuth2Fa } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import Meta from "../../components/Meta";
import LanguagePicker from "../../components/account/LanguagePicker";
import ThemeSwitcher from "../../components/account/ThemeSwitcher";
import showEnableTotpModal from "../../components/account/showEnableTotpModal";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import userService from "../../services/user.service";
import { getOAuthIcon, getOAuthUrl, unlinkOAuth } from "../../utils/oauth.util";
import toast from "../../utils/toast.util";
import { Button, Container, Input, PasswordInput, Card, Badge, Tabs } from "../../components/ui";
import { useForm } from "../../hooks/useForm";
import { useModals } from "../../contexts/ModalContext";

const Account = () => {
  const [oauth, setOAuth] = useState<string[]>([]);
  const [oauthStatus, setOAuthStatus] = useState<Record<
    string,
    {
      provider: string;
      providerUsername: string;
    }
  > | null>(null);

  const { user, refreshUser } = useUser();
  const modals = useModals();
  const t = useTranslate();

  const accountValidationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 })),
  });

  const accountForm = useForm({
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
    validationSchema: accountValidationSchema,
  });

  useEffect(() => {
    if (user) {
      accountForm.setValues({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const passwordValidationSchema = yup.object().shape({
    oldPassword: yup.string().when([], {
      is: () => !!user?.hasPassword,
      then: (schema) =>
        schema
          .min(8, t("common.error.too-short", { length: 8 }))
          .required(t("common.error.field-required")),
      otherwise: (schema) => schema.notRequired(),
    }),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const passwordForm = useForm({
    initialValues: {
      oldPassword: "",
      password: "",
    },
    validationSchema: passwordValidationSchema,
  });

  const enableTotpValidationSchema = yup.object().shape({
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const enableTotpForm = useForm({
    initialValues: {
      password: "",
    },
    validationSchema: enableTotpValidationSchema,
  });

  const disableTotpValidationSchema = yup.object().shape({
    password: yup.string().min(8),
    code: yup
      .string()
      .min(6, t("common.error.exact-length", { length: 6 }))
      .max(6, t("common.error.exact-length", { length: 6 }))
      .matches(/^[0-9]+$/, { message: t("common.error.invalid-number") }),
  });

  const disableTotpForm = useForm({
    initialValues: {
      password: "",
      code: "",
    },
    validationSchema: disableTotpValidationSchema,
  });

  const refreshOAuthStatus = () => {
    authService
      .getOAuthStatus()
      .then((data) => {
        setOAuthStatus(data.data);
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((data) => {
        setOAuth(data.data);
      })
      .catch(toast.axiosError);
    refreshOAuthStatus();
  }, []);

  return (
    <>
      <Meta title={t("account.title")} />
      <Container size="sm">
        <h2 className="text-2xl font-bold mb-6 text-text dark:text-text-dark">
          <FormattedMessage id="account.title" />
        </h2>
        
        <Card padding="lg" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-text dark:text-text-dark">
              <FormattedMessage id="account.card.info.title" />
            </h3>
            {user?.isLdap && (
              <Badge variant="secondary">LDAP</Badge>
            )}
          </div>
          <form
            onSubmit={accountForm.onSubmit((values) =>
              userService
                .updateCurrentUser({
                  username: values.username,
                  email: values.email,
                })
                .then(() => toast.success(t("account.notify.info.success")))
                .catch(toast.axiosError),
            )}
            className="space-y-4"
          >
            <Input
              label={t("account.card.info.username")}
              disabled={user?.isLdap}
              {...accountForm.getInputProps("username")}
            />
            <Input
              label={t("account.card.info.email")}
              type="email"
              disabled={user?.isLdap}
              {...accountForm.getInputProps("email")}
            />
            {!user?.isLdap && (
              <div className="flex justify-end">
                <Button type="submit">
                  <FormattedMessage id="common.button.save" />
                </Button>
              </div>
            )}
          </form>
        </Card>

        {!user?.isLdap && (
          <Card padding="lg" className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">
              <FormattedMessage id="account.card.password.title" />
            </h3>
            <form
              onSubmit={passwordForm.onSubmit((values) =>
                authService
                  .updatePassword(values.oldPassword, values.password)
                  .then(async () => {
                    refreshUser();
                    toast.success(t("account.notify.password.success"));
                    passwordForm.reset();
                  })
                  .catch(toast.axiosError),
              )}
              className="space-y-4"
            >
              {user?.hasPassword ? (
                <PasswordInput
                  label={t("account.card.password.old")}
                  {...passwordForm.getInputProps("oldPassword")}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <FormattedMessage id="account.card.password.noPasswordSet" />
                </p>
              )}
              <PasswordInput
                label={t("account.card.password.new")}
                {...passwordForm.getInputProps("password")}
              />
              <div className="flex justify-end">
                <Button type="submit">
                  <FormattedMessage id="common.button.save" />
                </Button>
              </div>
            </form>
          </Card>
        )}

        {oauth.length > 0 && (
          <Card padding="lg" className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">
              <FormattedMessage id="account.card.oauth.title" />
            </h3>
            <Tabs defaultValue={oauth[0] || ""}>
              <Tabs.List>
                {oauth.map((provider) => (
                  <Tabs.Tab
                    value={provider}
                    icon={getOAuthIcon(provider)}
                    key={provider}
                  >
                    {t(`account.card.oauth.${provider}`)}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {oauth.map((provider) => (
                <Tabs.Panel value={provider} key={provider}>
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      {oauthStatus?.[provider]
                        ? oauthStatus[provider].providerUsername
                        : t("account.card.oauth.unlinked")}
                    </p>
                    {oauthStatus?.[provider] ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          modals.openConfirmModal({
                            title: t("account.modal.unlink.title"),
                            children: (
                              <p>
                                {t("account.modal.unlink.description")}
                              </p>
                            ),
                            labels: {
                              confirm: t("account.card.oauth.unlink"),
                              cancel: t("common.button.cancel"),
                            },
                            confirmProps: { variant: "danger" },
                            onConfirm: () => {
                              unlinkOAuth(provider)
                                .then(() => {
                                  toast.success(
                                    t("account.notify.oauth.unlinked.success"),
                                  );
                                  refreshOAuthStatus();
                                })
                                .catch(toast.axiosError);
                            },
                          });
                        }}
                      >
                        {t("account.card.oauth.unlink")}
                      </Button>
                    ) : (
                      <a
                        href={getOAuthUrl(window.location.origin, provider)}
                        className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700 px-4 py-2 text-base"
                      >
                        {t("account.card.oauth.link")}
                      </a>
                    )}
                  </div>
                </Tabs.Panel>
              ))}
            </Tabs>
          </Card>
        )}

        <Card padding="lg" className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">
            <FormattedMessage id="account.card.security.title" />
          </h3>
          <Tabs defaultValue="totp">
            <Tabs.List>
              <Tabs.Tab value="totp" icon={<TbAuth2Fa size={14} />}>
                TOTP
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="totp">
              {user?.totpVerified ? (
                <form
                  onSubmit={disableTotpForm.onSubmit((values) => {
                    authService
                      .disableTOTP(values.code, values.password)
                      .then(() => {
                        toast.success(t("account.notify.totp.disable"));
                        disableTotpForm.reset();
                        refreshUser();
                      })
                      .catch(toast.axiosError);
                  })}
                  className="space-y-4 pt-4"
                >
                  <PasswordInput
                    label={t("account.card.password.title")}
                    helperText={t("account.card.security.totp.disable.description")}
                    {...disableTotpForm.getInputProps("password")}
                  />
                  <Input
                    label={t("account.modal.totp.code")}
                    placeholder="******"
                    maxLength={6}
                    {...disableTotpForm.getInputProps("code")}
                  />
                  <div className="flex justify-end">
                    <Button variant="danger" type="submit">
                      <FormattedMessage id="common.button.disable" />
                    </Button>
                  </div>
                </form>
              ) : (
                <form
                  onSubmit={enableTotpForm.onSubmit((values) => {
                    authService
                      .enableTOTP(values.password)
                      .then((result) => {
                        showEnableTotpModal(modals, refreshUser, {
                          qrCode: result.qrCode,
                          secret: result.totpSecret,
                          password: values.password,
                        });
                        enableTotpForm.reset();
                      })
                      .catch(toast.axiosError);
                  })}
                  className="space-y-4 pt-4"
                >
                  <PasswordInput
                    label={t("account.card.password.title")}
                    helperText={t("account.card.security.totp.enable.description")}
                    {...enableTotpForm.getInputProps("password")}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">
                      <FormattedMessage id="account.card.security.totp.button.start" />
                    </Button>
                  </div>
                </form>
              )}
            </Tabs.Panel>
          </Tabs>
        </Card>

        <Card padding="lg" className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">
            <FormattedMessage id="account.card.language.title" />
          </h3>
          <LanguagePicker />
        </Card>

        <Card padding="lg" className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-text dark:text-text-dark">
            <FormattedMessage id="account.card.color.title" />
          </h3>
          <ThemeSwitcher />
        </Card>

        <div className="flex justify-center mt-20 mb-6">
          <Button
            variant="outline"
            onClick={() =>
              modals.openConfirmModal({
                title: t("account.modal.delete.title"),
                children: (
                  <p className="text-sm">
                    <FormattedMessage id="account.modal.delete.description" />
                  </p>
                ),
                labels: {
                  confirm: t("common.button.delete"),
                  cancel: t("common.button.cancel"),
                },
                confirmProps: { variant: "danger" },
                onConfirm: async () => {
                  await userService
                    .removeCurrentUser()
                    .then(() => window.location.reload())
                    .catch(toast.axiosError);
                },
              })
            }
          >
            <FormattedMessage id="account.button.delete" />
          </Button>
        </div>
      </Container>
    </>
  );
};

export default Account;
