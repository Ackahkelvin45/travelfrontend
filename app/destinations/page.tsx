"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi";

const PER_PAGE = 12;

// Repeating 12-slot bento pattern matching the Trisog reference layout:
// Group A: [1x1][1x1][1x1][1x2 tall-right] / [2x1 wide][1x1]
// Group B: [1x2 tall-left][1x1][1x1][1x1] / [2x1 wide][1x1]
const GRID_CLASSES: string[] = [
  "",                              // 0  – normal
  "",                              // 1  – normal
  "",                              // 2  – normal
  "lg:col-start-4 lg:row-span-2", // 3  – tall, pinned to col 4
  "lg:col-span-2",                 // 4  – wide (cols 1-2)
  "",                              // 5  – normal (col 3)
  "lg:row-span-2",                 // 6  – tall left
  "",                              // 7  – normal
  "",                              // 8  – normal
  "",                              // 9  – normal
  "lg:col-span-2",                 // 10 – wide
  "",                              // 11 – normal
];

function getGridClass(index: number): string {
  return GRID_CLASSES[index % GRID_CLASSES.length] ?? "";
}

function DestinationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 animate-pulse min-h-55 md:min-h-65 ${className ?? ""}`}
    />
  );
}

function DestinationCard({
  id,
  name,
  packageCount,
  coverImage,
  className,
}: {
  id: string;
  name: string;
  packageCount: number;
  coverImage?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/destinations/${id}`}
      className={`relative rounded-2xl overflow-hidden group cursor-pointer block min-h-55 md:min-h-65 ${className ?? ""}`}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-700" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-white font-bold text-base md:text-lg font-raleway drop-shadow leading-tight italic">
          {name}
        </p>
        <p className="text-white/75 text-xs font-open-sans mt-0.5">
          {packageCount.toLocaleString()} {packageCount === 1 ? "Tour" : "Tours"}
        </p>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  const withEllipsis: (number | "…")[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - (visible[i - 1] as number) > 1) withEllipsis.push("…");
    withEllipsis.push(p);
  });

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg text-sm font-open-sans text-gray-500 dark:text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← Prev
      </button>
      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-open-sans transition-colors ${
              p === currentPage
                ? "bg-primary text-white font-semibold"
                : "text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg text-sm font-open-sans text-gray-500 dark:text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

export default function DestinationsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Fetch a large set; client-side paginate for the bento grid
  const { data, isLoading, isError } = useGetDestinationsQuery({ page_size: 100 });

  const allDestinations = data?.results ?? [];

  const filtered = useMemo(
    () =>
      search
        ? allDestinations.filter((d) =>
            d.name.toLowerCase().includes(search.toLowerCase())
          )
        : allDestinations,
    [allDestinations, search]
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full px-4 md:px-10 mt-20 py-6 min-h-screen">
      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <nav className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-open-sans">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span>{">"}</span>
          <span className="text-text-primary">Destinations</span>
        </nav>
        <p className="text-xs font-semibold font-open-sans text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          discover all things <span className="text-text-primary font-raleway">Africa</span>
        </p>
      </div>

      <h1 className="text-3xl font-bold font-raleway text-text-primary mb-4">
        All Destinations
      </h1>

      {/* ── Results / search bar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <p className="text-sm font-open-sans text-gray-500">
          {isLoading ? (
            <span className="text-gray-300">Loading…</span>
          ) : (
            <>
              <strong className="text-text-primary font-raleway">{filtered.length}</strong> destinations
            </>
          )}
        </p>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search destinations…"
            className="w-full pl-8 pr-8 py-2 text-xs font-open-sans text-text-primary border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div>
        {isError && (
          <p className="text-center py-16 text-gray-500 dark:text-gray-400 font-open-sans text-sm">
            Failed to load destinations. Please try again.
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[220px] md:auto-rows-[260px] gap-3 md:gap-4">
          {isLoading
            ? GRID_CLASSES.map((cls, i) => (
                <DestinationSkeleton key={i} className={cls} />
              ))
            : paged.map((dest, index) => {
                const coverImage =
                  dest.images.find((img) => img.is_cover)?.image ??
                  dest.images[0]?.image;
                return (
                  <DestinationCard
                    key={dest.id}
                    id={dest.id}
                    name={dest.name}
                    packageCount={dest.package_count}
                    coverImage={coverImage}
                    className={getGridClass(index)}
                  />
                );
              })}
        </div>

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm">
              {search ? `No destinations found for "${search}".` : "No destinations available."}
            </p>
            {search && (
              <button onClick={handleClear} className="mt-3 text-primary text-sm font-open-sans hover:underline">
                Clear search
              </button>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
