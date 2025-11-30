import { Switch as HeadlessSwitch } from "@headlessui/react";
import clsx from "clsx";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

const Switch = ({ checked, onChange, label, helperText, disabled = false, className }: SwitchProps) => {
  // checked is used in the component below
  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="flex items-center">
        {label && (
          <label className="mr-3 text-sm font-medium text-text dark:text-text-dark">
            {label}
          </label>
        )}
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
            checked ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </HeadlessSwitch>
      </div>
      {helperText && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default Switch;

