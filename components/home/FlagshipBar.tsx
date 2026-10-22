import Link from "next/link";
import type { FlagshipFacts } from "@/lib/content/flagship";

/** White bar overlapping the hero: the flagship at a glance (live name, dates
 * and price) with Book Now. Reads as a summary line, not a search form. */
export default function FlagshipBar({ facts }: { facts: FlagshipFacts }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 md:px-7 py-4">
      <p className="text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed text-center md:text-left">
        <span className="block md:inline font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#8A6420] dark:text-primary md:mr-2">Flagship</span>
        <strong className="block md:inline font-raleway font-bold text-text-primary">{facts.name}</strong>
        <span aria-hidden className="hidden md:inline mx-2 text-gray-300 dark:text-gray-600">·</span>
        <span className="block md:inline whitespace-nowrap">{facts.dates}</span>
        {facts.corePrice && (
          <>
            <span aria-hidden className="hidden md:inline mx-2 text-gray-300 dark:text-gray-600">·</span>
            <span className="block md:inline whitespace-nowrap">from <strong className="font-montserrat text-text-primary">{facts.corePrice}</strong> per traveller</span>
          </>
        )}
      </p>
      <Link href="/ghana-experience-2027/build" className="shrink-0 text-center bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">
        Book Now
      </Link>
    </div>
  );
}
