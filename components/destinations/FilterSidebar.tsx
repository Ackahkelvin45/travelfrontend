"use client";
import { useState, useCallback, useRef, useEffect } from "react";

const TOUR_TYPES: { value: string; label: string }[] = [
  { value: "luxury_travel", label: "Luxury Travel" },
  { value: "nightlife",     label: "Nightlife & Entertainment" },
  { value: "cultural",      label: "Cultural Immersion" },
  { value: "culinary",      label: "Culinary Experiences" },
  { value: "fashion",       label: "Fashion & Lifestyle" },
  { value: "corporate",     label: "Corporate & Group" },
  { value: "bespoke",       label: "Bespoke Concierge" },
];

const DURATION_OPTIONS = [
  { label: "1 Day",      value: "1" },
  { label: "2–3 Days",   value: "3" },
  { label: "4–7 Days",   value: "7" },
  { label: "1–2 Weeks",  value: "14" },
  { label: "2+ Weeks",   value: "15" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 50000;

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold font-raleway text-text-primary"
      >
        {title}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/** Dual-handle range slider driven by pointer events — no stacked-input z-index issues */
function DualRangeSlider({
  min,
  max,
  low,
  high,
  currency,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  currency?: string;
  onChange: (low: number, high: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<"low" | "high" | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  /** Convert a clientX position to the nearest integer value within [min, max] */
  const clientXToValue = (clientX: number): number => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(ratio * (max - min) + min);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const val = clientXToValue(e.clientX);
    const lowDist = Math.abs(val - low);
    const highDist = Math.abs(val - high);
    // Pick the closer thumb; prefer low on a tie
    dragging.current = lowDist <= highDist ? "low" : "high";
    // Capture so the drag keeps working even outside the element
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    // Immediately snap the chosen thumb
    if (dragging.current === "low") {
      onChange(Math.min(val, high - 1), high);
    } else {
      onChange(low, Math.max(val, low + 1));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const val = clientXToValue(e.clientX);
    if (dragging.current === "low") {
      onChange(Math.min(val, high - 1), high);
    } else {
      onChange(low, Math.max(val, low + 1));
    }
  };

  const handlePointerUp = () => {
    dragging.current = null;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Interactive track */}
      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Base track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
        {/* Active range highlight */}
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        {/* Low thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary shadow -translate-x-1/2 transition-shadow hover:shadow-md"
          style={{ left: `${pct(low)}%` }}
        />
        {/* High thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-primary shadow -translate-x-1/2 transition-shadow hover:shadow-md"
          style={{ left: `${pct(high)}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs font-open-sans text-gray-500">
        <span>
          {currency ?? "$"} {low.toLocaleString()}
        </span>
        <span>
          {currency ?? "$"} {high.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export interface FilterSidebarProps {
  /** Search */
  initialSearch?: string;
  onSearchChange: (value: string) => void;

  /** Date range */
  dateRange: { from: string; to: string };
  onDateChange: (range: { from: string; to: string }) => void;

  /** Category / tour type */
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;

  /** Price range */
  priceMin: number;
  priceMax: number;
  onPriceChange: (min: number, max: number) => void;

  /** Duration (max days value as string, e.g. "7") */
  duration: string;
  onDurationChange: (value: string) => void;
}

export default function FilterSidebar({
  initialSearch = "",
  onSearchChange,
  dateRange,
  onDateChange,
  selectedTypes,
  onTypeChange,
  priceMin,
  priceMax,
  onPriceChange,
  duration,
  onDurationChange,
}: FilterSidebarProps) {
  const [searchInput, setSearchInput] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 3000);
    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const handleClearSearch = () => {
    setSearchInput("");
    onSearchChange("");
  };

  const toggleType = useCallback(
    (value: string) => {
      onTypeChange(
        selectedTypes.includes(value)
          ? selectedTypes.filter((t) => t !== value)
          : [...selectedTypes, value]
      );
    },
    [selectedTypes, onTypeChange]
  );

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "";

  return (
    <aside className="w-full lg:w-72 shrink-0">
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tours, destinations…"
          className="w-full pl-8 pr-8 py-2 text-xs font-open-sans text-text-primary border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-white"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Date picker */}
      <div className="bg-primary rounded-xl p-4 mb-4">
        <p className="text-white text-xs font-semibold font-open-sans mb-3">When are you traveling?</p>
        <div className="bg-white rounded-lg px-3 py-2 text-sm font-open-sans text-text-primary text-center">
          {dateRange.from && dateRange.to
            ? `${formatDate(dateRange.from)} – ${formatDate(dateRange.to)}`
            : "Select dates"}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateChange({ ...dateRange, from: e.target.value })}
            className="w-full text-xs bg-white/20 text-white placeholder-white/70 rounded px-2 py-1 outline-none border border-white/30 [color-scheme:dark]"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateChange({ ...dateRange, to: e.target.value })}
            className="w-full text-xs bg-white/20 text-white placeholder-white/70 rounded px-2 py-1 outline-none border border-white/30 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Tour Type */}
      <div className="border-t border-gray-100 py-4">
        <p className="text-sm font-semibold font-raleway text-text-primary mb-3">Event Type</p>
        <div className="flex flex-col gap-2">
          {TOUR_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(value)}
                onChange={() => toggleType(value)}
                className="accent-primary w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm font-open-sans text-gray-600">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Price — dual slider */}
      <CollapsibleSection title="Filter Price" defaultOpen>
        <DualRangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          low={priceMin}
          high={priceMax}
          onChange={onPriceChange}
        />
      </CollapsibleSection>

      {/* Duration */}
      <CollapsibleSection title="Duration">
        <div className="flex flex-col gap-2">
          {DURATION_OPTIONS.map((d) => (
            <label key={d.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="duration"
                checked={duration === d.value}
                onChange={() => onDurationChange(d.value)}
                className="accent-primary w-4 h-4 cursor-pointer"
              />
              <span className="text-sm font-open-sans text-gray-600">{d.label}</span>
            </label>
          ))}
          {duration && (
            <button
              onClick={() => onDurationChange("")}
              className="text-xs text-primary font-open-sans mt-1 text-left hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </CollapsibleSection>
    </aside>
  );
}
