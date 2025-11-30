import React from "react";
import Meta from "../components/Meta";
import useTranslate from "../hooks/useTranslate.hook";
import { useRouter } from "next/router";
import { FormattedMessage } from "react-intl";
import { safeRedirectPath } from "../utils/router.util";
import { Button, Container } from "../components/ui";

export function getServerSideProps() {
  // Make this page dynamic to avoid static generation issues
  return { props: {} };
}

export const dynamic = "force-dynamic";

export default function Error() {
  const t = useTranslate();
  const router = useRouter();

  const params = router.query.params
    ? (router.query.params as string).split(",").map((param) => {
        return t(`error.param.${param}`);
      })
    : [];

  return (
    <>
      <Meta title={t("error.title")} />
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
          <h1 className="text-6xl sm:text-8xl font-black text-text dark:text-text-dark mb-6">
            {t("error.description")}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
            <FormattedMessage
              id={`error.msg.${router.query.error || "default"}`}
              values={Object.fromEntries(
                [params].map((value, key) => [key.toString(), value]),
              )}
            />
          </p>
          <Button
            onClick={() =>
              router.push(safeRedirectPath(router.query.redirect as string))
            }
          >
            {t("error.button.back")}
          </Button>
        </div>
      </Container>
    </>
  );
}
