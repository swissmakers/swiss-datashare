import clsx from "clsx";
import { SelectHTMLAttributes, forwardRef } from "react";

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  data: { value: string; label: string }[];
  rightSectionWidth?: number;
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, label, error, helperText, id, data, rightSectionWidth, ...props }, ref) => {
    const selectId = id || `native-select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text mb-1.5 dark:text-text-dark"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            "w-full px-4 py-2 text-base text-text bg-white border border-gray-300 rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "dark:bg-gray-800 dark:text-text-dark dark:border-gray-600 dark:focus:ring-primary-400",
            error && "border-red-500 focus:ring-red-500 dark:border-red-400",
            className
          )}
          style={{ paddingRight: rightSectionWidth ? `${rightSectionWidth}px` : undefined }}
          {...props}
        >
          {data.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

NativeSelect.displayName = "NativeSelect";

export default NativeSelect;

