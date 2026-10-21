"use client";

import { useState } from "react";
import Reveal from "../ui/Reveal";
import CardPulse from "./CardPulse";
import PackageCard from "./PackageCard";
import { usePackagesWithFlagship } from "@/lib/useFlagship";
import type { Package } from "@/lib/api/packagesApi";

type Filter = "all" | "dec" | "jan";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All offerings" },
  { id: "dec", label: "December 2026" },
  { id: "jan", label: "January 2027" },
];

/** True when the package's availability window overlaps the month (YYYY-MM). Undated packages only show under "All". */
function inMonth(p: Package, ym: string) {
  const from = p.available_from?.slice(0, 7);
  const to = p.available_to?.slice(0, 7);
  if (!from) return false;
  return from <= ym && (to ?? from) >= ym;
}

export default function SeasonOfferings() {
  const { packages, isLoading, isError } = usePackagesWithFlagship();
  const [filter, setFilter] = useState<Filter>("all");
  const list = packages.filter((p) =>
    filter === "all" ? true : inMonth(p, filter === "dec" ? "2026-12" : "2027-01"),
  );

  return (
    <div>
      <div role="group" aria-label="Filter offerings" className="inline-flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-2xl mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`font-montserrat text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors ${filter === f.id ? "bg-[#060504] text-white dark:bg-white dark:text-black" : "text-gray-700 dark:text-gray-300 hover:text-primary"}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {isError && <p className="text-red-600">We couldn&apos;t load offerings right now.</p>}
      <div key={filter} className="content-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading && [1, 2, 3, 4].map((i) => <CardPulse key={i} />)}
        {list.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 70} className="h-full"><PackageCard pkg={p} /></Reveal>
        ))}
      </div>
      {!isLoading && !isError && list.length === 0 && (
        <div className="content-in border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center flex flex-col items-center gap-2">
          <p className="font-raleway font-bold text-lg text-text-primary">December offerings are being finalised</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md">Leave your email below and we&apos;ll tell you the moment they go on sale.</p>
        </div>
      )}
    </div>
  );
}
