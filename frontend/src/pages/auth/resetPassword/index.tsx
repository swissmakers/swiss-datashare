import Link from "next/link";
import { useRouter } from "next/router";
import { TbArrowLeft } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate from "../../../hooks/useTranslate.hook";
import authService from "../../../services/auth.service";
import toast from "../../../utils/toast.util";
import { Button, Container, Input, Card } from "../../../components/ui";
import { useForm } from "../../../hooks/useForm";

const ResetPassword = () => {
  const router = useRouter();
  const t = useTranslate();

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email(t("common.error.invalid-email"))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      email: "",
    },
    validationSchema,
  });

  return (
    <Container size="sm">
      <div className="max-w-md mx-auto py-10">
        <h2 className="text-3xl font-black text-center text-text dark:text-text-dark mb-2">
          <FormattedMessage id="resetPassword.title" />
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
          <FormattedMessage id="resetPassword.description" />
        </p>

        <Card padding="lg">
          <form
            onSubmit={form.onSubmit((values) =>
              authService
                .requestResetPassword(values.email)
                .then(() => {
                  toast.success(t("resetPassword.notify.success"));
                  router.push("/auth/signIn");
                })
                .catch(toast.axiosError),
            )}
            className="space-y-4"
          >
            <Input
              label={t("signup.input.email")}
              placeholder={t("signup.input.email.placeholder")}
              type="email"
              {...form.getInputProps("email")}
            />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <Link
                href="/auth/signIn"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <TbArrowLeft className="mr-1" size={16} />
                <FormattedMessage id="resetPassword.button.back" />
              </Link>
              <Button type="submit" className="w-full sm:w-auto">
                <FormattedMessage id="resetPassword.text.resetPassword" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
};

export default ResetPassword;
