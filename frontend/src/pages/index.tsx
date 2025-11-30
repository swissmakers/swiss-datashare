import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbServer, TbShieldLock, TbInfinity, TbArrowRight } from "react-icons/tb";
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

  const features = [
    {
      icon: TbServer,
      name: "home.bullet.a.name",
      description: "home.bullet.a.description",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      icon: TbShieldLock,
      name: "home.bullet.b.name",
      description: "home.bullet.b.description",
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      icon: TbInfinity,
      name: "home.bullet.c.name",
      description: "home.bullet.c.description",
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <>
      <Meta title="Home" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/10">
        <Container>
          {/* Hero Section */}
          <div className="pt-12 pb-10 lg:pt-20 lg:pb-16">
            <div className="text-center max-w-4xl mx-auto mb-12">
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
              
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
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

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card
                    key={index}
                    padding="md"
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary-200 dark:hover:border-primary-800"
                  >
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-text dark:text-text-dark mb-2">
                      <FormattedMessage id={feature.name} />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      <FormattedMessage id={feature.description} />
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
