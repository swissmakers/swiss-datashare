import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbCheck } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Logo from "../components/Logo";
import Meta from "../components/Meta";
import useUser from "../hooks/user.hook";
import useConfig from "../hooks/config.hook";
import { Button, Container } from "../components/ui";

export default function Home() {
  const { refreshUser } = useUser();
  const router = useRouter();
  const config = useConfig();
  const [signupEnabled, setSignupEnabled] = useState(true);

  // If user is already authenticated, redirect to the upload page
  useEffect(() => {
    refreshUser().then((user) => {
      if (user) {
        router.replace("/upload");
      }
    });

    // If registration is disabled, get started button should redirect to the sign in page
    try {
      const allowRegistration = config.get("share.allowRegistration");
      setSignupEnabled(allowRegistration !== false);
    } catch (error) {
      setSignupEnabled(true);
    }
  }, [config, refreshUser, router]);

  const getButtonHref = () => {
    return signupEnabled ? "/auth/signUp" : "/auth/signIn";
  };

  return (
    <>
      <Meta title="Home" />
      <Container>
        <div className="flex flex-col lg:flex-row justify-between items-center py-16 lg:py-20 gap-12">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-text dark:text-text-dark mb-6">
              <FormattedMessage
                id="home.title"
                values={{
                  h: (chunks) => (
                    <span className="relative inline-block">
                      <span className="relative z-10 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-lg">
                        {chunks}
                      </span>
                    </span>
                  ),
                }}
              />
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              <FormattedMessage id="home.description" />
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white">
                    <TbCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">
                    <FormattedMessage id="home.bullet.a.name" />
                  </span>{" "}
                  - <FormattedMessage id="home.bullet.a.description" />
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white">
                    <TbCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">
                    <FormattedMessage id="home.bullet.b.name" />
                  </span>{" "}
                  - <FormattedMessage id="home.bullet.b.description" />
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white">
                    <TbCheck className="w-3 h-3" />
                  </div>
                </div>
                <div className="ml-3 text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">
                    <FormattedMessage id="home.bullet.c.name" />
                  </span>{" "}
                  - <FormattedMessage id="home.bullet.c.description" />
                </div>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                as={Link}
                href={getButtonHref()}
                size="lg"
                className="w-full sm:w-auto"
              >
                <FormattedMessage id="home.button.start" />
              </Button>
              <Button
                as={Link}
                href="https://github.com/swissmakers/swiss-datashare"
                target="_blank"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <FormattedMessage id="home.button.source" />
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center flex-1">
            <Logo width={200} height={200} />
          </div>
        </div>
      </Container>
    </>
  );
}
