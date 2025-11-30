import { useState } from "react";
import { FormattedMessage } from "react-intl";
import useUser from "../../../hooks/user.hook";
import configService from "../../../services/config.service";
import toast from "../../../utils/toast.util";
import { Button, Textarea } from "../../ui";
import { useModals } from "../../../contexts/ModalContext";

const TestEmailButton = ({
  configVariablesChanged,
  saveConfigVariables,
}: {
  configVariablesChanged: boolean;
  saveConfigVariables: () => Promise<void>;
}) => {
  const { user } = useUser();
  const modals = useModals();

  const [isLoading, setIsLoading] = useState(false);

  const sendTestEmail = async () => {
    await configService
      .sendTestEmail(user!.email)
      .then(() => toast.success("Email sent successfully"))
      .catch((e) => {
        modals.openModal({
          title: "Failed to send email",
          children: (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                While sending the test email, the following error occurred:
              </p>
              <Textarea
                readOnly
                value={e.response?.data?.message || e.message || "Unknown error"}
                rows={4}
                className="font-mono text-xs"
              />
            </div>
          ),
        });
      });
  };

  return (
    <Button
      loading={isLoading}
      variant="outline"
      onClick={async () => {
        if (!configVariablesChanged) {
          setIsLoading(true);
          await sendTestEmail();
          setIsLoading(false);
        } else {
          modals.openConfirmModal({
            title: "Save configuration",
            children: (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                To continue you need to save the configuration first. Do you
                want to save the configuration and send the test email?
              </p>
            ),
            labels: { confirm: "Save and send", cancel: "Cancel" },
            onConfirm: async () => {
              setIsLoading(true);
              await saveConfigVariables();
              await sendTestEmail();
              setIsLoading(false);
            },
          });
        }
      }}
    >
      <FormattedMessage id="admin.config.smtp.button.test" />
    </Button>
  );
};
export default TestEmailButton;
