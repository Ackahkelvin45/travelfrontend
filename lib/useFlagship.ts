"use client";

import { useGetPackagesQuery, type Package } from "@/lib/api/packagesApi";
import { FLAGSHIP_SLUG } from "@/lib/content/site";

/**
 * Active Ghana packages with the flagship (Michael Blackson Ghana Experience)
 * pulled out and listed first, per the change request.
 */
export function usePackagesWithFlagship() {
  const { data, isLoading, isError } = useGetPackagesQuery({ page_size: 50 });
  const all: Package[] = data?.results ?? [];
  const flagship = all.find((p) => p.slug === FLAGSHIP_SLUG) ?? null;
  const others = all.filter((p) => p !== flagship);
  return { flagship, packages: flagship ? [flagship, ...others] : others, isLoading, isError };
}
