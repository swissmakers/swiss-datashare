import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import Upload from ".";
import showErrorModal from "../../components/share/showErrorModal";
import shareService from "../../services/share.service";
import useTranslate from "../../hooks/useTranslate.hook";
import { LoadingSpinner } from "../../components/ui";
import { useModals } from "../../contexts/ModalContext";

export function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: { reverseShareToken: context.params!.reverseShareToken },
  };
}

const Share = ({ reverseShareToken }: { reverseShareToken: string }) => {
  const modals = useModals();
  const t = useTranslate();
  const [isLoading, setIsLoading] = useState(true);

  const [maxShareSize, setMaxShareSize] = useState(0);
  const [simplified, setSimplified] = useState(false);

  useEffect(() => {
    shareService
      .setReverseShare(reverseShareToken)
      .then((reverseShareTokenData) => {
        setMaxShareSize(parseInt(reverseShareTokenData.maxShareSize));
        setSimplified(reverseShareTokenData.simplified);
        setIsLoading(false);
      })
      .catch(() => {
        showErrorModal(
          modals,
          t("upload.reverse-share.error.invalid.title"),
          t("upload.reverse-share.error.invalid.description"),
          "go-home",
        );
        setIsLoading(false);
      });
  }, []);

  if (isLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <Upload
      isReverseShare
      maxShareSize={maxShareSize}
      simplified={simplified}
    />
  );
};

export default Share;
