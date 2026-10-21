"use client";

/** My Booking panels for component bookings (canvas: MyBooking). */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUpdatePreferencesMutation, type BookingDetail } from "@/lib/api/bookingsApi";
import { fmtDate, fmtDateRange } from "@/lib/format";

const card = "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4";
const heading = "font-raleway font-bold text-[17px] text-text-primary";

export function TripHero({ booking, tourEnd }: { booking: BookingDetail; tourEnd?: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);
  const ms = now === null ? 0 : Math.max(0, new Date(`${booking.travel_date}T08:00:00Z`).getTime() - now);
  const stays = [...new Set(booking.travellers.map((t) => t.unit).filter(Boolean))];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1d08] via-[#4a3410] to-[#8A6420] text-white p-6 md:p-8 flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-white/80">Booking {booking.reference} · <span className="capitalize">{booking.status}</span></span>
        <span className="font-raleway text-2xl md:text-3xl font-bold">{booking.package_title}</span>
        <span className="text-sm text-white/85">
          {tourEnd ? fmtDateRange(booking.travel_date, tourEnd) : fmtDate(booking.travel_date)} · {booking.num_guests} traveller{booking.num_guests === 1 ? "" : "s"}
          {stays.length ? ` · ${stays.length} room${stays.length === 1 ? "" : "s"}` : ""}
        </span>
      </div>
      <div className="flex gap-3" aria-label="Time until the trip">
        {[
          { v: now === null ? "—" : String(Math.floor(ms / 86_400_000)), l: "days" },
          { v: now === null ? "—" : String(Math.floor((ms % 86_400_000) / 3_600_000)), l: "hours" },
          { v: String(booking.num_guests), l: booking.num_guests === 1 ? "guest" : "guests" },
        ].map((c) => (
          <div key={c.l} className="min-w-[72px] rounded-xl bg-white/10 backdrop-blur px-3 py-2.5 text-center">
            <div className="font-montserrat text-2xl font-bold tabular-nums">{c.v}</div>
            <div className="text-xs text-white/80">{c.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoordinatorPanel({ booking, whatsapp }: { booking: BookingDetail; whatsapp?: string }) {
  const rooms = [...new Set(booking.travellers.map((t) => t.unit).filter(Boolean))];
  const travelDone = booking.travellers.length > 0 && booking.travellers.every((t) => t.travel_info_submitted);
  const checks = [
    { done: booking.travellers.length > 0, label: "Names and Core tickets confirmed" },
    { done: rooms.length > 0, label: rooms.length ? `Room allocated: ${rooms.join(", ")}` : "No Accra stay booked" },
    { done: travelDone, label: `Travel information: ${travelDone ? "complete" : "in progress"}` },
  ];
  const name = booking.coordinator_name;
  return (
    <section className={card}>
      <h2 className={heading}>Your Coordinator</h2>
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-full bg-primary/15 text-[#8A6420] dark:text-primary font-montserrat font-bold flex items-center justify-center">{name ? name[0] : "·"}</span>
        <div className="flex flex-col">
          <strong className="text-text-primary">{name ?? "Being assigned"}</strong>
          <span className="text-[13px] text-gray-600 dark:text-gray-400">
            {booking.lead_contacted_at ? `Contacted you ${fmtDate(booking.lead_contacted_at)}` : "Will contact you within 24 hours"} · replies in staffed hours
          </span>
        </div>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
            <span aria-hidden className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${c.done ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>{c.done ? "✓" : "·"}</span>
            <span><span className="sr-only">{c.done ? "Done: " : "To do: "}</span>{c.label}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2.5">
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-text-primary">WhatsApp</a>
        )}
        {!travelDone && (
          <Link href={`/booking/${booking.reference}/travel`} className="rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-semibold">Finish travel form</Link>
        )}
      </div>
    </section>
  );
}

export function GuestsPanel({ booking }: { booking: BookingDetail }) {
  return (
    <section className={card}>
      <h2 className={heading}>Guests, Rooms &amp; Experiences</h2>
      <ul className="flex flex-col gap-2.5">
        {booking.travellers.map((t) => (
          <li key={t.full_name} className="flex flex-wrap justify-between gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
            <div className="flex flex-col">
              <strong className="text-sm text-text-primary">{t.full_name}{t.is_lead ? " (lead)" : ""}</strong>
              <span className="text-[13px] text-gray-600 dark:text-gray-400">{t.experiences.length ? t.experiences.join(" · ") : "No experiences added"}</span>
            </div>
            <span className="self-center text-xs font-semibold text-[#6B4E1A] dark:text-primary">{t.unit ?? "Own stay"}</span>
          </li>
        ))}
      </ul>
      <span className="text-xs text-gray-500 dark:text-gray-400">Stay: 6–7 Jan and 8–11 Jan. Crown Forest on 7 Jan is included.</span>
    </section>
  );
}

const UPGRADES = [
  { name: "Extra night in Accra", note: "Arrive Tuesday 5 Jan or stay on." },
  { name: "Private airport transfer", note: "Met at Kotoka arrivals." },
  { name: "Trip photography", note: "Photos of key moments." },
];

export function UpgradesPanel() {
  return (
    <section className={card}>
      <div className="flex flex-wrap justify-between items-baseline gap-2">
        <h2 className={heading}>Upgrade Your Trip</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">Added to your balance. Prices shown once confirmed.</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {UPGRADES.map((u) => (
          <div key={u.name} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-1.5">
            <span className="font-raleway font-bold text-sm text-text-primary">{u.name}</span>
            <span className="text-[13px] text-gray-600 dark:text-gray-400">{u.note}</span>
            <span className="self-start mt-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400">Coming soon</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MessagePreferences({ booking }: { booking: BookingDetail }) {
  const [update, { isLoading }] = useUpdatePreferencesMutation();
  const [prefs, setPrefs] = useState({ marketing_consent: booking.marketing_consent, photo_consent: booking.photo_consent });
  const [error, setError] = useState<string | null>(null);
  const toggle = async (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setError(null);
    try {
      await update({ reference: booking.reference, [key]: next[key] }).unwrap();
    } catch {
      setPrefs(prefs);
      setError("We couldn't save that change. Please try again.");
    }
  };
  const rows = [
    { key: null, label: "Booking and payment messages", note: "Confirmations, receipts and balance reminders. Always on while you have a booking." },
    { key: "marketing_consent" as const, label: "Offers and updates", note: "Email and WhatsApp news about future trips." },
    { key: "photo_consent" as const, label: "Photos in promotional material", note: "Azura may use trip photos that include you." },
  ];
  return (
    <section className={card}>
      <h2 className={heading}>Message Preferences</h2>
      {rows.map((r) => {
        const on = r.key ? prefs[r.key] : true;
        return (
          <div key={r.label} className="flex justify-between items-center gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary">{r.label}</span>
              <span className="text-[13px] text-gray-600 dark:text-gray-400">{r.note}</span>
            </div>
            <button
              type="button" role="switch" aria-checked={on} aria-label={r.label}
              disabled={!r.key || isLoading} onClick={() => r.key && toggle(r.key)}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:cursor-not-allowed ${on ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"} ${!r.key ? "opacity-60" : ""}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${on ? "translate-x-5" : ""}`} />
            </button>
          </div>
        );
      })}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
    </section>
  );
}
