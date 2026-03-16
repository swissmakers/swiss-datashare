import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  TbArrowRight,
  TbCode,
  TbEyeOff,
  TbLockCheck,
  TbMapPin,
  TbShieldCheck,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Logo from "../components/Logo";
import Meta from "../components/Meta";
import useUser from "../hooks/user.hook";
import useConfig from "../hooks/config.hook";
import { Button, Container, Card } from "../components/ui";

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

  const isSwissLocation = (process.env.LOCATION || "").toLowerCase() === "swiss";

  const trustItems = [
    {
      icon: TbLockCheck,
      title: "home.trust.encryption.title",
      description: "home.trust.encryption.description",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    },
    {
      icon: TbEyeOff,
      title: "home.trust.no-analysis.title",
      description: "home.trust.no-analysis.description",
      color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    },
    {
      icon: TbShieldCheck,
      title: "home.trust.hardened.title",
      description: "home.trust.hardened.description",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    },
    {
      icon: TbCode,
      title: "home.trust.opensource.title",
      description: "home.trust.opensource.description",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    },
  ];

  const howToSteps = [
    {
      title: "home.how.step1.title",
      description: "home.how.step1.description",
    },
    {
      title: "home.how.step2.title",
      description: "home.how.step2.description",
    },
    {
      title: "home.how.step3.title",
      description: "home.how.step3.description",
    },
  ];

  return (
    <>
      <Meta title="Home" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/10">
        <Container>
          <div className="pt-12 pb-10 lg:pt-20 lg:pb-16">
            <div className="text-center max-w-4xl mx-auto mb-10">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full"></div>
                  <div className="relative z-10">
                    <Logo width={120} height={120} />
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-text dark:text-text-dark mb-4">
                <FormattedMessage
                  id="home.title"
                  values={{
                    h: (chunks) => (
                      <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 rounded-xl shadow-lg">
                          {chunks}
                        </span>
                        <span className="absolute inset-0 bg-primary-500/30 blur-xl rounded-xl"></span>
                      </span>
                    ),
                  }}
                />
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6 max-w-3xl mx-auto leading-relaxed">
                <FormattedMessage id="home.description" />
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  as={Link}
                  href={getButtonHref()}
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FormattedMessage id="home.button.start" />
                  <TbArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  as={Link}
                  href="https://github.com/swissmakers/swiss-datashare"
                  target="_blank"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold"
                >
                  <FormattedMessage id="home.button.source" />
                </Button>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-text dark:text-text-dark mb-6 text-center">
                <FormattedMessage id="home.trust.title" />
              </h2>
              <Card
                padding="md"
                className="mb-4 border-2 border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-900/10"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shrink-0">
                    <TbMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text dark:text-text-dark">
                      <FormattedMessage id="home.trust.residency.title" />
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                      <FormattedMessage
                        id={
                          isSwissLocation
                            ? "home.trust.residency.swiss"
                            : "home.trust.residency.generic"
                        }
                      />
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trustItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Card key={item.title} padding="md" className="border">
                      <div className="flex items-start gap-3">
                        <div
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${item.color} shrink-0`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-text dark:text-text-dark">
                            <FormattedMessage id={item.title} />
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                            <FormattedMessage id={item.description} />
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-text dark:text-text-dark mb-6 text-center">
                <FormattedMessage id="home.how.title" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {howToSteps.map((step, index) => {
                  const stepNumber = index + 1;
                  return (
                    <Card key={step.title} padding="md" className="border">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold mb-3">
                        {stepNumber}
                      </div>
                      <h3 className="text-base font-semibold text-text dark:text-text-dark mb-2">
                        <FormattedMessage id={step.title} />
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        <FormattedMessage id={step.description} />
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
