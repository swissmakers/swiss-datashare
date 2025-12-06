import { GetServerSidePropsContext } from "next";
import { useEffect, useRef, useState } from "react";
import Meta from "../../../components/Meta";
import showErrorModal from "../../../components/share/showErrorModal";
import EditableUpload from "../../../components/upload/EditableUpload";
import useConfirmLeave from "../../../hooks/confirm-leave.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import shareService from "../../../services/share.service";
import { Share as ShareType } from "../../../types/share.type";
import { useModals } from "../../../contexts/ModalContext";
import { LoadingSpinner } from "../../../components/ui";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { shareId: context.params!.shareId },
  };
}

const Share = ({ shareId }: { shareId: string }) => {
  const t = useTranslate();
  const modals = useModals();

  const [isLoading, setIsLoading] = useState(true);
  const [share, setShare] = useState<ShareType>();
  const loadingRef = useRef(false);

  useConfirmLeave({
    message: t("upload.notify.confirm-leave"),
    enabled: isLoading,
  });

  const loadShare = async (retryCount = 0) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log(`[ShareEdit] Already loading share, skipping...`);
      return;
    }
    
    loadingRef.current = true;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    try {
      console.log(`[ShareEdit] Loading share ${shareId} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      const share = await shareService.getFromOwner(shareId);
      console.log(`[ShareEdit] Share loaded successfully:`, share);
      setShare(share);
      setIsLoading(false);
    } catch (e: any) {
      console.error(`[ShareEdit] Error loading share ${shareId}:`, e);
      
      // Retry logic for 404 errors (might be temporary due to share state changes)
      if (e.response?.status === 404 && retryCount < maxRetries) {
        console.log(`[ShareEdit] 404 error, retrying in ${retryDelay * (retryCount + 1)}ms...`);
        loadingRef.current = false;
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (retryCount + 1)));
        return loadShare(retryCount + 1);
      }
      
      const error = e.response?.data?.error;
      if (e.response?.status == 404) {
        if (error == "share_removed") {
          showErrorModal(
            modals,
            t("share.error.removed.title"),
            e.response.data.message,
          );
        } else {
          console.error(`[ShareEdit] Share not found: ${shareId}`, {
            status: e.response?.status,
            statusText: e.response?.statusText,
            data: e.response?.data,
            message: e.message,
          });
          showErrorModal(
            modals,
            t("share.error.not-found.title"),
            t("share.error.not-found.description"),
          );
        }
      } else if (e.response?.status == 403 && error == "share_removed") {
        showErrorModal(
          modals,
          t("share.error.access-denied.title"),
          t("share.error.access-denied.description"),
        );
      } else {
        console.error(`[ShareEdit] Unknown error:`, {
          status: e.response?.status,
          statusText: e.response?.statusText,
          data: e.response?.data,
          message: e.message,
        });
        showErrorModal(modals, t("common.error"), t("common.error.unknown"));
      }
      setIsLoading(false);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    // Only load share once when component mounts or shareId changes
    // Don't reload when modals or t change
    loadShare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Meta title={t("share.edit.title", { shareId })} />
      <EditableUpload shareId={shareId} files={share?.files || []} />
    </>
  );
};

export default Share;
