"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { usePackagesWithFlagship } from "@/lib/useFlagship";

/** Stable nav URL for the flagship; forwards to its live tour page, or with
 * step="build" (/ghana-experience-2027/build) straight to the trip builder. */
export default function FlagshipRedirect({ step = "" }: { step?: "" | "build" }) {
  const router = useRouter();
  const { flagship, isLoading, isError } = usePackagesWithFlagship();

  useEffect(() => {
    if (flagship) router.replace(`/tour/${flagship.id}${step ? `/${step}` : ""}${window.location.search}`);  // keeps ?mode=stay
  }, [flagship, router, step]);

  const missing = !isLoading && (isError || !flagship);
  return (
    <main className="min-h-[60vh] pt-28 px-4 flex flex-col items-center justify-center gap-4 text-center">
      {missing ? (
        <>
          <h1 className="font-raleway font-bold text-2xl text-text-primary">Ghana Experience 2027</h1>
          <p className="text-gray-700 dark:text-gray-300">We couldn&apos;t open the trip page just now.</p>
          <Link href="/experiences" className="bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl">See all experiences</Link>
        </>
      ) : (
        <>
          <Spinner />
          <p className="text-sm text-gray-700 dark:text-gray-300">Opening the Ghana Experience 2027…</p>
        </>
      )}
    </main>
  );
}
