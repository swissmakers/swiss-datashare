import React from "react";
import clsx from "clsx";
import { InputHTMLAttributes, forwardRef, useRef, useEffect, useState } from "react";

export interface PinInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  oneTimeCode?: boolean;
  autoFocus?: boolean;
}

const PinInput = forwardRef<HTMLInputElement, PinInputProps>(
  ({ length = 6, value = "", onChange, onComplete, oneTimeCode = false, autoFocus = false, className, ...props }, ref) => {
    const [values, setValues] = useState<string[]>(Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      if (value) {
        const chars = value.split("").slice(0, length);
        const newValues = [...Array(length).fill("")];
        chars.forEach((char, index) => {
          newValues[index] = char;
        });
        setValues(newValues);
      }
    }, [value, length]);

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    const handleChange = (index: number, newValue: string) => {
      // Only allow single character
      if (newValue.length > 1) {
        newValue = newValue.slice(-1);
      }

      // Only allow digits
      if (!/^\d*$/.test(newValue)) {
        return;
      }

      const newValues = [...values];
      newValues[index] = newValue;
      setValues(newValues);

      const combinedValue = newValues.join("");
      onChange?.(combinedValue);

      // Auto-focus next input
      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete when all fields are filled
      if (combinedValue.length === length && onComplete) {
        onComplete(combinedValue);
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").slice(0, length);
      if (/^\d+$/.test(pastedData)) {
        const newValues = [...Array(length).fill("")];
        pastedData.split("").forEach((char, index) => {
          if (index < length) {
            newValues[index] = char;
          }
        });
        setValues(newValues);
        const combinedValue = newValues.join("");
        onChange?.(combinedValue);
        if (combinedValue.length === length && onComplete) {
          onComplete(combinedValue);
        }
        // Focus the last filled input or the next empty one
        const nextIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    };

    return (
      <div className={clsx("flex gap-2 justify-center", className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
              if (index === 0 && ref) {
                if (typeof ref === "function") {
                  ref(el);
                } else {
                  ref.current = el;
                }
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={clsx(
              "w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              "dark:bg-gray-800 dark:border-gray-600 dark:text-text-dark",
              "transition-colors"
            )}
            autoComplete={oneTimeCode ? "one-time-code" : "off"}
            {...props}
          />
        ))}
      </div>
    );
  }
);

PinInput.displayName = "PinInput";

export default PinInput;

