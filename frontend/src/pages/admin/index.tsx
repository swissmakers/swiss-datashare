import Link from "next/link";
import { TbLink, TbSettings, TbUsers } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../components/Meta";
import useTranslate from "../../hooks/useTranslate.hook";
import versionService from "../../services/version.service";
import { Container, Card, Alert } from "../../components/ui";
import clsx from "clsx";
import { useEffect, useState } from "react";

const Admin = () => {
  const t = useTranslate();
  const localVersion = versionService.getLocalVersion();
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  const managementOptions = [
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
  ];

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const latest = await versionService.getLatestReleaseTag();
      if (!cancelled) setLatestVersion(latest);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasUpdate =
    latestVersion != null &&
    versionService.isVersionNewer(latestVersion, localVersion);

  return (
    <>
      <Meta title={t("admin.title")} />
      <Container>
        <h2 className="text-2xl font-bold mb-8 text-text dark:text-text-dark">
          <FormattedMessage id="admin.title" />
        </h2>
        <Alert color={hasUpdate ? "yellow" : "blue"} className="mb-6">
          <div className="space-y-1">
            <p>
              {t("admin.version.current", { version: localVersion })}
            </p>
            {hasUpdate && latestVersion ? (
              <p>
                {t("admin.version.update-available", {
                  version: latestVersion,
                })}{" "}
                <a
                  href={versionService.RELEASES_LATEST_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  {t("admin.version.view-release")}
                </a>
              </p>
            ) : (
              <p>{t("admin.version.up-to-date")}</p>
            )}
          </div>
        </Alert>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {managementOptions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.route}
                href={item.route}
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
