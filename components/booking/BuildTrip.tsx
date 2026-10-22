"use client";

/** Its own step after the tour page (canvas: Experience → "Build Your Trip"):
 * the builder and the live summary, then Continue to Details → checkout. */

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { TripBuilder, TripSummary, useTripBuilder } from "@/components/booking/TripBuilder";
import { useGetPackageDetailQuery } from "@/lib/api/packagesApi";
import { fmtDateRange } from "@/lib/format";

export default function BuildTrip({ id }: { id: string }) {
  const router = useRouter();
  const { data: pkg, isLoading, isError } = useGetPackageDetailQuery(id);
  const isComponent = pkg?.pricing_model === "component";
  const trip = useTripBuilder(id, pkg?.title ?? "", isComponent);

  // Only component-priced trips have a builder; others book on the tour page.
  useEffect(() => {
    if (pkg && !isComponent) router.replace(`/tour/${id}`);
  }, [pkg, isComponent, id, router]);

  if (isLoading || (pkg && !isComponent) || (isComponent && !trip.matrix)) {
    return <main className="min-h-[60vh] mt-20 flex items-center justify-center"><Spinner /></main>;
  }
  if (isError || !pkg) {
    return (
      <main className="min-h-[60vh] mt-20 px-4 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">We couldn&apos;t open this trip just now.</p>
        <Link href="/experiences" className="text-sm font-semibold text-[#8A6420] dark:text-primary underline">See all experiences</Link>
      </main>
    );
  }

  return (
    <main className="content-in w-full mt-20 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-1.5 items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-primary">Home</Link><span aria-hidden>/</span>
          <Link href={`/tour/${id}`} className="hover:text-primary">{pkg.title}</Link><span aria-hidden>/</span>
          <span aria-current="page">Build your trip</span>
        </nav>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {pkg.title} · {fmtDateRange(pkg.available_from, pkg.available_to)}
        </p>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-4 pb-20 flex flex-wrap gap-10 items-start">
        <div className="flex-[999_1_600px] min-w-0">
          <TripBuilder trip={trip} />
        </div>
        <aside className="flex-[1_1_340px] min-w-0 lg:sticky lg:top-24">
          <TripSummary trip={trip} />
        </aside>
      </div>
    </main>
  );
}
