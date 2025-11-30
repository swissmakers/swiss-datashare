import clsx from "clsx";
import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Badge = ({ children, variant = "primary", size = "md", className }: BadgeProps) => {
  const variants = {
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

