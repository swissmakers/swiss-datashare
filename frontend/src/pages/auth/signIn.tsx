import { GetServerSidePropsContext } from "next";
import { useEffect, useState } from "react";
import SignInForm from "../../components/auth/SignInForm";
import Meta from "../../components/Meta";
import useUser from "../../hooks/user.hook";
import { LoadingSpinner } from "../../components/ui";
import { navigateToPathAfterAuth } from "../../utils/router.util";

export function getServerSideProps(context: GetServerSidePropsContext) {
  const raw = context.query.redirect;
  const redirectPath =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw) && typeof raw[0] === "string"
        ? raw[0]
        : null;

  return {
    props: { redirectPath },
  };
}

const SignIn = ({ redirectPath }: { redirectPath?: string }) => {
  const { refreshUser } = useUser();

  const [isLoading, setIsLoading] = useState(redirectPath ? true : false);

  // If the access token is expired, the middleware redirects to this page.
  // If the refresh token is still valid, the user will be redirected to the last page.
  useEffect(() => {
    let cancelled = false;

    void refreshUser()
      .then((nextUser) => {
        if (cancelled) return;
        if (nextUser) {
          navigateToPathAfterAuth(redirectPath ?? "/upload");
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshUser, redirectPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Meta title="Sign In" />
      <SignInForm redirectPath={redirectPath ?? "/upload"} />
    </>
  );
};

export default SignIn;
