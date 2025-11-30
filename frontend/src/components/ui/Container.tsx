import clsx from "clsx";
import { ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full" | number | string;
}

const Container = ({ children, className, size = "lg" }: ContainerProps) => {
  const getSizeClass = () => {
    if (typeof size === "number" || (typeof size === "string" && !isNaN(Number(size)))) {
      return `max-w-[${size}px]`;
    }
    const sizes = {
      sm: "max-w-3xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
    };
    return sizes[size as keyof typeof sizes] || sizes.lg;
  };

  return (
    <div className={clsx("mx-auto px-4 sm:px-6 lg:px-8", getSizeClass(), className)}>
      {children}
    </div>
  );
};

export default Container;

