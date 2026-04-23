import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { FormattedMessage } from "react-intl";
import useConfig from "../../../hooks/config.hook";
import Logo from "../../Logo";
import { Button } from "../../ui";
import { Bars3Icon } from "@heroicons/react/24/outline";

export type AdminHeaderBrandingPreview = {
  logoScalePercent: number;
  headerShowAppName: boolean;
};

const ConfigurationHeader = ({
  setIsMobileNavBarOpened,
  headerPreview,
}: {
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
  /** Live preview while editing General → logo settings (unsaved changes) */
  headerPreview?: AdminHeaderBrandingPreview;
}) => {
  const config = useConfig();
  const scaleOverride = headerPreview?.logoScalePercent;
  const showAppName =
    headerPreview?.headerShowAppName ??
    config.get("general.headerShowAppName") !== false;

  return (
    <header className="sticky top-0 z-50 h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center h-full">
        <button
          className="md:hidden mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          onClick={() => setIsMobileNavBarOpened((o) => !o)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Logo
              placement="adminHeader"
              scalePercentOverride={scaleOverride}
              className="shrink-0"
            />
            {showAppName && (
              <span className="font-semibold text-text dark:text-text-dark truncate">
                {config.get("general.appName")}
              </span>
            )}
          </Link>
          <div className="hidden sm:block">
            <Button variant="outline" as={Link} href="/admin">
              <FormattedMessage id="common.button.go-back" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ConfigurationHeader;
