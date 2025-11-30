import { translateOutsideContext } from "../../hooks/useTranslate.hook";
import { useModals } from "../../contexts/ModalContext";
import { Input } from "../ui";

const showShareLinkModal = (modals: ReturnType<typeof useModals>, shareId: string) => {
  const t = translateOutsideContext();
  const link = `${window.location.origin}/s/${shareId}`;
  return modals.openModal({
    title: t("account.shares.modal.share-link"),
    children: (
      <div className="space-y-4">
        <Input value={link} readOnly />
      </div>
    ),
  });
};

export default showShareLinkModal;
