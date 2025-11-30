import React from "react";
import clsx from "clsx";
import { InputHTMLAttributes, forwardRef } from "react";

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  rightSection?: React.ReactNode;
  rightSectionWidth?: number;
  precision?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, label, error, helperText, id, value, onChange, min, max, step, rightSection, rightSectionWidth, precision, ...props }, ref) => {
    const inputId = id || `number-input-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        const roundedValue = precision !== undefined ? parseFloat(newValue.toFixed(precision)) : newValue;
        onChange?.(roundedValue);
      } else if (e.target.value === "") {
        onChange?.(0);
      }
    };

    const displayValue = value !== undefined && value !== null 
      ? (precision !== undefined ? value.toFixed(precision) : value.toString())
      : "";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text mb-1.5 dark:text-text-dark"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="number"
            value={displayValue}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            className={clsx(
              "w-full px-4 py-2 text-base text-text bg-white border border-gray-300 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "dark:bg-gray-800 dark:text-text-dark dark:border-gray-600 dark:focus:ring-primary-400",
              error && "border-red-500 focus:ring-red-500 dark:border-red-400",
              rightSection && "pr-20 rounded-r-none",
              className
            )}
            style={{ paddingRight: rightSection && rightSectionWidth ? `${rightSectionWidth + 16}px` : undefined }}
            {...props}
          />
          {rightSection && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
              {rightSection}
            </div>
          )}
        </div>
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

NumberInput.displayName = "NumberInput";

export default NumberInput;

