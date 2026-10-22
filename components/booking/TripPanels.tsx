"use client";

/** My Booking panels for component bookings (canvas: MyBooking). */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import crownForest from "../../assets/images/hero.png";
import { useRouter } from "next/navigation";
import {
  useAvailableAddonsQuery, useInitializePaymentMutation, useUpdatePreferencesMutation, type BookingDetail,
} from "@/lib/api/bookingsApi";
import { useGetPackageDetailQuery } from "@/lib/api/packagesApi";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import { fmtDate, fmtMoney } from "@/lib/format";

const card = "h-full rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4";
const heading = "font-raleway font-bold text-[17px] text-text-primary";

/** "Wed 6 – Mon 11 Jan 2027" */
function tripDates(fromIso: string, toIso?: string | null) {
  const d = (iso: string) => new Date(`${iso}T00:00:00`);
  const wd = (x: Date) => x.toLocaleDateString("en-GB", { weekday: "short" });
  const mon = (x: Date) => x.toLocaleDateString("en-GB", { month: "short" });
  const a = d(fromIso);
  if (!toIso) return `${wd(a)} ${a.getDate()} ${mon(a)} ${a.getFullYear()}`;
  const b = d(toIso);
  const start = a.getMonth() === b.getMonth() ? `${wd(a)} ${a.getDate()}` : `${wd(a)} ${a.getDate()} ${mon(a)}`;
  return `${start} – ${wd(b)} ${b.getDate()} ${mon(b)} ${b.getFullYear()}`;
}

export function TripHero({ booking }: { booking: BookingDetail }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);
  const { data: pkg } = useGetPackageDetailQuery(booking.package_id, { skip: !booking.package_id });
  const ms = now === null ? 0 : Math.max(0, new Date(`${booking.travel_date}T08:00:00Z`).getTime() - now);
  // Unit labels look like "Two-bedroom Airbnb 4"; the hero names the room type.
  const units = [...new Set(booking.travellers.map((t) => t.unit).filter(Boolean))] as string[];
  const types = [...new Set(units.map((u) => u.replace(/\s+\d+$/, "")))];
  const rooms = units.length === 0 ? "" : units.length === 1 ? types[0] : `${units.length} rooms`;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#14100A] text-white p-6 md:p-8 min-h-[230px] flex flex-wrap items-end justify-between gap-6">
      <Image src={crownForest} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1200px" className="object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      <div className="relative flex flex-col gap-2">
        <span className="font-montserrat text-[11px] font-bold uppercase tracking-[0.22em] text-[#E9D3A3]">
          Booking {booking.reference} · {booking.status}
        </span>
        <span className="font-raleway text-2xl md:text-3xl font-bold">{booking.package_title}</span>
        <span className="text-sm text-white/90">
          {tripDates(booking.travel_date, pkg?.available_to)} · {booking.num_guests} traveller{booking.num_guests === 1 ? "" : "s"}
          {rooms ? ` · ${rooms}` : ""}
        </span>
      </div>
      <div className="relative flex gap-3" aria-label="Time until the trip">
        {[
          { v: now === null ? "—" : String(Math.floor(ms / 86_400_000)), l: "days" },
          { v: now === null ? "—" : String(Math.floor((ms % 86_400_000) / 3_600_000)), l: "hours" },
          { v: String(booking.num_guests), l: booking.num_guests === 1 ? "guest" : "guests" },
        ].map((c) => (
          <div key={c.l} className="min-w-[76px] rounded-xl border border-white/15 bg-white/10 backdrop-blur px-3 py-2.5 text-center">
            <div className="font-montserrat text-2xl font-bold tabular-nums">{c.v}</div>
            <div className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.15em] text-white/80">{c.l}</div>
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
        <span className="w-12 h-12 shrink-0 rounded-full bg-[#060504] text-white font-montserrat font-bold flex items-center justify-center">
          {name ? name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "·"}
        </span>
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
            <span aria-hidden className={`w-4 text-center font-bold ${c.done ? "text-green-700 dark:text-green-400" : "text-primary"}`}>{c.done ? "✓" : "•"}</span>
            <span><span className="sr-only">{c.done ? "Done: " : "To do: "}</span>{c.label}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2.5">
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-[#06290F] hover:brightness-95">WhatsApp</a>
        )}
        {!travelDone && (
          <Link href={`/booking/${booking.reference}/travel`} className="rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-primary">Finish travel form</Link>
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
          <li key={t.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
            <div className="flex flex-col">
              <strong className="text-sm text-text-primary">{t.full_name}{t.is_lead ? " (lead)" : ""}</strong>
              <span className="text-[13px] text-gray-600 dark:text-gray-400">{t.experiences.length ? t.experiences.join(" · ") : "No experiences added"}</span>
              {booking.pay_separately && (
                <span className="text-[13px] text-gray-600 dark:text-gray-400">
                  {parseFloat(t.outstanding) > 0
                    ? <>{fmtMoney(t.outstanding, booking.currency)} of {fmtMoney(t.share, booking.currency)} to pay · <Link href={`/pay/${t.id}`} className="font-semibold text-[#8A6420] dark:text-primary">Pay link</Link></>
                    : "Share paid"}
                </span>
              )}
            </div>
            <span className="self-center text-xs font-semibold text-[#6B4E1A] dark:text-primary">{t.unit ?? "Own stay"}</span>
          </li>
        ))}
      </ul>
      <span className="text-xs text-gray-500 dark:text-gray-400">Airbnb: 6–11 Jan, kept for you on the Crown Forest night. Four Points: 6 Jan and 8–10 Jan. Crown Forest on 7 Jan is included.</span>
    </section>
  );
}

/** Add experiences or an airport transfer for named guests, paid when bought
 * (Change Request v4 §6, §8). The server prices it; the preview only multiplies. */
export function TripAddons({ booking }: { booking: BookingDetail }) {
  const router = useRouter();
  const { data } = useAvailableAddonsQuery(booking.reference);
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();
  const [code, setCode] = useState<string | null>(null);
  const [guests, setGuests] = useState<string[]>([]);
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!data) return null;
  const c = data.currency;
  const addon = data.addons.find((a) => a.code === code);
  const names = Object.fromEntries(booking.travellers.map((t) => [t.id, t.full_name]));
  const qty = addon ? (addon.unit === "per_vehicle" ? Math.ceil(guests.length / (addon.vehicle_capacity || 2)) : guests.length) : 0;
  const preview = addon ? (parseFloat(addon.unit_price) * qty).toFixed(2) : "0";

  const choose = (next: string) => { setCode(code === next ? null : next); setGuests([]); setAdult(false); setError(null); };
  const toggle = (id: string) => setGuests((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  const pay = async () => {
    if (!addon || !guests.length) return;
    setError(null);
    try {
      const payment = await initializePayment({
        booking_id: booking.id, intent: "addon", addon_code: addon.code, traveller_ids: guests, adult, channel: "any",
      }).unwrap();
      await routeAfterInitialize(payment, (ref) => router.push(`/payment/callback?reference=${ref}`));
    } catch (err) {
      setError((err as { data?: { detail?: string } })?.data?.detail ?? "Payment didn't start. No money was taken.");
    }
  };

  return (
    <section className={card}>
      <div className="flex flex-wrap justify-between items-baseline gap-2">
        <h2 className={heading}>Upgrade Your Trip</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {data.can_add ? `Paid when you add it · until ${fmtDate(data.open_until)}` : data.reason}
        </span>
      </div>
      {data.can_add && data.addons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.addons.map((a) => (
            <div key={a.code} className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${code === a.code ? "border-primary bg-primary/5" : "border-gray-100 dark:border-gray-800"}`}>
              <span className="font-raleway font-bold text-text-primary">{a.name}</span>
              {a.description && <span className="text-[13px] text-gray-600 dark:text-gray-400">{a.description}</span>}
              <span className="mt-auto font-montserrat font-bold text-text-primary">
                {fmtMoney(a.unit_price, c)}
                <span className="block font-open-sans text-xs font-normal text-gray-600 dark:text-gray-400">
                  {a.unit === "per_vehicle" ? `per vehicle, up to ${a.vehicle_capacity}` : "per guest"}{a.adults_only ? " · 18+" : ""}
                </span>
              </span>
              <button type="button" aria-pressed={code === a.code} onClick={() => choose(a.code)}
                className={`self-start rounded-lg px-4 py-2 text-sm font-semibold transition ${code === a.code ? "border border-primary text-[#8A6420] dark:text-primary" : "bg-primary text-white hover:brightness-95"}`}>
                {code === a.code ? "Selected" : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
      {addon && (
        <div className="flex flex-col gap-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="text-[13px] font-semibold text-text-primary mb-1">Who is it for?</legend>
            {(addon.eligible_travellers ?? []).map((id) => (
              <label key={id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={guests.includes(id)} onChange={() => toggle(id)} className="accent-primary" />
                {names[id] ?? "Guest"}
              </label>
            ))}
          </fieldset>
          {addon.adults_only && (
            <label className="flex gap-2 items-start text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-1 accent-primary" />
              I confirm these guests are 18 or over.
            </label>
          )}
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
          <button type="button" onClick={pay} disabled={isLoading || !guests.length || (addon.adults_only && !adult)}
            className="self-start bg-primary text-white font-montserrat font-semibold text-sm px-5 py-3 rounded-xl disabled:opacity-50">
            {isLoading ? "Opening secure payment…" : guests.length ? `Pay ${fmtMoney(preview, c)} and add` : "Choose guests"}
          </button>
        </div>
      )}
    </section>
  );
}

export function MessagePreferences({ booking }: { booking: BookingDetail }) {
  const [update, { isLoading }] = useUpdatePreferencesMutation();
  const [prefs, setPrefs] = useState({
    whatsapp_updates: booking.whatsapp_updates, marketing_consent: booking.marketing_consent, photo_consent: booking.photo_consent,
  });
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
    { key: null, label: "Booking and payment emails", note: "Confirmations, receipts and balance reminders. Always on while you have a booking." },
    { key: "whatsapp_updates" as const, label: "Confirmations on WhatsApp", note: booking.phone ? `Payment confirmations to ${booking.phone}.` : "Add a phone number with your country code first." },
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
