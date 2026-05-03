"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoSlider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useGetDestinationDetailQuery } from "@/lib/api/destinationsApi";
import { useGetPackagesQuery, type Package } from "@/lib/api/packagesApi";
import TourListCard from "@/components/destinations/TourListCard";
import TourListCardSkeleton from "@/components/destinations/TourListCardSkeleton";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&q=80";
const SLIDE_INTERVAL = 4000;

function mapPackage(pkg: Package) {
  return {
    id: pkg.id,
    image: pkg.cover_image?.image ?? FALLBACK_IMAGE,
    badge: pkg.is_featured ? "FEATURED" : undefined,
    badgeVariant: (pkg.is_featured ? "featured" : "discount") as
      | "featured"
      | "discount",
    location: pkg.destination,
    title: pkg.title,
    rating: pkg.avg_rating ?? 0,
    reviews: pkg.review_count,
    description: pkg.category_display,
    tags: [pkg.category_display].filter(Boolean),
    duration: `${pkg.duration_days} Day${pkg.duration_days !== 1 ? "s" : ""}`,
    priceShared: parseFloat(pkg.price_shared),
    pricePrivate: parseFloat(pkg.price_private),
    priceVip: parseFloat(pkg.price_vip),
    currency: pkg.currency,
  };
}

function GallerySkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full h-64 sm:h-80 md:h-125 rounded-2xl bg-neutral-200 animate-pulse" />
      <div className="flex gap-2 mt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 h-16 sm:h-20 rounded-xl bg-neutral-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function DestinationDetailClient({ id }: { id: string }) {
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: destination, isLoading, isError } = useGetDestinationDetailQuery(id);
  const { data: packagesData, isLoading: packagesLoading } = useGetPackagesQuery(
    { destinations: id, page_size: 10 },
    { skip: !destination }
  );

  const images = destination?.images ?? [];
  const coverIndex = images.findIndex((img) => img.is_cover);
  const orderedImages =
    coverIndex > 0
      ? [images[coverIndex], ...images.filter((_, i) => i !== coverIndex)]
      : images;

  const total = orderedImages.length;

  const goTo = useCallback(
    (index: number) => setActiveImage(((index % total) + total) % total),
    [total]
  );

  // Auto-advance
  useEffect(() => {
    if (total <= 1 || paused || lightboxOpen) return;
    intervalRef.current = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % total);
    }, SLIDE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [total, paused, lightboxOpen]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const activeImg = orderedImages[activeImage];
  const packages = packagesData?.results ?? [];
  const totalPackages = packagesData?.count ?? destination?.package_count ?? 0;

  if (isError) {
    return (
      <div className="w-full px-4 md:px-10 mt-20 py-6 min-h-screen bg-[#fbfbfb]">
        <p className="text-center py-20 text-gray-500 font-open-sans text-sm">
          Destination not found.{" "}
          <Link href="/destinations" className="text-primary hover:underline">
            Back to destinations
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-10 mt-20 py-6 pb-24 lg:pb-6 bg-[#fbfbfb] min-h-screen">
      {/* Lightbox */}
      <PhotoSlider
        images={orderedImages.map((img, i) => ({ src: img.image, key: i }))}
        visible={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1">
        <nav className="flex items-center gap-1.5 text-xs text-gray-700 font-open-sans min-w-0">
          <a href="/" className="hover:text-primary transition-colors shrink-0">Home</a>
          <span className="shrink-0">{">"}</span>
          <a href="/destinations" className="hover:text-primary transition-colors shrink-0">Destinations</a>
          <span className="shrink-0">{">"}</span>
          <span className="text-text-primary truncate">
            {isLoading ? "…" : destination?.name}
          </span>
        </nav>
        <p className="hidden sm:block text-xs font-semibold font-open-sans text-gray-500 uppercase tracking-wide shrink-0 ml-4">
          discover all things <span className="text-text-primary font-raleway">Africa</span>
        </p>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 mt-4 items-start">
        {/* Left column */}
        <div className="flex-1 min-w-0">

          {/* Gallery */}
          {isLoading ? (
            <GallerySkeleton />
          ) : (
            <div
              className="flex flex-col gap-2"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Main image */}
              <div
                className="relative w-full h-64 sm:h-80 md:h-125 rounded-2xl overflow-hidden bg-neutral-200 group cursor-pointer"
                onClick={() => openLightbox(activeImage)}
              >
                {activeImg ? (
                  <Image
                    key={activeImg.image}
                    src={activeImg.image}
                    alt={activeImg.caption ?? destination?.name ?? ""}
                    fill
                    className="object-cover transition-opacity duration-500"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-700" />
                )}

                {/* Image counter — always visible on mobile, hover on desktop */}
                {total > 1 && (
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-open-sans font-semibold px-2.5 py-1 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {activeImage + 1} / {total}
                  </div>
                )}

                {/* Expand icon — always visible on mobile, hover on desktop */}
                <div className="absolute top-3 right-3 bg-black/50 rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </div>

                {/* Prev / Next arrows — always visible on mobile, hover on desktop */}
                {total > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goTo(activeImage - 1); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 active:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Previous"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goTo(activeImage + 1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 active:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Next"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot indicators — with 44px touch targets via padding */}
                {total > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center">
                    {orderedImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); goTo(i); }}
                        className="p-2 flex items-center justify-center"
                        aria-label={`Go to image ${i + 1}`}
                      >
                        <span className={`block rounded-full transition-all duration-300 ${
                          i === activeImage
                            ? "bg-white w-5 h-1.5"
                            : "bg-white/50 w-1.5 h-1.5"
                        }`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {total > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {orderedImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => goTo(i)}
                      className={`relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        i === activeImage
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.image}
                        alt={img.caption ?? `Image ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                  {/* View all overlay when there are many images */}
                  {total > 6 && (
                    <button
                      onClick={() => openLightbox(0)}
                      className="relative shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 border-transparent bg-neutral-800 flex flex-col items-center justify-center text-white gap-0.5"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                      </svg>
                      <span className="text-xs font-open-sans font-semibold leading-none">All {total}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <div className="h-8 bg-neutral-200 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-4/5 animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-raleway text-text-primary mb-4">
                  {destination?.name}
                </h1>
                <p className="text-sm md:text-base font-open-sans text-gray-600 leading-relaxed whitespace-pre-line">
                  {destination?.description}
                </p>
              </>
            )}
          </div>

          {/* Map */}
          {destination?.map_url && (
            <div className="mt-10">
              <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">
                Location
              </h2>
              <div className="w-full h-64 sm:h-72 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden border border-gray-100">
                <iframe
                  src={destination.map_url}
                  className="w-full h-full block border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${destination.name}`}
                />
              </div>
              {(destination.latitude || destination.longitude) && (
                <p className="text-xs font-open-sans text-gray-400 mt-2">
                  {destination.latitude}, {destination.longitude}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar — desktop only */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                <div className="h-6 bg-neutral-200 rounded w-3/4 animate-pulse" />
                <div className="h-12 bg-neutral-200 rounded-xl animate-pulse" />
                <div className="h-4 bg-neutral-200 rounded w-1/2 animate-pulse" />
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold font-raleway text-text-primary mb-1">
                  {destination?.name}
                </h2>
                <p className="text-sm font-open-sans text-gray-500 mb-5">
                  {totalPackages} tour{totalPackages !== 1 ? "s" : ""} available
                </p>

                <Link
                  href={`/explore?destinations=${id}`}
                  className="block w-full text-center bg-primary hover:bg-primary/90 text-white font-semibold font-open-sans text-sm px-5 py-3 rounded-xl transition-colors"
                >
                  Browse All Tours
                </Link>

                {/* Coordinates */}
                {(destination?.latitude || destination?.longitude) && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-xs font-semibold font-open-sans text-gray-400 uppercase tracking-wide mb-2">
                      Coordinates
                    </p>
                    <div className="flex flex-col gap-1">
                      {destination.latitude && (
                        <div className="flex items-center gap-2 text-xs font-open-sans text-gray-600">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                          Lat: {destination.latitude}
                        </div>
                      )}
                      {destination.longitude && (
                        <div className="flex items-center gap-2 text-xs font-open-sans text-gray-600">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                          Lng: {destination.longitude}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {destination?.map_url && (
                  <a
                    href={destination.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center gap-2 text-xs font-open-sans text-primary hover:underline"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    View on Maps
                  </a>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── Related Tours ────────────────────────────────────────────── */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold font-raleway text-text-primary">
            Tours in {isLoading ? "…" : destination?.name}
          </h2>
          {totalPackages > 0 && (
            <Link
              href={`/explore?destinations=${id}`}
              className="text-sm font-open-sans text-primary hover:underline"
            >
              See all {totalPackages}
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {packagesLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <TourListCardSkeleton key={i} />
              ))
            : packages.map((pkg) => (
                <TourListCard key={pkg.id} {...mapPackage(pkg)} />
              ))}
        </div>

        {!packagesLoading && packages.length === 0 && (
          <p className="text-center py-10 text-gray-500 font-open-sans text-sm">
            No tours available for this destination yet.
          </p>
        )}
      </div>

      {/* ── Mobile sticky CTA ───────────────────────────────────────── */}
      {!isLoading && destination && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white/95 backdrop-blur-sm border-t border-gray-100 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="min-w-0">
              <p className="text-sm font-bold font-raleway text-text-primary truncate">{destination.name}</p>
              <p className="text-xs text-gray-500 font-open-sans">
                {totalPackages} tour{totalPackages !== 1 ? "s" : ""} available
              </p>
            </div>
            <Link
              href={`/explore?destinations=${id}`}
              className="shrink-0 bg-primary text-white font-semibold font-open-sans text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse Tours
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
