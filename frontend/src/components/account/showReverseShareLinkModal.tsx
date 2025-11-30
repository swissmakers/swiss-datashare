import { translateOutsideContext } from "../../hooks/useTranslate.hook";
import { useModals } from "../../contexts/ModalContext";
import { Input } from "../ui";

const showReverseShareLinkModal = (
  modals: ReturnType<typeof useModals>,
  reverseShareToken: string,
) => {
  const t = translateOutsideContext();
  const link = `${window.location.origin}/upload/${reverseShareToken}`;
  return modals.openModal({
    title: t("account.reverseShares.modal.reverse-share-link"),
    children: (
      <div className="space-y-4">
        <Input value={link} readOnly />
      </div>
    ),
  });
};

export default showReverseShareLinkModal;
