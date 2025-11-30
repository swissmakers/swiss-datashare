import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import {
  TbAt,
  TbBinaryTree,
  TbBucket,
  TbMail,
  TbScale,
  TbServerBolt,
  TbSettings,
  TbShare,
  TbSocial,
} from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import clsx from "clsx";

const categories = [
  { name: "General", icon: TbSettings },
  { name: "Email", icon: TbMail },
  { name: "Share", icon: TbShare },
  { name: "SMTP", icon: TbAt },
  { name: "OAuth", icon: TbSocial },
  { name: "LDAP", icon: TbBinaryTree },
  { name: "S3", icon: TbBucket },
  { name: "Legal", icon: TbScale },
  { name: "Cache", icon: TbServerBolt },
];

const ConfigurationNavBar = ({
  categoryId,
  isMobileNavBarOpened,
  setIsMobileNavBarOpened,
}: {
  categoryId: string;
  isMobileNavBarOpened: boolean;
  setIsMobileNavBarOpened: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <nav
      className={clsx(
        "fixed left-0 top-16 bottom-0 w-64 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-40 transition-transform",
        "sm:translate-x-0",
        isMobileNavBarOpened ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          <FormattedMessage id="admin.config.title" />
        </p>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = categoryId === category.name.toLowerCase();
            return (
              <Link
                key={category.name}
                href={`/admin/config/${category.name.toLowerCase()}`}
                onClick={() => setIsMobileNavBarOpened(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <Icon
                  size={20}
                  className={clsx(
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                />
                <span className="text-sm">
                  <FormattedMessage
                    id={`admin.config.category.${category.name.toLowerCase()}`}
                  />
                </span>
              </Link>
            );
          })}
        </div>
        <div className="sm:hidden pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/admin"
            className="block w-full px-3 py-2 text-sm text-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
          >
            <FormattedMessage id="common.button.go-back" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default ConfigurationNavBar;
