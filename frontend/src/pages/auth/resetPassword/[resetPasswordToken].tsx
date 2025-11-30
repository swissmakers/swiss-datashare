import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate from "../../../hooks/useTranslate.hook";
import authService from "../../../services/auth.service";
import toast from "../../../utils/toast.util";
import { Button, Container, PasswordInput, Card } from "../../../components/ui";
import { useForm } from "../../../hooks/useForm";

const ResetPassword = () => {
  const router = useRouter();
  const t = useTranslate();

  const validationSchema = yup.object().shape({
    password: yup
      .string()
      .min(8, t("common.error.too-short", { length: 8 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      password: "",
    },
    validationSchema,
  });

  const resetPasswordToken = router.query.resetPasswordToken as string;

  return (
    <Container size="sm">
      <div className="max-w-md mx-auto py-10">
        <h2 className="text-3xl font-black text-center text-text dark:text-text-dark mb-2">
          <FormattedMessage id="resetPassword.text.resetPassword" />
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
          <FormattedMessage id="resetPassword.text.enterNewPassword" />
        </p>

        <Card padding="lg">
          <form
            onSubmit={form.onSubmit((values) => {
              authService
                .resetPassword(resetPasswordToken, values.password)
                .then(() => {
                  toast.success(t("resetPassword.notify.passwordReset"));
                  router.push("/auth/signIn");
                })
                .catch(toast.axiosError);
            })}
            className="space-y-4"
          >
            <PasswordInput
              label={t("resetPassword.input.password")}
              placeholder="••••••••••"
              {...form.getInputProps("password")}
            />
            <div className="flex justify-end mt-6">
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
