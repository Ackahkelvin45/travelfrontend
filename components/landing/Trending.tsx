"use client";

import { useRef, useState } from "react";
import Card from "../ecommerce/Card";
import { useGetTrendingPackagesQuery } from "@/lib/api/packagesApi";
import CardSkeleton from "../ecommerce/CardSkeleton";
import Reveal from "../ui/Reveal";

export default function Trending() {
 const scrollRef = useRef<HTMLDivElement>(null);
 const [category, setCategory] = useState("all");

 const { data, isLoading, isError } = useGetTrendingPackagesQuery();
 
 // Safely handle both array and paginated response formats
 const trendingPackages = Array.isArray(data) ? data : (data as any)?.results || [];

 const scroll = (dir: "left" | "right") => {
 if (!scrollRef.current) return;
 scrollRef.current.scrollBy({ left: dir === "left" ? -310 : 310, behavior: "smooth" });
 };

 return (
 <section className="w-full px-4 md:px-10 lg:px-20 py-10 md:py-16 bg-background mt-40 md:mt-25">
 {/* Header */}
 <Reveal className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
 <h2 className="text-3xl font-bold font-raleway text-text-primary">
 Trending
 </h2>
 <select 
 value={category}
 onChange={(e) => setCategory(e.target.value)}
 className="border border-text-primary text-text-primary bg-transparent px-6 py-2.5 rounded-xl text-sm font-semibold font-montserrat transition-colors"
 >
 <option value="all">All Categories</option>
 </select>
 </Reveal>

 {/* Carousel */}
 <div className="relative">
 <button
 onClick={() => scroll("left")}
 className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 bg-white dark:bg-gray-800 rounded-full w-12 h-12 shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
 >
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
 <polyline points="15 18 9 12 15 6" />
 </svg>
 </button>

 <div
 ref={scrollRef}
 className="flex gap-5 overflow-x-auto pb-2 px-10 scroll-smooth"
 style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
 >
 {isLoading && (
 <>
 {[1, 2, 3, 4].map((i) => (
 <CardSkeleton key={i} />
 ))}
 </>
 )}
 {isError && <p className="text-red-500 py-10 w-full text-center">Failed to load trending packages.</p>}
 
 {!isLoading && !isError && trendingPackages.length === 0 && (
 <p className="text-gray-500 dark:text-gray-400 py-10 w-full text-center">No trending packages found.</p>
 )}

 {!isLoading && !isError && trendingPackages.map((tour: any, index: number) => (
 <Reveal key={tour.id} delay={Math.min(index, 5) * 70} className="shrink-0">
 <Card
 id={tour.id}
 image={tour.cover_image?.image ?? "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600&q=80"}
 location={tour.destination}
 title={tour.title}
 rating={tour.avg_rating ?? 0}
 reviews={tour.review_count ?? 0}
 days={tour.duration_days}
 price={parseFloat(tour.price_shared)}
 currency={tour.currency}
 />
 </Reveal>
 ))}
 </div>

 <button
 onClick={() => scroll("right")}
 className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 bg-white dark:bg-gray-800 rounded-full w-12 h-12 shadow-lg flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
 >
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
 <polyline points="9 18 15 12 9 6" />
 </svg>
 </button>
 </div>
 </section>
 );
}
