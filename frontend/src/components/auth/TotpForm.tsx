import { useRouter } from "next/router";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate from "../../hooks/useTranslate.hook";
import useUser from "../../hooks/user.hook";
import authService from "../../services/auth.service";
import { safeRedirectPath } from "../../utils/router.util";
import toast from "../../utils/toast.util";
import { Button, Container, Card, PinInput } from "../ui";
import { useForm } from "../../hooks/useForm";

function TotpForm({ redirectPath }: { redirectPath: string }) {
  const t = useTranslate();
  const router = useRouter();
  const { refreshUser } = useUser();

  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    code: yup
      .string()
      .min(6, t("common.error.too-short", { length: 6 }))
      .required(t("common.error.field-required")),
  });

  const form = useForm({
    initialValues: {
      code: "",
    },
    validationSchema,
  });

  const onSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authService.signInTotp(
        form.values.code,
        router.query.loginToken as string,
      );
      await refreshUser();
      await router.replace(safeRedirectPath(redirectPath));
    } catch (e) {
      toast.axiosError(e);
      form.setErrors({ code: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm">
      <div className="max-w-md mx-auto py-10">
        <h2 className="text-3xl font-black text-center text-text dark:text-text-dark mb-8">
          <FormattedMessage id="totp.title" />
        </h2>
        <Card padding="lg">
          <form onSubmit={form.onSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <PinInput
                length={6}
                oneTimeCode
                aria-label="One time code"
                autoFocus={true}
                value={form.values.code}
                onChange={(value) => {
                  if (!value) return;
                  form.setValue("code", value);
                  if (value.length === 6) {
                    onSubmit();
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              loading={loading}
              fullWidth
              className="mt-4"
            >
              {t("totp.button.signIn")}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}

export default TotpForm;
