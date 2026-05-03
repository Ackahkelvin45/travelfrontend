"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetDestinationsQuery } from "@/lib/api/destinationsApi";

const GRID_CLASSES = [
  "",
  "lg:col-span-2",
  "lg:col-start-4 lg:row-span-2",
  "",
  "",
  "",
];

function DestinationSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative rounded-xl md:rounded-2xl overflow-hidden bg-neutral-800 animate-pulse ${className ?? ""}`}
    />
  );
}

export default function TrendingDestinations() {
  const { data, isLoading, isError } = useGetDestinationsQuery({ page_size: 6 });

  const destinations = data?.results?.slice(0, 6) ?? [];

  return (
    <section className="w-full px-4 md:px-10 lg:px-20 py-10 mt-20 md:py-16">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold font-raleway text-text-primary">
          Trending Destinations
        </h2>
        <Link
          href="/destinations"
          className="text-text-primary text-sm font-medium hover:underline transition-colors"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] lg:auto-rows-[280px] gap-3 md:gap-4">
        {isLoading &&
          GRID_CLASSES.map((cls, i) => (
            <DestinationSkeleton key={i} className={cls} />
          ))}

        {isError && (
          <p className="col-span-2 lg:col-span-4 text-center text-red-500 py-10">
            Failed to load destinations.
          </p>
        )}

        {!isLoading &&
          !isError &&
          destinations.map((dest, index) => {
            const coverImage =
              dest.images.find((img) => img.is_cover) ?? dest.images[0];

            return (
              <div
                key={dest.id}
                className={`relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer ${GRID_CLASSES[index] ?? ""}`}
              >
                {coverImage ? (
                  <Image
                    src={coverImage.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-700" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-semibold text-sm md:text-base font-raleway drop-shadow">
                  {dest.name}{" "}
                  <span className="font-normal opacity-80">
                    ({dest.package_count})
                  </span>
                </span>
              </div>
            );
          })}
      </div>
    </section>
  );
}
