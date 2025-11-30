import { TbCircleCheck } from "react-icons/tb";
import { LoadingSpinner } from "../ui";

const UploadProgressIndicator = ({ progress }: { progress: number }) => {
  if (progress > 0 && progress < 100) {
    return (
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 transform -rotate-90">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
            className="text-primary-500 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-500">
          {Math.round(progress)}%
        </span>
      </div>
    );
  } else if (progress >= 100) {
    return <TbCircleCheck className="text-green-500" size={22} />;
  } else if (progress === -1) {
    return <LoadingSpinner size="sm" className="text-red-500" />;
  } else {
    return <LoadingSpinner size="sm" />;
  }
};

export default UploadProgressIndicator;
