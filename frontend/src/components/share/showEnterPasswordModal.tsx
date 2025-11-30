import { useState } from "react";
import { FormattedMessage } from "react-intl";
import useTranslate, {
  translateOutsideContext,
} from "../../hooks/useTranslate.hook";
import { useModals } from "../../contexts/ModalContext";
import { Button, PasswordInput } from "../ui";

const showEnterPasswordModal = (
  modals: ReturnType<typeof useModals>,
  submitCallback: (password: string) => Promise<void>,
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    closeOnClickOutside: false,
    showCloseButton: false,
    closeOnEscape: false,
    title: t("share.modal.password.title"),
    children: <Body submitCallback={submitCallback} />,
  });
};

const Body = ({
  submitCallback,
}: {
  submitCallback: (password: string) => Promise<void>;
}) => {
  const [password, setPassword] = useState("");
  const [passwordWrong, setPasswordWrong] = useState(false);
  const t = useTranslate();
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <FormattedMessage id="share.modal.password.description" />
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCallback(password).catch(() => {
            setPasswordWrong(true);
          });
        }}
        className="space-y-4"
      >
        <PasswordInput
          placeholder={t("share.modal.password")}
          error={passwordWrong ? t("share.modal.error.invalid-password") : undefined}
          onFocus={() => setPasswordWrong(false)}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          autoFocus
        />
        <Button type="submit" fullWidth>
          <FormattedMessage id="common.button.submit" />
        </Button>
      </form>
    </div>
  );
};

export default showEnterPasswordModal;
