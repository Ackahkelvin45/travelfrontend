"use client";

/**
 * Component-pricing trip builder (canvas: Experience → "Build Your Trip"),
 * on its own page (/tour/<id>/build, see BuildTrip). useTripBuilder holds the
 * choices; TripBuilder renders the steps in the main column and TripSummary
 * the sticky price card. Every total shown is the
 * server's quote for the current selection.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetComponentMatrixQuery, type ComponentMatrix } from "@/lib/api/packagesApi";
import {
  useComponentQuoteMutation,
  useCreateHoldMutation,
  useCreateLeadMutation,
  type ComponentQuote,
  type TravelMode,
} from "@/lib/api/bookingsApi";
import {
  DEFAULT_CHOICES, guestCount, loadCheckout, saveCheckout, toSelection, unitRange, unitsFor,
  type TripChoices,
} from "@/lib/trip";
import { fmtMoney } from "@/lib/format";
import QuoteSummary from "./QuoteSummary";

function errorDetail(err: unknown, fallback: string) {
  return (err as { data?: { detail?: string } })?.data?.detail ?? fallback;
}

export function useTripBuilder(packageId: string, packageTitle: string, enabled: boolean) {
  const router = useRouter();
  const { data: matrix } = useGetComponentMatrixQuery(packageId, { skip: !enabled });
  const [choices, setChoices] = useState<TripChoices>(DEFAULT_CHOICES);
  const [linkedTo, setLinkedTo] = useState<string | undefined>(undefined);
  // Coming back from checkout restores the trip (after hydration, so SSR matches).
  useEffect(() => {
    const saved = loadCheckout();
    // The Stays page links here with ?mode=stay (an Airbnb without the event).
    const params = new URLSearchParams(window.location.search);
    const stayOnly = params.get("mode") === "stay";
    // My Booking links here with ?link=<reference> to add another Airbnb for a big group.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from sessionStorage / the link
    setLinkedTo(params.get("link") ?? (saved?.packageId === packageId ? saved.linkedTo : undefined));
    if (saved?.packageId === packageId && (!stayOnly || saved.choices.mode === "stay")) setChoices(saved.choices);
    else if (stayOnly) setChoices({ ...DEFAULT_CHOICES, mode: "stay", groupSize: 2 });
  }, [packageId]);
  // The quote is kept with the selection it priced, so a total is never shown
  // (or booked) for a selection that has since changed.
  const [priced, setPriced] = useState<{ key: string; quote: ComponentQuote } | null>(null);
  const [failed, setFailed] = useState<{ key: string | null; detail: string } | null>(null);
  const [holding, setHolding] = useState(false);
  const [requestQuote] = useComponentQuoteMutation();
  const [createHold] = useCreateHoldMutation();

  const n = guestCount(choices);
  const stay = matrix?.stay_types.find((s) => s.code === choices.stay);
  const units = unitsFor(choices, stay, n);
  const selection = useMemo(
    () => (matrix ? { ...toSelection(packageId, choices, matrix), ...(linkedTo ? { linked_to: linkedTo } : {}) } : null),
    [packageId, choices, matrix, linkedTo],
  );

  let warning: string | null = null;
  if (stay) {
    const [lo, hi] = unitRange(stay, n);
    if (lo > hi) warning = stay.kind === "airbnb"
      ? `${stay.name} sleeps up to ${stay.capacity}, and each booking takes one Airbnb. Choose accommodation that fits all ${n} guests, or make separate bookings.`
      : `${stay.name} needs ${stay.min_occupancy} guests per room. Add a guest or choose another stay.`;
    else if (units > stay.units_available) warning = `Only ${stay.units_available} × ${stay.name} left.`;
  }

  // Re-quote on every change (debounced); a newer request always wins.
  const seq = useRef(0);
  const key = selection && !warning ? JSON.stringify(selection) : null;
  useEffect(() => {
    if (!key) return;
    const id = ++seq.current;
    const t = setTimeout(() => {
      requestQuote(JSON.parse(key)).unwrap()
        .then((q) => { if (id === seq.current) { setPriced({ key, quote: q }); setFailed(null); } })
        .catch((e) => { if (id === seq.current) setFailed({ key, detail: errorDetail(e, "We couldn't price this trip. Please try again.") }); });
    }, 250);
    return () => clearTimeout(t);
  }, [key, requestQuote]);
  const quote = priced && priced.key === key ? priced.quote : null;
  const quoteError = failed && (failed.key === null || failed.key === key) ? failed.detail : null;

  const update = (patch: Partial<TripChoices>) => setChoices((c) => ({ ...c, ...patch }));

  const continueToDetails = async () => {
    if (!selection || warning || quoteError || !quote) return;
    setHolding(true);
    const previous = loadCheckout();
    try {
      const codes = selection.rooms.map((r) => r.stay_type);
      const hold = codes.length
        ? await createHold({ package_id: packageId, stay_types: codes, replace_token: previous?.hold?.token }).unwrap()
        : null;
      saveCheckout({ packageId, packageTitle, choices, hold, linkedTo });
      router.push("/checkout/details");
    } catch (e) {
      setFailed({ key: null, detail: errorDetail(e, "Those rooms were just taken. Please choose again.") });
      setHolding(false);
    }
  };

  return {
    packageId, matrix, choices, update, n, stay, units, selection, warning,
    quote, quoteError, holding, continueToDetails, linkedTo,
  };
}

export type TripBuilderState = ReturnType<typeof useTripBuilder>;

function Stepper({ value, onDec, onInc, label, disabled = false, decDisabled = false, incDisabled = false }: {
  value: React.ReactNode; onDec: () => void; onInc: () => void; label: string;
  disabled?: boolean; decDisabled?: boolean; incDisabled?: boolean;
}) {
  const btn = "w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 text-lg leading-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary";
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label={`Fewer ${label}`} onClick={onDec} disabled={disabled || decDisabled} className={btn}>−</button>
      <span className="min-w-12 text-center font-montserrat font-bold" aria-live="polite">{value}</span>
      <button type="button" aria-label={`More ${label}`} onClick={onInc} disabled={disabled || incDisabled} className={btn}>+</button>
    </div>
  );
}

const card = "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-4";
const option = (on: boolean) =>
  `text-left rounded-xl border-2 p-4 flex flex-col gap-1 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
    on ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
  }`;

const MODES: { id: TravelMode; label: string; hint: string }[] = [
  { id: "single", label: "Single", hint: "1 traveller" },
  { id: "couple", label: "Couple", hint: "2 travellers" },
  { id: "group", label: "Group", hint: "3 or more" },
  { id: "stay", label: "Stay only", hint: "Airbnb, no event" },
];

export function TripBuilder({ trip }: { trip: TripBuilderState }) {
  const { matrix, choices, update, n, stay, units } = trip;
  if (!matrix) return null;
  const c = matrix.currency;
  const group = [...matrix.group_discounts].sort((a, b) => a.min_travellers - b.min_travellers)[0];
  const perGuest = matrix.experiences.filter((e) => e.unit !== "per_vehicle");
  const transfers = matrix.experiences.filter((e) => e.unit === "per_vehicle");
  const needsAdult = perGuest.some((e) => e.adults_only && (choices.counts[e.code] ?? 0) > 0);
  const [lo, hi] = stay ? unitRange(stay, n) : [0, 0];
  const wordFor = (s: ComponentMatrix["stay_types"][number]) => (s.kind === "airbnb" ? "Unit" : "Room");
  const stayOnly = choices.mode === "stay";
  const airbnbs = matrix.stay_types.filter((s) => s.kind === "airbnb");
  const maxStayGuests = Math.max(1, ...airbnbs.filter((s) => s.on_sale).map((s) => s.capacity));
  const chooseMode = (mode: TravelMode) => update(mode === "stay"
    // No Core, so no event experiences; only an Airbnb can be booked alone.
    ? { mode, units: 0, counts: {}, groupSize: Math.min(n, maxStayGuests), stay: stay?.kind === "airbnb" ? choices.stay : "" }
    : { mode, units: 0 });

  return (
    <section id="book" className="scroll-mt-28 flex flex-col gap-6">
      <div>
        <h1 className="font-raleway text-[28px] md:text-[32px] font-bold leading-tight text-text-primary">{stayOnly ? "Book Your Stay" : "Build Your Trip"}</h1>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          {stayOnly ? "An Airbnb in Accra for 6–11 January, without the event. Your total updates as you go."
            : "Your total updates as you go, with each guest's share. Core tickets are never discounted."}
        </p>
      </div>

      <div className={card}>
        <h3 className="font-raleway font-bold text-text-primary">1. Who&apos;s travelling</h3>
        <div role="group" aria-label="Travel mode" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={choices.mode === m.id} onClick={() => chooseMode(m.id)} className={option(choices.mode === m.id)}>
              <span className="font-raleway font-bold text-text-primary">{m.label}</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{m.hint}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-text-primary">{stayOnly ? "Guests" : "Core travellers"}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {stayOnly ? "Staying in the Airbnb · no event ticket"
                : `${matrix.core_price_per_person ? fmtMoney(matrix.core_price_per_person, c) : "—"} each · one ticket per guest`}
            </span>
          </div>
          <Stepper
            label="travellers" value={n} disabled={choices.mode !== "group" && !stayOnly}
            decDisabled={n <= (stayOnly ? 1 : 3)} incDisabled={n >= (stayOnly ? maxStayGuests : 20)}
            onDec={() => update({ groupSize: n - 1, units: 0 })} onInc={() => update({ groupSize: n + 1, units: 0 })}
          />
        </div>
      </div>

      <div className={card}>
        <div>
          <h3 className="font-raleway font-bold text-text-primary">2. Accra stay</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Airbnb: 5 nights, 6–11 Jan, kept for you on the Crown Forest night · Four Points: 4 nights, 6 and 8–10 Jan
            {group ? ` · Groups of ${group.min_travellers}+ save ${parseFloat(group.percent)}% on accommodation` : ""}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {!stayOnly && (
            <button type="button" aria-pressed={!choices.stay} onClick={() => update({ stay: "", units: 0 })} className={option(!choices.stay)}>
              <span className="font-raleway font-bold text-text-primary">No Accra stay</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">I&apos;ll arrange my own</span>
            </button>
          )}
          {(stayOnly ? airbnbs : matrix.stay_types).map((s) => {
            const soldOut = s.on_sale && s.units_available === 0;
            const off = !s.on_sale || soldOut;
            return (
              <button
                key={s.code} type="button" aria-pressed={choices.stay === s.code} disabled={off}
                onClick={() => update({ stay: s.code, units: 0 })}
                className={`${option(choices.stay === s.code)} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="font-raleway font-bold text-text-primary">{s.name}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {!s.on_sale ? s.note || "Not yet on sale" : soldOut ? "Sold out"
                    : `${s.capacity === 1 ? "One guest per room" : `Up to ${s.capacity} guests`} · ${s.units_available} of ${s.units_total} left`}
                </span>
                <span className="text-sm font-semibold text-text-primary">{fmtMoney(s.unit_total, c)} · {s.nights} nights</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{fmtMoney(s.price_per_night, c)} / night per {wordFor(s).toLowerCase()}</span>
              </button>
            );
          })}
        </div>

        {stay && lo < hi && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-text-primary">{wordFor(stay)}s</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">Each {wordFor(stay).toLowerCase()} is charged once, however many guests share it.</span>
            </div>
            <Stepper
              label="units" value={units} decDisabled={units <= lo} incDisabled={units >= hi}
              onDec={() => update({ units: units - 1 })} onInc={() => update({ units: units + 1 })}
            />
          </div>
        )}
        {trip.warning && (
          <p role="alert" className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-sm p-3">{trip.warning}</p>
        )}

        <ul className="flex flex-col gap-2" aria-label="Guests and rooms">
          {trip.selection?.travellers.map((_, i) => {
            const r = trip.selection!.rooms.findIndex((room) => room.occupants.includes(i));
            return (
              <li key={i} className="flex flex-wrap justify-between gap-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5">
                <span className="text-text-primary">Guest {i + 1}{i === 0 ? " (lead)" : ""}{stayOnly ? "" : " · Core ticket"}</span>
                <span className="text-gray-600 dark:text-gray-400">{stay && r >= 0 ? `${wordFor(stay)} ${r + 1}` : "Own stay"}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {!stayOnly && <div className={card}>
        <div>
          <h3 className="font-raleway font-bold text-text-primary">3. Experiences · per guest</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">The welcome and farewell dinners are included in Core.</p>
        </div>
        {perGuest.map((e) => {
          const count = Math.min(n, choices.counts[e.code] ?? 0);
          const set = (v: number) => update({ counts: { ...choices.counts, [e.code]: Math.max(0, Math.min(n, v)) } });
          return (
            <div key={e.code} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-text-primary">{e.name}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{fmtMoney(e.price, c)} per guest{e.adults_only ? " · 18 and over" : ""}</span>
              </div>
              <Stepper
                label={`guests for ${e.name}`} value={`${count} of ${n}`} decDisabled={count <= 0} incDisabled={count >= n}
                onDec={() => set(count - 1)} onInc={() => set(count + 1)}
              />
            </div>
          );
        })}
        {needsAdult && (
          <label className="flex gap-2 items-start text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={!!choices.adultsConfirmed} onChange={(e) => update({ adultsConfirmed: e.target.checked })} className="mt-1 accent-primary" />
            I confirm the guests taking 18+ experiences are 18 or over.
          </label>
        )}
      </div>}

      {transfers.length > 0 && (
        <div className={card}>
          <div>
            <h3 className="font-raleway font-bold text-text-primary">{stayOnly ? 3 : 4}. Airport transfers</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {!stay ? "For guests staying in Azura accommodation. Choose an Accra stay to add one."
                : transfers[0].vehicle_capacity === 1 ? "For everyone on this booking, priced per guest."
                : `For everyone on this booking, priced per vehicle of up to ${transfers[0].vehicle_capacity} guests.`}
            </p>
          </div>
          {stay && (
            <div role="radiogroup" aria-label="Airport transfer" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[{ code: "", name: "No transfer", price: null as string | null }, ...transfers].map((e) => (
                <button
                  key={e.code} type="button" role="radio" aria-checked={(choices.transfer ?? "") === e.code}
                  onClick={() => update({ transfer: e.code })} className={option((choices.transfer ?? "") === e.code)}
                >
                  <span className="font-raleway font-bold text-text-primary">{e.name}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{"vehicle_capacity" in e ? `${fmtMoney(e.price, c)} per ${e.vehicle_capacity === 1 ? "guest" : "vehicle"}` : "I'll make my own way"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function TripSummary({ trip }: { trip: TripBuilderState }) {
  const { matrix, quote } = trip;
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", consent: false });
  const [leadState, setLeadState] = useState<null | "sending" | "sent" | string>(null);
  const [createLead] = useCreateLeadMutation();
  if (!matrix) return null;
  const c = matrix.currency;

  const saveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip.selection) return;
    setLeadState("sending");
    try {
      await createLead({
        name: lead.name, email: lead.email, source: "saved_quote",
        marketing_consent: lead.consent, selection: trip.selection,
      }).unwrap();
      setLeadState("sent");
    } catch (err) {
      setLeadState(errorDetail(err, "We couldn't save your quote. Please try again."));
    }
  };

  const input = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md p-6 flex flex-col gap-4">
      {trip.choices.mode !== "stay" && <div className="flex items-baseline gap-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">From</span>
        <span className="font-montserrat text-2xl font-bold text-text-primary">{matrix.core_price_per_person ? fmtMoney(matrix.core_price_per_person, c) : "—"}</span>
        <span className="text-xs text-gray-600 dark:text-gray-400">per traveller</span>
      </div>}

      {quote ? <QuoteSummary quote={quote} /> : (
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">{trip.warning ?? trip.quoteError ?? "Updating your total…"}</p>
      )}

      {matrix.installments.enabled && (
        <p className="rounded-xl bg-primary/5 px-4 py-3 text-[13px] text-gray-700 dark:text-gray-300">
          {trip.choices.mode === "stay" ? "" : "Core tickets and experiences are paid in full. "}Rooms can be secured with {parseFloat(matrix.installments.accommodation_deposit_percent)}% now and the rest in instalments before 6 January.
        </p>
      )}

      <button
        type="button" onClick={trip.continueToDetails} disabled={!quote || !!trip.quoteError || trip.holding}
        className="bg-primary text-white font-montserrat font-semibold rounded-xl py-3.5 transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {trip.holding ? "Holding your rooms…" : "Continue to Details"}
      </button>

      {!saving ? (
        <button type="button" onClick={() => setSaving(true)} disabled={!quote} className="text-sm font-semibold text-[#8A6420] dark:text-primary disabled:opacity-50">
          Save this quote for later
        </button>
      ) : leadState === "sent" ? (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">Saved. Our team will follow up at {lead.email}.</p>
      ) : (
        <form onSubmit={saveQuote} className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Name
            <input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email
            <input required type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className={`${input} mt-1`} />
          </label>
          <label className="flex gap-2 items-start text-xs text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={lead.consent} onChange={(e) => setLead({ ...lead, consent: e.target.checked })} className="mt-0.5 accent-primary" />
            Optional. Remind me about this quote and send offers by email.
          </label>
          {leadState && leadState !== "sending" && <p role="alert" className="text-xs text-red-700 dark:text-red-400">{leadState}</p>}
          <button type="submit" disabled={leadState === "sending"} className="rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-semibold text-text-primary disabled:opacity-50">
            {leadState === "sending" ? "Saving…" : "Save quote"}
          </button>
        </form>
      )}

      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400">Rooms are held during checkout. Prices in {c}.</p>
    </div>
  );
}
