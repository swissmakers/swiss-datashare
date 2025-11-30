import React, { Dispatch, SetStateAction, useRef } from "react";
import { TbUpload } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import useTranslate from "../../../hooks/useTranslate.hook";
import { Button } from "../../ui";
import clsx from "clsx";

const LogoConfigInput = ({
  logo,
  setLogo,
}: {
  logo: File | null;
  setLogo: Dispatch<SetStateAction<File | null>>;
}) => {
  const t = useTranslate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
    }
  };

  return (
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
  );
};

export default LogoConfigInput;
