"use client";
import { useState } from "react";

const TOUR_TYPES = [
  "Luxury Travel Packages",
  "Nightlife & Entertainment",
  "Cultural Immersion",
  "Culinary Experiences",
  "Fashion & Lifestyle Access",
  "Corporate & Group Experiences",
  "Bespoke Concierge Services",
];

const DURATIONS = ["1 Day", "2–3 Days", "4–7 Days", "1–2 Weeks", "2+ Weeks"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Thai", "Japanese"];
const RATINGS = [5, 4, 3, 2];
const SPECIALS = ["Free Cancellation", "Best Price Guarantee", "Private Tours", "Small Group"];

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

interface FilterSidebarProps {
  dateRange: { from: string; to: string };
  onDateChange: (range: { from: string; to: string }) => void;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

export default function FilterSidebar({ dateRange, onDateChange, selectedTypes, onTypeChange }: FilterSidebarProps) {
  const visibleTypes = TOUR_TYPES;

  const toggleType = (type: string) => {
    onTypeChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter((t) => t !== type)
        : [...selectedTypes, type]
    );
  };

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "";

  return (
    <aside className="w-[] shrink-0">
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
          {visibleTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="accent-primary w-4 h-4 rounded cursor-pointer"
              />
              <span className="text-sm font-open-sans text-gray-600">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Price */}
      <CollapsibleSection title="Filter Price">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-open-sans text-gray-500 mb-1">
            <span>$0</span><span>$2,000</span>
          </div>
          <input type="range" min={0} max={2000} defaultValue={1000}
            className="w-full accent-primary" />
        </div>
      </CollapsibleSection>

      {/* Duration */}
      <CollapsibleSection title="Duration">
        <div className="flex flex-col gap-2">
          {DURATIONS.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer" />
              <span className="text-sm font-open-sans text-gray-600">{d}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      


    </aside>
  );
}
