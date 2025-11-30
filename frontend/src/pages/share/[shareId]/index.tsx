import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import Meta from "../../../components/Meta";
import DownloadAllButton from "../../../components/share/DownloadAllButton";
import FileList from "../../../components/share/FileList";
import showEnterPasswordModal from "../../../components/share/showEnterPasswordModal";
import showErrorModal from "../../../components/share/showErrorModal";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Share as ShareType } from "../../../types/share.type";
import toast from "../../../utils/toast.util";
import { byteToHumanSizeString } from "../../../utils/fileSize.util";
import { Container } from "../../../components/ui";
import { useModals } from "../../../contexts/ModalContext";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { shareId: context.params!.shareId },
  };
}

const Share = ({ shareId }: { shareId: string }) => {
  const modals = useModals();
  const [share, setShare] = useState<ShareType>();
  const t = useTranslate();

  const getShareToken = async (password?: string) => {
    await shareService
      .getShareToken(shareId, password)
      .then(() => {
        modals.closeAll();
        getFiles();
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (error == "share_max_views_exceeded") {
          showErrorModal(
            modals,
            t("share.error.visitor-limit-exceeded.title"),
            t("share.error.visitor-limit-exceeded.description"),
            "go-home",
          );
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else {
          toast.axiosError(e);
        }
      });
  };

  const getFiles = async () => {
    shareService
      .get(shareId)
      .then((share) => {
        setShare(share);
      })
      .catch((e) => {
        const { error } = e.response.data;
        if (e.response.status == 404) {
          if (error == "share_removed") {
            showErrorModal(
              modals,
              t("share.error.removed.title"),
              e.response.data.message,
              "go-home",
            );
          } else {
            showErrorModal(
              modals,
              t("share.error.not-found.title"),
              t("share.error.not-found.description"),
              "go-home",
            );
          }
        } else if (e.response.status == 403 && error == "private_share") {
          showErrorModal(
            modals,
            t("share.error.access-denied.title"),
            t("share.error.access-denied.description"),
          );
        } else if (error == "share_password_required") {
          showEnterPasswordModal(modals, getShareToken);
        } else if (error == "share_token_required") {
          getShareToken();
        } else {
          showErrorModal(
            modals,
            t("common.error"),
            t("common.error.unknown"),
            "go-home",
          );
        }
      });
  };

  useEffect(() => {
    getFiles();
  }, []);

  return (
    <>
      <Meta
        title={t("share.title", { shareId: share?.name || shareId })}
        description={t("share.description")}
      />
      <Container>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 max-w-[70%]">
            <h1 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
              {share?.name || share?.id}
            </h1>
            {share?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {share.description}
              </p>
            )}
            {share?.files?.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                <FormattedMessage
                  id="share.fileCount"
                  values={{
                    count: share?.files?.length || 0,
                    size: byteToHumanSizeString(
                      share?.files?.reduce(
                        (total: number, file: { size: string }) =>
                          total + parseInt(file.size),
                        0,
                      ) || 0,
                    ),
                  }}
                />
              </p>
            )}
          </div>

          {share?.files.length > 1 && (
            <DownloadAllButton shareId={shareId} />
          )}
        </div>

        <FileList
          files={share?.files}
          setShare={setShare}
          share={share!}
          isLoading={!share}
        />
      </Container>
    </>
  );
};

export default Share;
