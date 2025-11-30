import clsx from "clsx";

export interface ProgressProps {
  value: number; // 0-100
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Progress = ({ value, label, size = "md", className }: ProgressProps) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
    xl: "h-4",
  };

  return (
    <div className={clsx("relative w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden", sizes[size], className)}>
      <div
        className={clsx(
          "h-full bg-primary-500 dark:bg-primary-600 transition-all duration-300 rounded-full",
          "flex items-center justify-center text-white text-xs font-medium"
        )}
        style={{ width: `${clampedValue}%` }}
      >
        {label && clampedValue >= 10 && (
          <span className="text-xs font-medium">{label}</span>
        )}
      </div>
    </div>
  );
};

export default Progress;

