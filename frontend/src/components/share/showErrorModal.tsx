import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import { useModals } from "../../contexts/ModalContext";
import { Button } from "../ui";

const showErrorModal = (
  modals: ReturnType<typeof useModals>,
  title: string,
  text: string,
  action: "go-back" | "go-home" = "go-back",
) => {
  return modals.openModal({
    closeOnClickOutside: false,
    showCloseButton: false,
    closeOnEscape: false,
    title: title,
    children: <Body text={text} action={action} modals={modals} />,
  });
};

const Body = ({
  text,
  action,
  modals,
}: {
  text: string;
  action: "go-back" | "go-home";
  modals: ReturnType<typeof useModals>;
}) => {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
      <Button
        onClick={() => {
          modals.closeAll();
          if (action === "go-back") {
            router.back();
          } else if (action === "go-home") {
            router.push("/");
          }
        }}
        fullWidth
      >
        <FormattedMessage id={`common.button.${action}`} />
      </Button>
    </div>
  );
};

export default showErrorModal;
