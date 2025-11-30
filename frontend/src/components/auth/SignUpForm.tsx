import Link from "next/link";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";
import { Button, Container, Input, PasswordInput, Card } from "../ui";
import { useForm } from "../../hooks/useForm";

const SignUpForm = () => {
  const config = useConfig();
  const router = useRouter();
  const t = useTranslate();
  const { refreshUser } = useUser();

  const validationSchema = yup.object().shape({
    email: yup.string().email(t("common.error.invalid-email")).required(),
    username: yup
      .string()
      .min(3, t("common.error.too-short", { length: 3 }))
      .required(t("common.error.field-required")),
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      email: "",
      username: "",
      password: "",
    },
    validationSchema,
  });

  const signUp = async (email: string, username: string, password: string) => {
    await authService
      .signUp(email.trim(), username.trim(), password.trim())
      .then(async () => {
        const user = await refreshUser();
        if (user?.isAdmin) {
          router.replace("/admin/intro");
        } else {
          router.replace("/upload");
        }
      })
      .catch(toast.axiosError);
  };

  return (
    <Container size="sm">
      <div className="max-w-md mx-auto py-10">
        <h2 className="text-3xl font-black text-center text-text dark:text-text-dark mb-2">
          <FormattedMessage id="signup.title" />
        </h2>
        {config.get("share.allowRegistration") && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
            <FormattedMessage id="signup.description" />{" "}
            <Link
              href="/auth/signIn"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
            >
              <FormattedMessage id="signup.button.signin" />
            </Link>
          </p>
        )}
        <Card padding="lg">
          <form
            onSubmit={form.onSubmit((values) =>
              signUp(values.email, values.username, values.password),
            )}
            className="space-y-4"
          >
            <Input
              label={t("signup.input.username")}
              placeholder={t("signup.input.username.placeholder")}
              autoComplete="username"
              {...form.getInputProps("username")}
            />
            <Input
              label={t("signup.input.email")}
              placeholder={t("signup.input.email.placeholder")}
              type="email"
              autoComplete="email"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label={t("signin.input.password")}
              placeholder={t("signin.input.password.placeholder")}
              autoComplete="new-password"
              {...form.getInputProps("password")}
            />
            <Button fullWidth type="submit" className="mt-6">
              <FormattedMessage id="signup.button.submit" />
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
};

export default SignUpForm;
