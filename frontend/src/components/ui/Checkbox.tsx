import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={clsx(
              "w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2",
              "dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-primary-400",
              error && "border-red-500 focus:ring-red-500 dark:border-red-400",
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className="font-medium text-text dark:text-text-dark"
            >
              {label}
            </label>
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

