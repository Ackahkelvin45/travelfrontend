"use client";

/**
 * Searchable country dropdown backed by react-phone-number-input's built-in
 * country metadata (same libphonenumber data the phone input uses, so the two
 * stay consistent). Type-to-filter, keyboard navigable, stores the ISO code's
 * English country name (e.g. "Ghana") — matches the backend's free-text
 * `country` field.
 */

import { useMemo, useState } from "react";
import { getCountries } from "react-phone-number-input";
import countryNames from "react-phone-number-input/locale/en.json";

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select your country",
}: {
  /** ISO 3166-1 alpha-2 code, e.g. "GH" */
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const countries = useMemo(
    () =>
      (getCountries() as (keyof typeof countryNames)[])
        .map((code) => ({
          code,
          name: countryNames[code] ?? String(code),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const selected = countries.find((c) => c.code === value) ?? null;
  const filtered = query.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : countries;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery(""); }}
        className={`w-full flex items-center justify-between gap-2 border rounded-xl px-4 py-3 text-sm font-open-sans text-left outline-none transition-colors ${
          open
            ? "border-primary"
            : "border-gray-200 dark:border-gray-700"
        } bg-white dark:bg-gray-900 text-text-primary`}
      >
        <span className={selected ? "" : "text-gray-300 dark:text-gray-500"}>
          {selected ? selected.name : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country…"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm font-open-sans text-text-primary placeholder-gray-400 outline-none focus:border-primary"
                />
              </div>
            </div>
            <ul className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-gray-400 font-open-sans">No countries found.</li>
              )}
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => { onChange(c.code); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-open-sans hover:bg-primary/5 transition-colors ${
                      c.code === value ? "text-primary font-semibold" : "text-text-primary"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
