import Link from "next/link";
import { useEffect, useState } from "react";
import { TbLink, TbRefresh, TbSettings, TbUsers } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import useTranslate from "../../hooks/useTranslate.hook";
import configService from "../../services/config.service";
import { Container, Card } from "../../components/ui";
import clsx from "clsx";

const Admin = () => {
  const t = useTranslate();

  const [managementOptions, setManagementOptions] = useState([
    {
      title: t("admin.button.users"),
      icon: TbUsers,
      route: "/admin/users",
    },
    {
      title: t("admin.button.shares"),
      icon: TbLink,
      route: "/admin/shares",
    },
    {
      title: t("admin.button.config"),
      icon: TbSettings,
      route: "/admin/config/general",
    },
  ]);

  useEffect(() => {
    configService
      .isNewReleaseAvailable()
      .then((isNewReleaseAvailable) => {
        if (isNewReleaseAvailable) {
          setManagementOptions([
            ...managementOptions,
            {
              title: "Update",
              icon: TbRefresh,
              route:
                "https://github.com/swissmakers/swiss-datashare/releases/latest",
            },
          ]);
        }
      })
      .catch();
  }, []);

  return (
    <>
      <Meta title={t("admin.title")} />
      <Container>
        <h2 className="text-2xl font-bold mb-8 text-text dark:text-text-dark">
          <FormattedMessage id="admin.title" />
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {managementOptions.map((item) => {
            const Icon = item.icon;
            const isExternal = item.route.startsWith("http");
            return (
              <Link
                key={item.route}
                href={item.route}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="block"
              >
                <Card
                  padding="lg"
                  className={clsx(
                    "h-32 flex flex-col items-center justify-center text-center",
                    "hover:shadow-lg transition-all duration-200 hover:scale-105",
                    "cursor-pointer"
                  )}
                >
                  <Icon className="text-primary-600 dark:text-primary-400 mb-2" size={35} />
                  <p className="text-sm font-medium text-text dark:text-text-dark">
                    {item.title}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </>
  );
};

export default Admin;
