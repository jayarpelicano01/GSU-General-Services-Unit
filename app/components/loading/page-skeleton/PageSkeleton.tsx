import Spinner from "../spinner/Spinner";


const PageSkeleton = () => (
  <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-400 text-sm font-medium">Loading...</p>
    </div>
  </div>
);

export default PageSkeleton;