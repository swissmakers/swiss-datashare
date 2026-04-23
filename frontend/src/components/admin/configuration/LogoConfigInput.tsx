import React, { Dispatch, SetStateAction, useRef } from "react";
import { TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../../hooks/useTranslate.hook";
import useConfig from "../../../hooks/config.hook";
import { UpdateConfig } from "../../../types/config.type";
import Logo from "../../Logo";
import { Button, Switch } from "../../ui";
import clsx from "clsx";

const clampLogoScale = (n: number) =>
  Math.min(250, Math.max(25, Number.isFinite(n) ? Math.round(n) : 100));

const LogoConfigInput = ({
  logo,
  setLogo,
  logoScalePercent,
  headerShowAppName,
  updateConfigVariable,
  allowEdit,
}: {
  logo: File | null;
  setLogo: Dispatch<SetStateAction<File | null>>;
  logoScalePercent: number;
  headerShowAppName: boolean;
  updateConfigVariable: (variable: UpdateConfig) => void;
  allowEdit: boolean;
}) => {
  const t = useTranslate();
  const config = useConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appName = config.get("general.appName");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className={clsx("flex-1", "sm:max-w-[40%]")}>
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-1">
            <FormattedMessage id="admin.config.general.logo" />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <FormattedMessage id="admin.config.general.logo.description" />
          </p>
        </div>
        <div className={clsx("w-full sm:w-[50%]")}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
            disabled={!allowEdit}
          >
            <TbUpload className="mr-2" size={18} />
            {logo ? logo.name : t("admin.config.general.logo.placeholder")}
          </Button>
          {logo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogo(null)}
              className="mt-2 w-full"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-1 sm:max-w-[40%]">
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-1">
            <FormattedMessage id="admin.config.general.logo-scale-percent" />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <FormattedMessage id="admin.config.general.logo-scale-percent.description" />
          </p>
        </div>
        <div className="w-full sm:w-[50%] space-y-2">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={25}
              max={250}
              step={5}
              disabled={!allowEdit}
              value={clampLogoScale(logoScalePercent)}
              onChange={(e) =>
                updateConfigVariable({
                  key: "general.logoScalePercent",
                  value: clampLogoScale(Number(e.target.value)),
                })
              }
              className="flex-1 accent-primary-600"
            />
            <span className="text-sm font-medium tabular-nums w-14 text-right text-text dark:text-text-dark">
              {clampLogoScale(logoScalePercent)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 sm:max-w-[40%]">
          <h3 className="text-sm font-semibold text-text dark:text-text-dark mb-1">
            <FormattedMessage id="admin.config.general.header-show-app-name" />
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <FormattedMessage id="admin.config.general.header-show-app-name.description" />
          </p>
        </div>
        <div className="w-full sm:w-[50%] flex justify-end">
          <Switch
            disabled={!allowEdit}
            checked={headerShowAppName}
            onChange={(checked) =>
              updateConfigVariable({
                key: "general.headerShowAppName",
                value: checked,
              })
            }
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          <FormattedMessage id="admin.config.general.logo.preview-header" />
        </p>
        <div
          className={clsx(
            "rounded-lg border border-gray-200 dark:border-gray-700",
            "bg-white dark:bg-gray-900 px-4",
            "flex items-center gap-2 h-16",
          )}
        >
          <Logo
            placement="adminHeader"
            scalePercentOverride={clampLogoScale(logoScalePercent)}
            className="shrink-0"
          />
          {headerShowAppName && (
            <span className="font-semibold text-text dark:text-text-dark truncate">
              {typeof appName === "string" ? appName : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoConfigInput;
