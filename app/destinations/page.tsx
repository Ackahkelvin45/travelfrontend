"use client";
import { useState } from "react";
import FilterSidebar from "@/components/destinations/FilterSidebar";
import TourListCard from "@/components/destinations/TourListCard";
import Pagination from "@/components/destinations/Pagination";
import { tours } from "@/data/tours";

const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Top Rated", "Most Reviewed"];
const PER_PAGE = 6;
const TOTAL_RESULTS = 1415;
const TOTAL_PAGES = 20;

export default function DestinationsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("Featured");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  return (
    <div className="w-full px-10 mt-20 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-1">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-open-sans">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>{">"}</span>
          <a href="/destinations" className="hover:text-primary transition-colors">Tours</a>
        </nav>
        <p className="text-xs font-semibold font-open-sans text-gray-500 uppercase tracking-wide">
          explore all things <span className="text-text-primary font-raleway">Africa</span>
        </p>
      </div>

      <h1 className="text-3xl font-bold font-raleway text-text-primary mb-6">
        Explore all things 
      </h1>

      <div className="flex gap-8 items-start">
        {/* Sidebar */}
        <FilterSidebar
          dateRange={dateRange}
          onDateChange={setDateRange}
          selectedTypes={selectedTypes}
          onTypeChange={setSelectedTypes}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-open-sans text-gray-500">
              <strong className="text-text-primary font-raleway">{TOTAL_RESULTS.toLocaleString()}</strong> results
            </p>
            <div className="flex items-center gap-2 text-sm font-open-sans text-gray-500">
              <span>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm font-semibold font-open-sans text-text-primary border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-primary bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tour cards */}
          <div className="flex flex-col gap-4">
            {tours.map((tour) => (
              <TourListCard key={tour.id} {...tour} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={TOTAL_PAGES}
            totalResults={TOTAL_RESULTS}
            perPage={PER_PAGE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
