import { ReactNode } from "react";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface AlertProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
  withCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

const Alert = ({
  children,
  title,
  icon,
  color = "blue",
  withCloseButton = false,
  onClose,
  className,
}: AlertProps) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    green: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
    red: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
  };

  return (
    <div
      className={clsx(
        "border rounded-lg p-4",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0 mr-3">
            {icon}
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {withCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;

