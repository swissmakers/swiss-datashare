import { useState } from "react";
import { TbDeviceLaptop, TbMoon, TbSun } from "react-icons/tb";
import { FormattedMessage } from "react-intl";
import { useTheme } from "../../contexts/ThemeContext";
import userPreferences from "../../utils/userPreferences.util";
import clsx from "clsx";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(
    userPreferences.get("colorScheme") || theme,
  );

  const handleChange = (value: "light" | "dark" | "system") => {
    userPreferences.set("colorScheme", value);
    setLocalTheme(value);
    setTheme(value);
  };

  const options = [
    {
      label: (
        <div className="flex items-center gap-2">
          <TbMoon size={16} />
          <FormattedMessage id="account.theme.dark" />
        </div>
      ),
      value: "dark" as const,
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <TbSun size={16} />
          <FormattedMessage id="account.theme.light" />
        </div>
      ),
      value: "light" as const,
    },
    {
      label: (
        <div className="flex items-center gap-2">
          <TbDeviceLaptop size={16} />
          <FormattedMessage id="account.theme.system" />
        </div>
      ),
      value: "system" as const,
    },
  ];

  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleChange(option.value)}
          className={clsx(
            "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
            localTheme === option.value
              ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
