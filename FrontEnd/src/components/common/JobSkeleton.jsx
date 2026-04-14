import { FiBriefcase } from 'react-icons/fi';

const JobSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
        <FiBriefcase className="text-gray-400" />
      </div>

      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default JobSkeleton;