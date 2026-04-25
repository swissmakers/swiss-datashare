import moment from "moment";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import useTranslate, {
  translateOutsideContext,
} from "../../../hooks/useTranslate.hook";
import { CompletedShare } from "../../../types/share.type";
import CopyTextField from "../CopyTextField";
import { Button } from "../../../components/ui";
import { ModalContextType } from "../../../contexts/ModalContext";
import useConfig from "../../../hooks/config.hook";
import useUser from "../../../hooks/user.hook";
import { getHomeEntryHref } from "../../../utils/homeEntryRoute.util";

const showCompletedUploadModal = (
  modals: ModalContextType,
  share: CompletedShare,
) => {
  const t = translateOutsideContext();
  return modals.openModal({
    closeOnClickOutside: false,
    showCloseButton: false,
    closeOnEscape: false,
    title: t("upload.modal.completed.share-ready"),
    children: <Body share={share} modals={modals} />,
  });
};

const Body = ({ share, modals }: { share: CompletedShare; modals: ModalContextType }) => {
  const router = useRouter();
  const config = useConfig();
  const { user } = useUser();
  const t = useTranslate();

  const isReverseShare = !!router.query["reverseShareToken"];

  const link = `${window.location.origin}/s/${share.id}`;

  return (
    <div className="space-y-4">
      {!isReverseShare && <CopyTextField link={link} />}
      {isReverseShare && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("upload.modal.completed.reverse-share-finished")}
        </p>
      )}
      {share.notifyReverseShareCreator === true && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("upload.modal.completed.notified-reverse-share-creator")}
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-500">
        {/* If our share.expiration is timestamp 0, show a different message */}
        {moment(share.expiration).unix() === 0
          ? t("upload.modal.completed.never-expires")
          : t("upload.modal.completed.expires-on", {
              expiration: moment(share.expiration).format("LLL"),
            })}
      </p>

      <Button
        onClick={() => {
          modals.closeAll();
          if (isReverseShare) {
            router.push(getHomeEntryHref(user, config.get));
          } else {
            router.push("/upload");
          }
        }}
        fullWidth
      >
        <FormattedMessage id="common.button.done" />
      </Button>
    </div>
  );
};

export default showCompletedUploadModal;
