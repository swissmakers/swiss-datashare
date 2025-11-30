import clsx from "clsx";
import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card = ({ children, className, padding = "md", hover = false }: CardProps) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700",
        paddings[padding],
        hover && "transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;

