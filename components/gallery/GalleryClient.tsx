"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetGalleryQuery, type GalleryImage } from "@/lib/api/galleryApi";

type FilterType = "all" | "package" | "destination";

const PAGE_SIZE = 15;

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Packages", value: "package" },
  { label: "Destinations", value: "destination" },
];

export default function GalleryClient() {
  const [type, setType] = useState<FilterType>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetGalleryQuery({ type, page, page_size: PAGE_SIZE });

  const images = data?.results ?? [];
  const totalPages = Math.ceil((data?.count ?? 0) / PAGE_SIZE);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const col0 = images.filter((_, i) => i % 3 === 0);
  const col1 = images.filter((_, i) => i % 3 === 1);
  const col2 = images.filter((_, i) => i % 3 === 2);

  function changeType(t: FilterType) {
    setType(t);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Filter bar */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center gap-8 px-5 py-3.5 max-w-[1600px] mx-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => changeType(f.value)}
              className={`text-[12px] font-open-sans uppercase  font-medium transition-all ${
                type === f.value
                  ? "text-black border-b border-black pb-0.5"
                  : "text-black/30 hover:text-black/60"
              }`}
            >
              {f.label}
            </button>
          ))}
          {data && (
            <span className="ml-auto text-text-primary text-sm  font-open-sans uppercase tracking-widest tabular-nums">
              {data.count} items
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      <div
        className={`flex gap-0.5 px-0.5 pb-0.5 transition-opacity duration-300 max-w-[1600px] mx-auto ${
          isFetching ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-0.5 animate-gallery-up">
          {isLoading
            ? <SkeletonCol heights={[380, 260, 320, 220]} />
            : col0.map((img) => <GalleryCell key={img.id} img={img} />)}
        </div>

        {/* Center column */}
        <div className="flex-1 flex flex-col gap-0.5 animate-gallery-mid">
          {isLoading
            ? <SkeletonCol heights={[260, 340, 220, 300]} />
            : col1.map((img) => <GalleryCell key={img.id} img={img} />)}
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-0.5 animate-gallery-down">
          {isLoading
            ? <SkeletonCol heights={[280, 340, 220, 300]} />
            : col2.map((img) => <GalleryCell key={img.id} img={img} />)}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="py-20 border-t border-black/5 bg-neutral-50/50">
        <div className="max-w-[1600px] mx-auto px-5 flex flex-col items-center gap-6">
          {totalPages > 1 && (
            <p className="text-text-primary text-[10px] font-open-sans uppercase tracking-[0.3em]">
              Page {page} of {totalPages}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev || isLoading}
              className={`group px-8 py-3 text-[10px] font-open-sans uppercase tracking-[0.2em] transition-all duration-300 border ${
                hasPrev 
                  ? "border-black/10 text-black hover:bg-black hover:text-white hover:border-black" 
                  : "border-black/5 text-black/10 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || isLoading}
              className={`group px-8 py-3 text-[10px] font-open-sans uppercase tracking-[0.2em] transition-all duration-300 border ${
                hasNext 
                  ? "border-black/10 text-black hover:bg-black hover:text-white hover:border-black" 
                  : "border-black/5 text-black/10 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>

          {!hasNext && !hasPrev && !isLoading && images.length === 0 && (
            <p className="text-black/30 text-xs font-open-sans text-center">
              No results found in this category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryCell({ img }: { img: GalleryImage }) {
  const href =
    img.type === "package"
      ? `/tour/${img.source_id}`
      : `/destinations/${img.source_id}`;

  return (
    <Link href={href} className="relative block overflow-hidden group bg-neutral-100">
      <Image
        src={img.image}
        alt={img.caption || img.source_name}
        width={800}
        height={600}
        className="w-full h-auto object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
        sizes="33vw"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <p className="text-white font-raleway font-bold text-sm tracking-tight leading-snug line-clamp-1">
          {img.source_name}
        </p>
        <p className="text-white/60 font-open-sans text-[9px] uppercase tracking-[0.2em] mt-1 capitalize">
          {img.type}
        </p>
      </div>
    </Link>
  );
}

function SkeletonCol({ heights }: { heights: number[] }) {
  return (
    <>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-full bg-neutral-100 animate-pulse shrink-0"
          style={{ height: h }}
        />
      ))}
    </>
  );
}
