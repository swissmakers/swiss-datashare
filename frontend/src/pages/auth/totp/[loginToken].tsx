import useTranslate from "../../../hooks/useTranslate.hook";
import Meta from "../../../components/Meta";
import TotpForm from "../../../components/auth/TotpForm";
import { useRouter } from "next/router";
import { safeRedirectPath } from "../../../utils/router.util";

const Totp = () => {
  const t = useTranslate();
  const router = useRouter();

  const rawRedirect = router.query.redirect;
  const redirectFromQuery =
    typeof rawRedirect === "string"
      ? rawRedirect
      : Array.isArray(rawRedirect) && typeof rawRedirect[0] === "string"
        ? rawRedirect[0]
        : undefined;

  return (
    <>
      <Meta title={t("totp.title")} />
      <TotpForm redirectPath={safeRedirectPath(redirectFromQuery ?? "/upload")} />
    </>
  );
};

export default Totp;
