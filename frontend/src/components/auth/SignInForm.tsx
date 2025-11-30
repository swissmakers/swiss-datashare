import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useUser from "../../hooks/user.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import { getOAuthIcon, getOAuthUrl } from "../../utils/oauth.util";
import { safeRedirectPath } from "../../utils/router.util";
import toast from "../../utils/toast.util";
import { Button, Container, Input, PasswordInput, Card, LoadingSpinner } from "../ui";
import { useForm } from "../../hooks/useForm";
import { useToast } from "../../hooks/useToast";

const SignInForm = ({ redirectPath }: { redirectPath: string }) => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();
  const { info } = useToast();

  const [oauthProviders, setOauthProviders] = useState<string[] | null>(null);
  const [isRedirectingToOauthProvider, setIsRedirectingToOauthProvider] = useState(false);

  const validationSchema = yup.object().shape({
    emailOrUsername: yup.string().required(t("common.error.field-required")),
    password: yup.string().required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      emailOrUsername: "",
      password: "",
    },
    validationSchema,
  });

  const signIn = async (email: string, password: string) => {
    await authService
      .signIn(email.trim(), password.trim())
      .then(async (response) => {
        if (response.data["loginToken"]) {
          // Prompt the user to enter their totp code
          info(t("signIn.notify.totp-required.description"));
          router.push(
            `/auth/totp/${
              response.data["loginToken"]
            }?redirect=${encodeURIComponent(redirectPath)}`,
          );
        } else {
          await refreshUser();
          router.replace(safeRedirectPath(redirectPath));
        }
      })
      .catch(toast.axiosError);
  };

  useEffect(() => {
    authService
      .getAvailableOAuth()
      .then((providers) => {
        setOauthProviders(providers.data);
        if (
          providers.data.length === 1 &&
          config.get("oauth.disablePassword")
        ) {
          setIsRedirectingToOauthProvider(true);
          router.push(getOAuthUrl(window.location.origin, providers.data[0]));
        }
      })
      .catch(toast.axiosError);
  }, [config, router]);

  if (!oauthProviders) return null;

  if (isRedirectingToOauthProvider)
    return (
      <Container size="sm">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <p className="text-gray-700 dark:text-gray-300">
              <FormattedMessage id="common.text.redirecting" />
            </p>
          </div>
        </div>
      </Container>
    );

  return (
    <Container size="sm">
      <div className="max-w-md mx-auto py-10">
        <h2 className="text-3xl font-black text-center text-text dark:text-text-dark mb-2">
          <FormattedMessage id="signin.title" />
        </h2>
        {config.get("share.allowRegistration") && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
            <FormattedMessage id="signin.description" />{" "}
            <Link
              href="/auth/signUp"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              <FormattedMessage id="signin.button.signup" />
            </Link>
          </p>
        )}
        <Card padding="lg">
          {!config.get("oauth.disablePassword") && (
            <form
              onSubmit={form.onSubmit((values) => {
                signIn(values.emailOrUsername, values.password);
              })}
              className="space-y-4"
            >
              <Input
                label={t("signin.input.email-or-username")}
                placeholder={t("signin.input.email-or-username.placeholder")}
                autoComplete="username"
                {...form.getInputProps("emailOrUsername")}
              />
              <PasswordInput
                label={t("signin.input.password")}
                placeholder={t("signin.input.password.placeholder")}
                autoComplete="current-password"
                {...form.getInputProps("password")}
              />
              {config.get("smtp.enabled") && (
                <div className="flex justify-end">
                  <Link
                    href="/auth/resetPassword"
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <FormattedMessage id="resetPassword.title" />
                  </Link>
                </div>
              )}
              <Button fullWidth type="submit" className="mt-6">
                <FormattedMessage id="signin.button.submit" />
              </Button>
            </form>
          )}
          {oauthProviders.length > 0 && (
            <div className={config.get("oauth.disablePassword") ? "" : "mt-8"}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {config.get("oauth.disablePassword")
                      ? t("signIn.oauth.signInWith")
                      : t("signIn.oauth.or")}
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {oauthProviders.map((provider) => (
                  <Button
                    key={provider}
                    as={Link}
                    href={getOAuthUrl(window.location.origin, provider)}
                    variant="outline"
                    fullWidth
                    className="justify-center"
                  >
                    <span className="mr-2">{getOAuthIcon(provider)}</span>
                    {t(`signIn.oauth.${provider}`)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default SignInForm;
