'use client'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store/store'

export default function CardSkeleton() {
 const isDark = useSelector((state: RootState) => state.theme.mode === 'dark')
 return (
 <SkeletonTheme
   baseColor={isDark ? '#1f2937' : '#e5e7eb'}
   highlightColor={isDark ? '#374151' : '#f3f4f6'}
 >
 <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md flex flex-col min-w-72 max-w-72 shrink-0 overflow-hidden">
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

 <hr className="border-gray-100 dark:border-gray-800 my-1" />

 <div className="flex justify-between items-center">
 <Skeleton width={60} height={14} />
 <Skeleton width={100} height={18} />
 </div>
 </div>
 </div>
 </SkeletonTheme>
 )
}
