"use client";
import { useState, useCallback, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/destinations/FilterSidebar";
import TourListCard from "@/components/destinations/TourListCard";
import TourListCardSkeleton from "@/components/destinations/TourListCardSkeleton";
import Pagination from "@/components/destinations/Pagination";
import { useGetPackagesQuery, type Package } from "@/lib/api/packagesApi";

const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Top Rated", "Most Reviewed"];
const PER_PAGE = 6;
const PRICE_MIN = 0;
const PRICE_MAX = 50000;

const SORT_TO_ORDERING: Record<string, string> = {
 "Featured": "-is_featured",
 "Price: Low to High": "price",
 "Price: High to Low": "-price",
 "Top Rated": "-rating",
 "Most Reviewed": "-review_count",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600&q=80";

function mapPackage(pkg: Package) {
 return {
 id: pkg.id,
 image: pkg.cover_image?.image ?? FALLBACK_IMAGE,
 badge: pkg.is_featured ? "FEATURED" : undefined,
 badgeVariant: (pkg.is_featured ? "featured" : "discount") as "featured" | "discount",
 location: pkg.destination,
 title: pkg.title,
 rating: pkg.avg_rating ?? 0,
 reviews: pkg.review_count,
 description: pkg.category_display,
 tags: [pkg.category_display].filter(Boolean),
 duration: `${pkg.duration_days} Day${pkg.duration_days !== 1 ? "s" : ""}`,
 // Option-based tours (flagship) have no flat price_shared — fall back to
 // from_price (cheapest option) so the card never shows "NaN".
 priceShared: parseFloat(pkg.price_shared ?? pkg.from_price ?? "0"),
 pricePrivate: parseFloat(pkg.price_private ?? "0"),
 priceVip: parseFloat(pkg.price_vip ?? "0"),
 currency: pkg.currency,
 };
}

function DestinationsContent() {
 const searchParams = useSearchParams();

 const [page, setPage] = useState(1);
 const [sort, setSort] = useState("Featured");
 const [dateRange, setDateRange] = useState({
 from: searchParams.get("travel_from") ?? "",
 to: searchParams.get("travel_to") ?? "",
 });
 const [selectedTypes, setSelectedTypes] = useState<string[]>(
 searchParams.get("category") ? [searchParams.get("category")!] : []
 );
 const [search, setSearch] = useState(searchParams.get("search") ?? "");
 const [priceMin, setPriceMin] = useState(PRICE_MIN);
 const [priceMax, setPriceMax] = useState(PRICE_MAX);
 const [duration, setDuration] = useState("");
 const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

 const [, startTransition] = useTransition();

 const { data, isLoading, isError, isFetching } = useGetPackagesQuery({
 page,
 page_size: PER_PAGE,
 ordering: SORT_TO_ORDERING[sort],
 travel_from: dateRange.from || undefined,
 travel_to: dateRange.to || undefined,
 category: selectedTypes[0] || undefined,
 price_min: priceMin > PRICE_MIN ? String(priceMin) : undefined,
 price_max: priceMax < PRICE_MAX ? String(priceMax) : undefined,
 duration: duration || undefined,
 search: search || undefined,
 destinations: selectedDestinations.length ? selectedDestinations.join(",") : undefined,
 });

 const packages = data?.results ?? [];
 const totalResults = data?.count ?? 0;
 const totalPages = Math.ceil(totalResults / PER_PAGE);

 // ── handlers ──────────────────────────────────────────────────────────────

 const handlePageChange = useCallback((newPage: number) => {
 setPage(newPage);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }, []);

 const handleSortChange = useCallback((value: string) => {
 setSort(value);
 setPage(1);
 }, []);

 const handleDateChange = useCallback((range: { from: string; to: string }) => {
 setDateRange(range);
 setPage(1);
 }, []);

 const handleTypeChange = useCallback((types: string[]) => {
 setSelectedTypes(types);
 setPage(1);
 }, []);

 const handlePriceChange = useCallback((min: number, max: number) => {
 startTransition(() => {
 setPriceMin(min);
 setPriceMax(max);
 setPage(1);
 });
 }, []);

 const handleDurationChange = useCallback((value: string) => {
 setDuration(value);
 setPage(1);
 }, []);

 const handleDestinationChange = useCallback((destinations: string[]) => {
 setSelectedDestinations(destinations);
 setPage(1);
 }, []);

 const handleSearchChange = useCallback((value: string) => {
 setSearch(value);
 setPage(1);
 }, []);

 return (
 <div className="w-full px-4 md:px-10 mt-20 py-6">
 {/* Top bar */}
 <div className="flex items-center justify-between mb-1">
 <nav className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-open-sans">
 <a href="/" className="hover:text-primary transition-colors">Home</a>
 <span>{">"}</span>
 <a href="/destinations" className="hover:text-primary transition-colors">Tours</a>
 </nav>
 <p className="text-xs font-semibold font-open-sans text-gray-500 dark:text-gray-400 uppercase tracking-wide">
 explore all things <span className="text-text-primary font-raleway">Africa</span>
 </p>
 </div>

 <h1 className="text-3xl font-bold font-raleway text-text-primary mb-4">
 Explore all things
 </h1>


<div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
 {/* Sidebar */}
 <FilterSidebar
 initialSearch={search}
 onSearchChange={handleSearchChange}
 dateRange={dateRange}
 onDateChange={handleDateChange}
 selectedTypes={selectedTypes}
 onTypeChange={handleTypeChange}
 priceMin={priceMin}
 priceMax={priceMax}
 onPriceChange={handlePriceChange}
 duration={duration}
 onDurationChange={handleDurationChange}
 selectedDestinations={selectedDestinations}
 onDestinationChange={handleDestinationChange}
 />

 {/* Main content */}
 <div className="flex-1 min-w-0">
 {/* Results bar */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
 <p className="text-sm font-open-sans text-gray-500">
 {isLoading ? (
 <span className="text-gray-300">Loading…</span>
 ) : (
 <>
 <strong className="text-text-primary font-raleway">{totalResults.toLocaleString()}</strong> results
 </>
 )}
 </p>
 <div className="flex items-center gap-2 text-sm font-open-sans text-gray-500">
 <span>Sort by:</span>
 <select
 value={sort}
 onChange={(e) => handleSortChange(e.target.value)}
 className="text-sm font-semibold font-open-sans text-text-primary border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 outline-none focus:border-primary bg-white dark:bg-gray-800 cursor-pointer"
 >
 {SORT_OPTIONS.map((o) => (
 <option key={o}>{o}</option>
 ))}
 </select>
 </div>
 </div>

 {/* Error state */}
 {isError && (
 <div className="text-center py-16 text-gray-700 dark:text-gray-300 font-open-sans text-sm">
 Failed to load packages. Please try again.
 </div>
 )}

 {/* Tour cards */}
 <div className="flex flex-col gap-4">
 {isLoading || isFetching
 ? Array.from({ length: PER_PAGE }).map((_, i) => (
 <TourListCardSkeleton key={i} />
 ))
 : packages.map((pkg) => (
 <TourListCard key={pkg.id} {...mapPackage(pkg)} />
 ))}
 </div>

 {/* Empty state */}
 {!isLoading && !isFetching && !isError && packages.length === 0 && (
 <div className="text-center py-16 text-gray-700 dark:text-gray-300 font-open-sans text-sm">
 No packages found for the selected filters.
 </div>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <Pagination
 currentPage={page}
 totalPages={totalPages}
 totalResults={totalResults}
 perPage={PER_PAGE}
 onPageChange={handlePageChange}
 />
 )}
 </div>
 </div>
 </div>
 );
}

export default function DestinationsPage() {
 return (
 <Suspense>
 <DestinationsContent />
 </Suspense>
 );
}
