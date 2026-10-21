"use client";

import Link from "next/link";
import { TRIP } from "@/lib/content/site";

const Pin = () => (
  <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14 8 14C8 14 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#C9A96E" strokeWidth="1.2" /><circle cx="8" cy="6" r="1.5" stroke="#C9A96E" strokeWidth="1.2" /></svg>
);
const Cal = () => (
  <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#C9A96E" strokeWidth="1.2" /><path d="M5 1.5V4M11 1.5V4M2 7H14" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" /></svg>
);
const Tag = () => (
  <svg aria-hidden="true" className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none"><path d="M3 5H13M3 8H10M3 11H8" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" /></svg>
);

/** White bar overlapping the hero — same shape as the old search bar, now the flagship summary. */
export default function FlagshipBar() {
  const items = [
    { icon: <Pin />, label: "Flagship", value: TRIP.name },
    { icon: <Cal />, label: "When", value: TRIP.dates },
    { icon: <Tag />, label: "From", value: `$${TRIP.corePrice} per traveller` },
  ];
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center px-4 md:px-6 py-4 gap-4 md:gap-2">
      {items.map((it, i) => (
        <div key={it.label} className="flex items-center gap-3 md:flex-1 min-w-0">
          {i > 0 && <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700 mr-3" />}
          {it.icon}
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-600 dark:text-gray-400">{it.label}</span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{it.value}</span>
          </div>
        </div>
      ))}
      <Link href="/ghana-experience-2027" className="text-center bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">
        Book Now
      </Link>
    </div>
  );
}
