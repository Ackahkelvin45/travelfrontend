import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function TourDetailSkeleton() {
  return (
    <main className="w-full px-4 md:px-10 mt-20 py-6 overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <Skeleton width={200} height={12} className="mb-3" />
        <Skeleton width="70%" height={36} className="mb-3" />
        <div className="flex gap-2">
          <Skeleton width={80} height={26} borderRadius={999} />
          <Skeleton width={80} height={26} borderRadius={999} />
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-6 h-[250px] sm:h-[350px] lg:h-[450px]">
        <Skeleton width="100%" height="100%" />
        <div className="hidden md:grid grid-rows-2 gap-2">
          <Skeleton width="100%" height="100%" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton width="100%" height="100%" />
            <Skeleton width="100%" height="100%" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left column */}
        <div className="w-full lg:w-[70%] flex flex-col gap-10">
          {/* Meta */}
          <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton circle width={40} height={40} />
                <div>
                  <Skeleton width={60} height={11} />
                  <Skeleton width={80} height={14} />
                </div>
              </div>
            ))}
          </div>

          {/* Overview */}
          <div className="py-6 border-b border-gray-100">
            <Skeleton width={160} height={22} className="mb-3" />
            <Skeleton count={3} height={13} className="mb-1" />
            <Skeleton width="60%" height={13} className="mb-6" />
            <Skeleton width={140} height={18} className="mb-3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width="80%" height={13} className="mb-2" />
            ))}
          </div>

          {/* Itinerary */}
          <div className="py-6 border-b border-gray-100">
            <Skeleton width={120} height={22} className="mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 mb-6">
                <Skeleton circle width={16} height={16} />
                <div>
                  <Skeleton width={50} height={11} className="mb-1" />
                  <Skeleton width={200} height={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[30%]">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <Skeleton width={160} height={32} className="mb-5" />
            <Skeleton height={90} borderRadius={12} className="mb-6" />
            <Skeleton width={80} height={18} className="mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={36} className="mb-3" />
            ))}
            <Skeleton height={52} borderRadius={16} />
          </div>
        </div>
      </div>
    </main>
  )
}
