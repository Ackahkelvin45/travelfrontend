"use client";

/** Post-booking travel form (canvas: TravelInfo). One tab per guest; saves to
 * the owner-only endpoint, so guests sign in (or claim the booking) first. */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import { useSaveTravelInfoMutation, useTravelInfoQuery, type TravelInfo } from "@/lib/api/bookingsApi";
import { useAppSelector } from "@/lib/store/hooks";

const DIETS = ["No requirements", "Vegetarian", "Vegan", "Halal", "Gluten free", "Nut allergy"];
const field = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20";
const fieldset = "m-0 scroll-mt-24 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-4 min-w-0";
const legend = "font-raleway font-bold text-[17px] px-1.5 text-text-primary";
const label = "flex flex-col gap-1.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300";

// dietary is one text field server-side: "Vegetarian, Nut allergy. Notes: …"
function splitDiet(s: string) {
  const [chips, notes = ""] = s.split(/\.\s*Notes:\s*/);
  const picked = chips.split(",").map((x) => x.trim()).filter((x) => DIETS.includes(x));
  return { picked, notes: picked.length ? notes : s.replace(/^Notes:\s*/, "") };
}
const joinDiet = (picked: string[], notes: string) =>
  [picked.join(", "), notes.trim() && `Notes: ${notes.trim()}`].filter(Boolean).join(". ");

// Times are Accra local time whatever the guest's own time zone — Ghana is
// GMT all year, so "HH:mm in Accra" is exactly UTC.
const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const toIso = (local: string) => (local ? `${local}:00Z` : null);

export default function TravelInfoPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const token = useAppSelector((s) => s.auth.token);
  const { data, isLoading, isError } = useTravelInfoQuery(reference, { skip: !token });
  const [save, { isLoading: saving }] = useSaveTravelInfoMutation();
  const [rows, setRows] = useState<TravelInfo[]>([]);
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState<null | "saved" | "submitted" | string>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- seed the editable copy from the server
  useEffect(() => { if (data) setRows(data.travellers); }, [data]);

  if (!token) {
    return (
      <Centered>
        <h1 className="font-raleway text-2xl font-bold text-text-primary">Sign in to add travel information</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md">Use the account linked to booking {reference}, or open the link in your confirmation email to attach the booking to your account.</p>
        <Link href={`/login?next=${encodeURIComponent(`/booking/${reference}/travel`)}`} className="bg-primary text-white font-montserrat font-semibold rounded-xl px-6 py-3">Sign in</Link>
      </Centered>
    );
  }
  if (isLoading) return <Centered><Spinner /></Centered>;
  if (isError || !data) {
    return (
      <Centered>
        <p className="text-gray-700 dark:text-gray-300 max-w-md">We couldn&apos;t find booking {reference} on this account. Open the link in your confirmation email to attach it, then come back.</p>
        <Link href="/dashboard" className="font-semibold text-[#8A6420] dark:text-primary">Go to My Booking</Link>
      </Centered>
    );
  }
  if (!rows.length) return <Centered><p className="text-gray-700 dark:text-gray-300">This booking has no traveller list to complete.</p></Centered>;

  const g = rows[Math.min(tab, rows.length - 1)];
  const set = (patch: Partial<TravelInfo>) => setRows((prev) => prev.map((r) => (r.id === g.id ? { ...r, ...patch } : r)));
  const diet = splitDiet(g.dietary);
  const sections = [
    { href: "#arrival", label: "Arrival & departure", done: !!(g.arrival_at && g.arrival_flight) },
    { href: "#emergency", label: "Emergency contact", done: !!(g.emergency_contact && g.emergency_phone) },
    { href: "#needs", label: "Dietary & accessibility", done: !!g.dietary },
    { href: "#id", label: "Passport or ID", done: true },
  ];
  const allDone = rows.every((r) => r.arrival_at && r.arrival_flight && r.emergency_contact && r.emergency_phone && r.dietary);
  const pct = Math.round((rows.reduce((n, r) => n + [r.arrival_at && r.arrival_flight, r.emergency_contact && r.emergency_phone, r.dietary].filter(Boolean).length, 0) / (rows.length * 3)) * 100);

  const submit = async (final: boolean) => {
    setStatus(null);
    try {
      await save({
        reference,
        travellers: rows.map(({ id, arrival_at, arrival_flight, departure_at, departure_flight, needs_transfer, emergency_contact, emergency_phone, dietary, accessibility }) => ({
          id, arrival_at, arrival_flight, departure_at, departure_flight, needs_transfer, emergency_contact, emergency_phone, dietary, accessibility,
        })),
      }).unwrap();
      setStatus(final ? "submitted" : "saved");
    } catch (err) {
      setStatus((err as { data?: { detail?: string } }).data?.detail ?? "We couldn't save. Please check the fields and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-[1100px] mx-auto px-4 md:px-10 flex flex-col gap-4">
        <div className="flex items-center gap-3 self-end" aria-label={`${pct}% complete`}>
          <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">{pct}% complete</span>
          <div className="w-40 h-2 rounded-full bg-primary/20 overflow-hidden"><div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="flex flex-wrap gap-8 items-start">
          <nav aria-label="Form sections" className="flex-[1_1_220px] lg:sticky lg:top-28 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Booking {reference}</span>
            {sections.map((s) => (
              <a key={s.href} href={s.href} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-text-primary hover:bg-white dark:hover:bg-gray-900">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${s.done ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>{s.done ? "✓" : "·"}</span>
                {s.label}
              </a>
            ))}
          </nav>

          <form onSubmit={(e) => { e.preventDefault(); submit(true); }} className="flex-[999_1_560px] min-w-0 flex flex-col gap-5">
            <div>
              <h1 className="font-raleway text-[30px] font-bold text-text-primary">Travel Information</h1>
              <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300">Help us plan your arrival. You can save and come back any time.</p>
            </div>

            {rows.length > 1 && (
              <div role="tablist" aria-label="Guest" className="flex flex-wrap gap-2">
                {rows.map((r, i) => (
                  <button key={r.id} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold border ${i === tab ? "bg-text-primary text-white dark:bg-white dark:text-gray-900 border-transparent" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"}`}>
                    Guest {i + 1}: {r.full_name}
                  </button>
                ))}
              </div>
            )}

            <fieldset id="arrival" className={fieldset}>
              <legend className={legend}>Arrival &amp; departure · {g.full_name}</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <label className={label}>Arrival date and time (Accra)<input type="datetime-local" className={field} value={toLocal(g.arrival_at)} onChange={(e) => set({ arrival_at: toIso(e.target.value) })} /></label>
                <label className={label}>Flight number<input className={field} placeholder="e.g. DL 156" value={g.arrival_flight} onChange={(e) => set({ arrival_flight: e.target.value })} /></label>
                <label className={label}>Departure date and time (Accra)<input type="datetime-local" className={field} value={toLocal(g.departure_at)} onChange={(e) => set({ departure_at: toIso(e.target.value) })} /></label>
                <label className={label}>Departure flight<input className={field} value={g.departure_flight} onChange={(e) => set({ departure_flight: e.target.value })} /></label>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Airport transfer</span>
                <div role="radiogroup" aria-label="Airport transfer" className="flex flex-wrap gap-2">
                  {[{ v: false, l: "I'll make my own way" }, { v: true, l: "Arriving with the group" }].map((t) => (
                    <button key={t.l} type="button" role="radio" aria-checked={g.needs_transfer === t.v} onClick={() => set({ needs_transfer: t.v })}
                      className={`rounded-xl border-2 px-4 py-2.5 text-sm ${g.needs_transfer === t.v ? "border-primary bg-primary/5 text-text-primary" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"}`}>{t.l}</button>
                  ))}
                  <button type="button" role="radio" aria-checked={false} disabled className="rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed">Private transfer (coming soon)</button>
                </div>
              </div>
            </fieldset>

            <fieldset id="emergency" className={fieldset}>
              <legend className={legend}>Emergency contact</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <label className={label}>Name and relationship<input className={field} placeholder="e.g. Kofi Mensah, brother" value={g.emergency_contact} onChange={(e) => set({ emergency_contact: e.target.value })} /></label>
                <label className={label}>Phone, with country code<input type="tel" className={field} value={g.emergency_phone} onChange={(e) => set({ emergency_phone: e.target.value })} /></label>
              </div>
            </fieldset>

            <fieldset id="needs" className={fieldset}>
              <legend className={legend}>Dietary &amp; accessibility</legend>
              <div role="group" aria-label="Dietary requirements" className="flex flex-wrap gap-2">
                {DIETS.map((d) => {
                  const on = diet.picked.includes(d);
                  const next = d === "No requirements" ? (on ? [] : [d]) : on ? diet.picked.filter((x) => x !== d) : [...diet.picked.filter((x) => x !== "No requirements"), d];
                  return (
                    <button key={d} type="button" aria-pressed={on} onClick={() => set({ dietary: joinDiet(next, diet.notes) })}
                      className={`rounded-full border px-3.5 py-2 text-sm ${on ? "border-primary bg-primary/10 text-text-primary" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"}`}>{d}</button>
                  );
                })}
              </div>
              <label className={label}>Allergies or other dietary notes<input className={field} value={diet.notes} onChange={(e) => set({ dietary: joinDiet(diet.picked, e.target.value) })} /></label>
              <label className={label}>Accessibility needs<textarea rows={3} className={field} placeholder="Mobility, hearing, vision or anything else that helps us plan" value={g.accessibility} onChange={(e) => set({ accessibility: e.target.value })} /></label>
            </fieldset>

            <fieldset id="id" className={fieldset}>
              <legend className={legend}>Passport or ID</legend>
              <p className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                <strong>Not needed right now.</strong> We&apos;ll only ask if a confirmed supplier or activity requires it, and you&apos;ll upload it here securely. Never send ID by email or chat.
              </p>
            </fieldset>

            {status && (
              <p role={status === "saved" || status === "submitted" ? "status" : "alert"} className={`text-sm ${status === "saved" || status === "submitted" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                {status === "saved" ? "Saved. You can come back any time." : status === "submitted" ? "Thank you — your coordinator now has your travel information." : status}
              </p>
            )}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <button type="button" onClick={() => submit(false)} disabled={saving} className="rounded-2xl border border-gray-200 dark:border-gray-700 px-6 py-3.5 font-montserrat font-semibold text-sm text-text-primary disabled:opacity-50">
                {saving ? "Saving…" : "Save and finish later"}
              </button>
              <button type="submit" disabled={saving || !allDone} className="bg-primary text-white font-montserrat font-semibold text-[15px] px-7 py-3.5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
                Submit travel information
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="min-h-[70vh] pt-24 flex flex-col gap-3 items-center justify-center p-6 text-center">{children}</main>;
}
