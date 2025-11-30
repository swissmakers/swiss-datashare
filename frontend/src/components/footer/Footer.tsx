import Link from "next/link";
import useConfig from "../../hooks/config.hook";
import useTranslate from "../../hooks/useTranslate.hook";

const Footer = () => {
  const t = useTranslate();
  const config = useConfig();
  const hasImprint = !!(
    config.get("legal.imprintUrl") || config.get("legal.imprintText")
  );
  const hasPrivacy = !!(
    config.get("legal.privacyPolicyUrl") ||
    config.get("legal.privacyPolicyText")
  );
  const imprintUrl =
    (!config.get("legal.imprintText") && config.get("legal.imprintUrl")) ||
    "/imprint";
  const privacyUrl =
    (!config.get("legal.privacyPolicyText") &&
      config.get("legal.privacyPolicyUrl")) ||
    "/privacy";

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="hidden sm:block"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by{" "}
              <Link
                href="https://github.com/swissmakers/swiss-datashare"
                target="_blank"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Swiss DataShare
              </Link>
            </p>
          </div>
          <div className="text-center sm:text-right">
            {config.get("legal.enabled") && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasImprint && (
                  <Link
                    href={imprintUrl}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {t("imprint.title")}
                  </Link>
                )}
                {hasImprint && hasPrivacy && " • "}
                {hasPrivacy && (
                  <Link
                    href={privacyUrl}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {t("privacy.title")}
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
