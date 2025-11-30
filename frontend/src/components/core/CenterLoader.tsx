import { LoadingSpinner } from "../ui";

const CenterLoader = () => {
  return (
    <div className="flex items-center justify-center" style={{ height: "70vh" }}>
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default CenterLoader;
