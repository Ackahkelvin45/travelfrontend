"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const TOUR_TYPES = [
  { value: "", label: "All tours" },
  { value: "luxury_travel", label: "Luxury Travel" },
  { value: "nightlife", label: "Nightlife & Entertainment" },
  { value: "cultural", label: "Cultural Immersion" },
  { value: "culinary", label: "Culinary Experiences" },
  { value: "fashion", label: "Fashion & Lifestyle" },
  { value: "corporate", label: "Corporate & Group" },
  { value: "bespoke", label: "Bespoke Concierge" },
];

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HeroSearch() {
  const router = useRouter();
  const [where, setWhere] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tourType, setTourType] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const dateLabel =
    fromDate || toDate
      ? [fromDate && fmtDate(fromDate), toDate && fmtDate(toDate)].filter(Boolean).join(" ~ ")
      : "Select dates";

  const typeLabel = TOUR_TYPES.find((t) => t.value === tourType)?.label ?? "All tours";

  function handleSearch() {
    const params = new URLSearchParams();
    if (where.trim()) params.set("search", where.trim());
    if (fromDate) params.set("travel_from", fromDate);
    if (toDate) params.set("travel_to", toDate);
    if (tourType) params.set("category", tourType);
    router.push(`/destinations${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center px-4 md:px-6 py-4 gap-4 md:gap-2">
      {/* Where */}
      <div className="flex items-center gap-3 w-full md:flex-1 min-w-0">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 9.5 8 14 8 14C8 14 12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="#c9a96e" strokeWidth="1.2" />
          <circle cx="8" cy="6" r="1.5" stroke="#c9a96e" strokeWidth="1.2" />
        </svg>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">Where</span>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search destinations"
            className="text-sm text-gray-700 dark:text-gray-200 font-open-sans outline-none bg-transparent w-full placeholder-gray-400 dark:placeholder-gray-500 truncate"
          />
        </div>
      </div>

      <div className="h-px w-full md:w-px md:h-8 bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* When */}
      <div ref={dateRef} className="flex items-center gap-3 w-full md:flex-1 min-w-0 relative">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#c9a96e" strokeWidth="1.2" />
          <path d="M5 1.5V4M11 1.5V4M2 7H14" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">When</span>
          <button
            onClick={() => setDateOpen((v) => !v)}
            className="text-sm text-gray-700 dark:text-gray-200 font-open-sans text-left truncate"
          >
            {dateLabel}
          </button>
        </div>

        {dateOpen && (
          <div className="absolute top-full left-0 w-full md:w-auto mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 z-50 flex flex-col sm:flex-row gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="text-sm font-open-sans text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">To</label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="text-sm font-open-sans text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-px w-full md:w-px md:h-8 bg-gray-200 dark:bg-gray-700 shrink-0" />

      {/* Tour Type */}
      <div ref={typeRef} className="flex items-center gap-3 w-full md:flex-1 min-w-0 relative">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M3 5H13M3 8H10M3 11H8" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">Tour Type</span>
          <button
            onClick={() => setTypeOpen((v) => !v)}
            className="text-sm text-gray-700 dark:text-gray-200 font-open-sans text-left truncate"
          >
            {typeLabel}
          </button>
        </div>

        {typeOpen && (
          <div className="absolute top-full left-0 w-full md:w-auto md:min-w-[210px] mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
            {TOUR_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTourType(t.value); setTypeOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm font-open-sans hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  tourType === t.value ? "text-primary font-semibold" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSearch}
        className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-xl text-sm font-semibold font-montserrat hover:opacity-90 transition-opacity shrink-0"
      >
        Search
      </button>
    </div>
  );
}
