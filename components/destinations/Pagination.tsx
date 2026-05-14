"use client";

interface PaginationProps {
 currentPage: number;
 totalPages: number;
 totalResults: number;
 perPage: number;
 onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalResults, perPage, onPageChange }: PaginationProps) {
 const start = (currentPage - 1) * perPage + 1;
 const end = Math.min(currentPage * perPage, totalResults);

 const pages = (): (number | "…")[] => {
 if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
 if (currentPage <= 3) return [1, 2, 3, 4, "…", totalPages];
 if (currentPage >= totalPages - 2) return [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
 return [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
 };

 return (
 <div className="flex flex-col items-end justify-center gap-3 pt-8">
 <div className="flex flex-wrap items-center justify-end gap-1">
 {pages().map((p, i) =>
 p === "…" ? (
 <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-700 dark:text-gray-300 font-open-sans">
 …
 </span>
 ) : (
 <button
 key={p}
 onClick={() => onPageChange(p as number)}
 className={`w-9 h-9 rounded-full text-sm font-open-sans transition-colors ${
 p === currentPage
 ? "bg-primary text-white font-bold"
 : "text-gray-500 dark:text-gray-400 hover:bg-orange-50 hover:text-primary"
 }`}
 >
 {p}
 </button>
 )
 )}
 </div>
 <p className="text-xs text-gray-700 dark:text-gray-300 font-open-sans">
 Showing results {start}–{end} of {totalResults.toLocaleString()}
 </p>
 </div>
 );
}
