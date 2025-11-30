import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { FormattedMessage } from "react-intl";
import useConfig from "../../../hooks/config.hook";
import Logo from "../../Logo";
import { Button } from "../../ui";
import { Bars3Icon } from "@heroicons/react/24/outline";

const ConfigurationHeader = ({
  setIsMobileNavBarOpened,
}: {
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  const config = useConfig();
  return (
    <header className="h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center h-full">
        <button
          className="md:hidden mr-4 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          onClick={() => setIsMobileNavBarOpened((o) => !o)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2">
            <Logo height={35} width={35} />
            <span className="font-semibold text-text dark:text-text-dark">
              {config.get("general.appName")}
            </span>
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
