import { ReactNode, useState } from "react";
import clsx from "clsx";

export interface TooltipProps {
  children: ReactNode;
  label: string;
  position?: "top" | "bottom" | "left" | "right";
  multiline?: boolean;
  width?: number;
  className?: string;
}

const Tooltip = ({ children, label, position = "top", multiline = false, width, className }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrows = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700",
    right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700",
  };

  return (
    <div
      className={clsx("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={clsx(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg",
            positions[position],
            multiline && "whitespace-normal"
          )}
          style={{ width: width ? `${width}px` : "auto", maxWidth: width ? `${width}px` : "200px" }}
          role="tooltip"
        >
          {label}
          <div
            className={clsx(
              "absolute w-0 h-0 border-4 border-transparent",
              arrows[position]
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

