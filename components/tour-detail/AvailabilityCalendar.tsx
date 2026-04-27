"use client";
import { useState } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface AvailabilityCalendarProps {
  availableDates?: string[]; // ISO date strings e.g. ["2025-03-15"]
}

export default function AvailabilityCalendar({ availableDates = [] }: AvailabilityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const toISO = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <section className="py-6 border-b border-gray-100">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Availability Calendar</h2>
      <div className="max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 hover:text-primary transition-colors text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="text-sm font-semibold font-raleway text-text-primary">
            {MONTHS[month]}, {year}
          </p>
          <button onClick={nextMonth} className="p-1 hover:text-primary transition-colors text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold font-open-sans text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-y-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const iso = toISO(day);
            const isAvailable = availableDates.length === 0 || availableDates.includes(iso);
            const isSelected = selected === iso;
            const isPast = new Date(iso) < new Date(today.toDateString());
            return (
              <button
                key={day}
                disabled={!isAvailable || isPast}
                onClick={() => setSelected(iso)}
                className={`
                  mx-auto w-8 h-8 rounded-full text-xs font-open-sans transition-colors
                  ${isSelected ? "bg-primary text-white font-semibold" : ""}
                  ${!isSelected && isAvailable && !isPast ? "hover:bg-orange-50 text-text-primary" : ""}
                  ${isPast ? "text-gray-300 cursor-default" : ""}
                  ${!isAvailable && !isPast ? "text-gray-300 cursor-default" : ""}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
