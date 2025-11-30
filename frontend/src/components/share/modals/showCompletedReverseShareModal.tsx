import { FormattedMessage } from "react-intl";
import { translateOutsideContext } from "../../../hooks/useTranslate.hook";
import CopyTextField from "../../upload/CopyTextField";
import { Button } from "../../../components/ui";
import { ModalContextType } from "../../../contexts/ModalContext";

const showCompletedReverseShareModal = (
  modals: ModalContextType,
  link: string,
  getReverseShares: () => void,
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    closeOnClickOutside: false,
    showCloseButton: false,
    closeOnEscape: false,
    title: t("account.reverseShares.modal.reverse-share-link"),
    children: <Body link={link} getReverseShares={getReverseShares} modals={modals} />,
  });
};

const Body = ({
  link,
  getReverseShares,
  modals,
}: {
  link: string;
  getReverseShares: () => void;
  modals: ModalContextType;
}) => {
  return (
    <div className="space-y-4">
      <CopyTextField link={link} />

      <Button
        onClick={() => {
          modals.closeAll();
          getReverseShares();
        }}
        fullWidth
      >
        <FormattedMessage id="common.button.done" />
      </Button>
    </div>
  );
};

export default showCompletedReverseShareModal;
