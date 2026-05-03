import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function TourListCardSkeleton() {
 return (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden">
 {/* Image placeholder */}
 <div className="w-full sm:w-56 md:w-64 h-48 sm:h-52 shrink-0">
 <Skeleton width="100%" height="100%" />
 </div>

 {/* Content */}
 <div className="flex flex-col sm:flex-row flex-1 p-4 gap-4">
 <div className="flex flex-col flex-1 gap-2">
 <Skeleton width={100} height={12} />
 <Skeleton width="80%" height={18} />
 <Skeleton width={120} height={12} />
 <Skeleton width="95%" height={12} />
 <Skeleton width="70%" height={12} />
 <div className="flex gap-2 mt-1">
 <Skeleton width={90} height={22} borderRadius={999} />
 <Skeleton width={90} height={22} borderRadius={999} />
 </div>
 </div>

 {/* Price + CTA */}
 <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 min-w-28">
 <Skeleton width={70} height={12} />
 <div className="flex flex-col items-end gap-2">
 <Skeleton width={60} height={12} />
 <Skeleton width={90} height={22} />
 <Skeleton width={90} height={36} borderRadius={12} />
 </div>
 </div>
 </div>
 </div>
 )
}
