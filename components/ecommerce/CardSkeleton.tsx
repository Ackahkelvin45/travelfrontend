import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md flex flex-col min-w-72 max-w-72 shrink-0 overflow-hidden">
      {/* Image Placeholder */}
      <div className="h-52 w-full">
        <Skeleton width="100%" height="100%" />
      </div>

      {/* Content Placeholder */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <Skeleton width={80} height={12} />
        <Skeleton width="90%" height={20} />
        
        <div className="flex items-center gap-2">
          <Skeleton width={100} height={14} />
          <Skeleton width={40} height={14} />
        </div>

        <hr className="border-gray-100 my-1" />

        <div className="flex justify-between items-center">
          <Skeleton width={60} height={14} />
          <Skeleton width={100} height={18} />
        </div>
      </div>
    </div>
  )
}
