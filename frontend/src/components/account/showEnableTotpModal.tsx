import { FormattedMessage } from "react-intl";
import * as yup from "yup";
import useTranslate, {
  translateOutsideContext,
} from "../../hooks/useTranslate.hook";
import authService from "../../services/auth.service";
import toast from "../../utils/toast.util";
import { Button, PinInput } from "../ui";
import { useForm } from "../../hooks/useForm";
import { ModalContextType } from "../../contexts/ModalContext";

const showEnableTotpModal = (
  modals: ModalContextType,
  refreshUser: () => {},
  options: {
    qrCode: string;
    secret: string;
    password: string;
  },
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    title: t("account.modal.totp.title"),
    size: "lg",
    children: (
      <CreateEnableTotpModal options={options} refreshUser={refreshUser} modals={modals} />
    ),
  });
};

const CreateEnableTotpModal = ({
  options,
  refreshUser,
  modals,
}: {
  options: {
    qrCode: string;
    secret: string;
    password: string;
  };
  refreshUser: () => {};
  modals: ModalContextType;
}) => {
  const t = useTranslate();

  const validationSchema = yup.object().shape({
    code: yup
      .string()
      .min(6)
      .max(6)
      .required()
      .matches(/^[0-9]+$/, { message: "Code must be a number" }),
  });

  const form = useForm({
    initialValues: {
      code: "",
    },
    validationSchema,
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      <p className="text-center">
        <FormattedMessage id="account.modal.totp.step1" />
      </p>
      <img src={options.qrCode} alt="QR Code" className="w-64 h-64" />

      <div className="text-center">
        <span>
          <FormattedMessage id="common.text.or" />
        </span>
      </div>

      <Button
        onClick={() => {
          navigator.clipboard.writeText(options.secret);
          toast.success(t("common.notify.copied"));
        }}
        variant="outline"
      >
        {options.secret}
      </Button>

      <p className="text-center">
        <FormattedMessage id="account.modal.totp.step2" />
      </p>

      <form
        onSubmit={form.onSubmit((values) => {
          authService
            .verifyTOTP(values.code, options.password)
            .then(() => {
              toast.success(t("account.notify.totp.enable"));
              modals.closeAll();
              refreshUser();
            })
            .catch(toast.axiosError);
        })}
        className="w-full space-y-4"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <PinInput
              length={6}
              value={form.values.code}
              onChange={(value) => form.setValue("code", value)}
              autoFocus
            />
          </div>
          <Button variant="outline" type="submit">
            <FormattedMessage id="account.modal.totp.verify" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default showEnableTotpModal;
