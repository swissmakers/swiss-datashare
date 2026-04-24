import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import Upload from ".";
import showErrorModal from "../../components/share/showErrorModal";
import shareService from "../../services/share.service";
import useTranslate from "../../hooks/useTranslate.hook";
import { LoadingSpinner } from "../../components/ui";
import { useModals } from "../../contexts/ModalContext";
import i18nUtil from "../../utils/i18n.util";

type PageProps = {
  reverseShareToken: string;
  creatorLocale: string | null;
  initialResolvedLocale: string;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<{ props: PageProps }> {
  const token = String(context.params!.reverseShareToken);
  const apiUrl = process.env.API_URL || "http://localhost:8080";
  let creatorLocale: string | null = null;

  try {
    const res = await fetch(
      `${apiUrl}/reverseShares/${encodeURIComponent(token)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as { creatorLocale?: string };
      if (data.creatorLocale) creatorLocale = data.creatorLocale;
    }
  } catch {
    /* token may be invalid; page will handle client-side */
  }

  const cookieHeader = context.req.headers.cookie ?? "";
  const languageMatch = cookieHeader.match(/(?:^|; )language=([^;]*)/);
  const cookieLang = languageMatch
    ? decodeURIComponent(languageMatch[1].trim())
    : null;
  const acceptRaw = context.req.headers["accept-language"];
  const acceptLanguageHeader = Array.isArray(acceptRaw)
    ? acceptRaw[0]
    : acceptRaw ?? null;

  const initialResolvedLocale = i18nUtil.resolveDisplayLocale({
    cookieLang,
    creatorLocale,
    userLocale: null,
    siteDefaultLocale: null,
    acceptLanguageHeader,
    navigatorLanguage: null,
  });

  return {
    props: {
      reverseShareToken: token,
      creatorLocale,
      initialResolvedLocale,
    },
  };
}

const Share = ({ reverseShareToken }: PageProps) => {
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
