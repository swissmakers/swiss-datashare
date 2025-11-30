import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TbInfoCircle } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import Meta from "../../../components/Meta";
import AdminConfigInput from "../../../components/admin/configuration/AdminConfigInput";
import ConfigurationHeader from "../../../components/admin/configuration/ConfigurationHeader";
import ConfigurationNavBar from "../../../components/admin/configuration/ConfigurationNavBar";
import LogoConfigInput from "../../../components/admin/configuration/LogoConfigInput";
import TestEmailButton from "../../../components/admin/configuration/TestEmailButton";
import CenterLoader from "../../../components/core/CenterLoader";
import useConfig from "../../../hooks/config.hook";
import useTranslate from "../../../hooks/useTranslate.hook";
import configService from "../../../services/config.service";
import { AdminConfig, UpdateConfig } from "../../../types/config.type";
import { camelToKebab } from "../../../utils/string.util";
import toast from "../../../utils/toast.util";
import { Container, Alert, Button } from "../../../components/ui";
import clsx from "clsx";

export default function AdminConfigPage() {
  const router = useRouter();
  const t = useTranslate();

  const [isMobileNavBarOpened, setIsMobileNavBarOpened] = useState(false);
  const config = useConfig();

  const categoryId = (router.query.category as string | undefined) ?? "general";

  const [configVariables, setConfigVariables] = useState<AdminConfig[]>();
  const [updatedConfigVariables, setUpdatedConfigVariables] = useState<
    UpdateConfig[]
  >([]);

  const [logo, setLogo] = useState<File | null>(null);

  const isEditingAllowed = (): boolean => {
    return !configVariables || configVariables[0].allowEdit;
  };

  const saveConfigVariables = async () => {
    if (logo) {
      configService
        .changeLogo(logo)
        .then(() => {
          setLogo(null);
          toast.success(t("admin.config.notify.logo-success"));
        })
        .catch(toast.axiosError);
    }

    if (updatedConfigVariables.length > 0) {
      await configService
        .updateMany(updatedConfigVariables)
        .then(() => {
          setUpdatedConfigVariables([]);
          toast.success(t("admin.config.notify.success"));
        })
        .catch(toast.axiosError);
      void config.refresh();
    } else {
      toast.success(t("admin.config.notify.no-changes"));
    }
  };

  const updateConfigVariable = (configVariable: UpdateConfig) => {
    if (configVariable.key === "general.appUrl") {
      configVariable.value = sanitizeUrl(configVariable.value);
    }

    const index = updatedConfigVariables.findIndex(
      (item) => item.key === configVariable.key,
    );

    if (index > -1) {
      updatedConfigVariables[index] = {
        ...updatedConfigVariables[index],
        ...configVariable,
      };
    } else {
      setUpdatedConfigVariables([...updatedConfigVariables, configVariable]);
    }
  };

  const sanitizeUrl = (url: string): string => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
  };

  useEffect(() => {
    configService.getByCategory(categoryId).then((configVariables) => {
      setConfigVariables(configVariables);
    });
  }, [categoryId]);

  return (
    <>
      <Meta title={t("admin.config.title")} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ConfigurationHeader
          isMobileNavBarOpened={isMobileNavBarOpened}
          setIsMobileNavBarOpened={setIsMobileNavBarOpened}
        />
        <ConfigurationNavBar
          categoryId={categoryId}
          isMobileNavBarOpened={isMobileNavBarOpened}
          setIsMobileNavBarOpened={setIsMobileNavBarOpened}
        />
        <main
          className={clsx(
            "pt-16 transition-all",
            "sm:ml-64 lg:ml-80"
          )}
        >
          <Container size="lg" className="py-8">
            {!configVariables ? (
              <CenterLoader />
            ) : (
              <>
                <div className="space-y-6">
                  {!isEditingAllowed() && (
                    <Alert
                      color="blue"
                      title={t("admin.config.config-file-warning.title")}
                      icon={<TbInfoCircle size={16} />}
                      className="mb-6"
                    >
                      <FormattedMessage id="admin.config.config-file-warning.description" />
                    </Alert>
                  )}
                  <h2 className="text-2xl font-bold text-text dark:text-text-dark mb-6">
                    {t("admin.config.category." + categoryId)}
                  </h2>
                  {configVariables.map((configVariable) => (
                    <div
                      key={configVariable.key}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex-1 sm:max-w-[40%]">
                        <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-1">
                          <FormattedMessage
                            id={`admin.config.${camelToKebab(
                              configVariable.key,
                            )}`}
                          />
                        </h3>
                        <p
                          className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line"
                        >
                          <FormattedMessage
                            id={`admin.config.${camelToKebab(
                              configVariable.key,
                            )}.description`}
                            values={{ br: <br /> }}
                          />
                        </p>
                      </div>
                      <div className="w-full sm:w-[50%]">
                        <AdminConfigInput
                          key={configVariable.key}
                          configVariable={configVariable}
                          updateConfigVariable={updateConfigVariable}
                        />
                      </div>
                    </div>
                  ))}
                  {categoryId == "general" && (
                    <div className="py-4 border-b border-gray-200 dark:border-gray-700">
                      <LogoConfigInput logo={logo} setLogo={setLogo} />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  {categoryId == "smtp" && (
                    <TestEmailButton
                      configVariablesChanged={updatedConfigVariables.length != 0}
                      saveConfigVariables={saveConfigVariables}
                    />
                  )}
                  <Button onClick={saveConfigVariables}>
                    <FormattedMessage id="common.button.save" />
                  </Button>
                </div>
              </>
            )}
          </Container>
        </main>
      </div>
    </>
  );
}
