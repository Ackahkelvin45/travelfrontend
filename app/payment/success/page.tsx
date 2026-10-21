"use client";

/** Booking confirmed (canvas: Confirmed). Receipt from the server's line
 * items, what happens next, and upgrades that are not on sale yet. */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGetBookingByReferenceQuery } from "@/lib/api/bookingsApi";
import { BASE_URL } from "@/lib/api/baseApi";
import { PrinterIcon } from "@/components/ui/icons";
import { fmtDate, fmtMoney } from "@/lib/format";
import { clearCheckout } from "@/lib/trip";
import { clearPendingBooking } from "@/lib/pendingBooking";
import { useStartDonationMutation } from "@/lib/api/donationsApi";
import { loadPendingDonation, payDonation, savePendingDonation, type PendingDonation } from "@/lib/donation";

// Not on sale until the client confirms them (Change Request v4 §8).
const UPSELLS = [
  { name: "Extra nights in Accra", note: "Arrive Tuesday or stay on after Monday." },
  { name: "Trip photography", note: "A photographer for key moments of the trip." },
];

/** Pay links for a group whose members pay their own share. */
function GroupShares({ booking }: { booking: { currency: string; travellers: { id: string; full_name: string; is_lead: boolean; share: string; outstanding: string }[] } }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (id: string) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/pay/${id}`); setCopied(id); } catch { /* clipboard blocked */ }
  };
  return (
    <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-3 print:hidden">
      <h2 className="font-raleway font-bold text-[17px] text-text-primary">Each guest&apos;s share</h2>
      <p className="text-[13px] text-gray-700 dark:text-gray-300">Send each guest their pay link. Every share must be paid before the trip starts on 6 January.</p>
      <ul className="flex flex-col gap-2">
        {booking.travellers.map((t) => {
          const due = parseFloat(t.outstanding);
          return (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5 text-sm">
              <span className="text-text-primary">{t.full_name}{t.is_lead ? " (organiser)" : ""}</span>
              <span className="flex items-center gap-3">
                <span className={due > 0 ? "text-gray-700 dark:text-gray-300" : "text-green-700 dark:text-green-400"}>
                  {due > 0 ? `${fmtMoney(t.outstanding, booking.currency)} to pay` : "Paid"}
                </span>
                {due > 0 && (
                  <button type="button" onClick={() => copy(t.id)} className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-[#8A6420] dark:text-primary">
                    {copied === t.id ? "Link copied" : "Copy pay link"}
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** The Academy gift chosen at checkout, charged now that the booking is paid. */
function PendingDonationCard({ donation, currency, onDismiss }: { donation: PendingDonation; currency: string; onDismiss: () => void }) {
  const router = useRouter();
  const [start, { isLoading }] = useStartDonationMutation();
  const [error, setError] = useState<string | null>(null);
  const label = "percent" in donation.choice ? `${donation.choice.percent}% of your booking` : fmtMoney(donation.choice.amount, currency);
  const go = async () => {
    setError(null);
    try {
      const res = await start({ name: donation.name, email: donation.email, booking_id: donation.bookingId, ...donation.choice }).unwrap();
      savePendingDonation(null);
      await payDonation(res, (ref) => router.push(`/donate/thanks?reference=${ref}`));
    } catch (e) {
      setError((e as { data?: { detail?: string } })?.data?.detail ?? "The donation didn't start. Please try again.");
    }
  };
  return (
    <section className="rounded-2xl border border-primary/40 bg-white dark:bg-gray-900 p-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
      <div className="flex flex-col gap-1 min-w-0">
        <h2 className="font-raleway font-bold text-[17px] text-text-primary">Complete your Academy donation</h2>
        <p className="text-[13px] text-gray-700 dark:text-gray-300">{label}, paid separately to the Michael Blackson Academy&apos;s own account.</p>
        {error && <p role="alert" className="text-[13px] text-red-700 dark:text-red-400">{error}</p>}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={() => { savePendingDonation(null); onDismiss(); }} className="text-sm font-semibold text-gray-600 dark:text-gray-400">Not now</button>
        <button type="button" onClick={go} disabled={isLoading} className="bg-primary text-white font-montserrat font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-50">
          {isLoading ? "Opening…" : "Donate"}
        </button>
      </div>
    </section>
  );
}

const Spin = () => (
  <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") ?? "";
  const { data: booking, isLoading, isError } = useGetBookingByReferenceQuery(reference, { skip: !reference });
  const [copied, setCopied] = useState(false);
  const [donation, setDonation] = useState<PendingDonation | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read sessionStorage after hydration
    setDonation(loadPendingDonation());
  }, []);

  // Paid: the checkout is finished, so a new trip starts clean.
  useEffect(() => {
    if (booking && parseFloat(booking.amount_paid) > 0) { clearCheckout(); clearPendingBooking(); }
  }, [booking]);

  if (!reference) {
    return (
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">No booking reference found.</p>
        <button onClick={() => router.push("/experiences")} className="text-[#8A6420] dark:text-primary font-semibold text-sm underline">Browse experiences</button>
      </div>
    );
  }
  if (isLoading) return <div className="flex flex-col items-center gap-4"><Spin /><p className="font-raleway font-semibold text-text-primary">Loading your booking…</p></div>;
  if (isError || !booking) {
    return (
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">Could not load your booking details.</p>
        <button onClick={() => router.push("/")} className="text-[#8A6420] dark:text-primary font-semibold text-sm underline">Return home</button>
      </div>
    );
  }

  const c = booking.currency;
  const balance = parseFloat(booking.balance);
  const paidPct = Math.min(100, Math.round((parseFloat(booking.amount_paid) / parseFloat(booking.total_amount)) * 100));
  const items = booking.line_items;
  const isTrip = !!booking.mode;
  const copy = async () => {
    try { await navigator.clipboard.writeText(booking.reference); setCopied(true); } catch { /* clipboard blocked */ }
  };
  const card = "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-3";

  return (
    <div className="w-full max-w-[1000px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col items-center text-center gap-3.5">
        <div className="relative w-[88px] h-[88px]" aria-hidden>
          <span className="absolute inset-0 rounded-full border-2 border-primary motion-safe:animate-ping opacity-40" />
          <svg width="88" height="88" viewBox="0 0 88 88" className="relative"><circle cx="44" cy="44" r="42" fill="#BD8F3A" /><path d="M28 45l11 11 21-23" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 className="font-raleway text-3xl md:text-[38px] font-bold text-text-primary">
          You&apos;re going to Ghana, <em className="font-cormorant italic font-semibold">{booking.first_name}!</em>
        </h1>
        <p className="text-[15px] text-gray-700 dark:text-gray-300">We&apos;ve emailed your confirmation and receipt to {booking.email}.</p>
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-primary bg-white dark:bg-gray-900 px-4 py-2.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">Booking reference</span>
          <strong className="font-montserrat text-lg tracking-wider text-text-primary">{booking.reference}</strong>
          <button type="button" onClick={copy} className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-[#8A6420] dark:text-primary print:hidden">{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>

      {donation && donation.bookingId === booking.id && parseFloat(booking.amount_paid) > 0 && (
        <PendingDonationCard donation={donation} currency={c} onDismiss={() => setDonation(null)} />
      )}

      <div className="flex flex-wrap gap-5 items-start">
        <section className={`${card} flex-[1.2_1_420px] min-w-0`}>
          <div className="flex justify-between items-center">
            <h2 className="font-raleway font-bold text-[17px] text-text-primary">Receipt</h2>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#8A6420] dark:text-primary print:hidden"><PrinterIcon size={14} /> Print or save PDF</button>
          </div>
          <p className="text-[13px] text-gray-700 dark:text-gray-300">
            {booking.package_title} · {fmtDate(booking.travel_date)} · {booking.num_guests} traveller{booking.num_guests === 1 ? "" : "s"}
          </p>
          <dl className="flex flex-col gap-2 py-3 border-y border-gray-100 dark:border-gray-800 text-[13px] text-gray-700 dark:text-gray-300">
            {items.lines.map((l) => (
              <div key={l.label + l.detail} className="flex justify-between gap-4">
                <dt>{l.label}<span className="block text-xs text-gray-500 dark:text-gray-400">{l.detail}</span></dt>
                <dd className="shrink-0">{fmtMoney(l.amount, c)}</dd>
              </div>
            ))}
            {parseFloat(items.discount) > 0 && (
              <div className="flex justify-between gap-4 text-green-700 dark:text-green-400">
                <dt>{items.discount_note || "Savings"}</dt><dd className="shrink-0">−{fmtMoney(items.discount, c)}</dd>
              </div>
            )}
          </dl>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3"><div className="text-xs text-gray-500 dark:text-gray-400">Total</div><div className="font-montserrat font-bold text-lg text-text-primary">{fmtMoney(booking.total_amount, c)}</div></div>
            <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-3"><div className="text-xs text-green-800 dark:text-green-400">Paid</div><div className="font-montserrat font-bold text-lg text-green-900 dark:text-green-300">{fmtMoney(booking.amount_paid, c)}</div></div>
            <div className="rounded-xl bg-primary/10 p-3"><div className="text-xs text-[#6B4E1A] dark:text-primary">Balance</div><div className="font-montserrat font-bold text-lg text-text-primary">{fmtMoney(booking.balance, c)}</div></div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3"><div className="text-xs text-gray-500 dark:text-gray-400">Balance due</div><div className="font-montserrat font-bold text-lg text-text-primary">{balance > 0 ? fmtDate(booking.payment_deadline) : "Paid in full"}</div></div>
          </div>
          <div className="h-2 rounded-full bg-primary/20 overflow-hidden" role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100} aria-label="Paid so far">
            <div className="h-full bg-primary" style={{ width: `${paidPct}%` }} />
          </div>
          <div className="flex items-center gap-4 pt-2 break-inside-avoid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${BASE_URL}payments/bookings/${booking.reference}/qr.png`} alt={`QR code for booking ${booking.reference}`} width={88} height={88} className="shrink-0 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5 bg-white" />
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">Scan to verify booking {booking.reference} and see its live payment status.</p>
          </div>
        </section>

        <section className={`${card} flex-[1_1_340px] min-w-0 gap-4`}>
          <h2 className="font-raleway font-bold text-[17px] text-text-primary">What happens next</h2>
          {[
            ...(isTrip ? [{
              title: "Complete your travel information",
              body: "Flights, transfers, emergency contact, dietary and accessibility needs.",
              cta: { href: `/booking/${booking.reference}/travel`, label: "Start the form" },
            }] : []),
            {
              title: "Your coordinator calls within 24 hours",
              body: `${booking.coordinator_name ?? "Your coordinator"} will confirm names, rooms and payment dates.`,
            },
            balance > 0
              ? { title: `Pay your balance by ${fmtDate(booking.payment_deadline)}`, body: "We'll send reminders before it's due. Pay any time from My Booking.", cta: { href: `/booking/${booking.reference}/pay`, label: "Make a payment" } }
              : { title: "You're paid in full", body: "Nothing more to pay. Your receipt is in your inbox." },
          ].map((step, i) => (
            <div key={step.title} className="flex gap-3">
              <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-montserrat font-bold text-xs ${i === 0 ? "bg-primary text-white" : "bg-primary/10 text-[#8A6420] dark:text-primary"}`}>{i + 1}</span>
              <div className="flex flex-col gap-1">
                <strong className="text-sm text-text-primary">{step.title}</strong>
                <span className="text-[13px] text-gray-700 dark:text-gray-300">{step.body}</span>
                {"cta" in step && step.cta && (
                  <Link href={step.cta.href} className="self-start mt-1 bg-primary text-white font-montserrat font-semibold text-[13px] px-4 py-2.5 rounded-xl print:hidden">{step.cta.label}</Link>
                )}
              </div>
            </div>
          ))}
          <Link href="/dashboard" className="text-sm font-semibold text-[#8A6420] dark:text-primary print:hidden">Go to My Booking</Link>
        </section>
      </div>

      {booking.pay_separately && <GroupShares booking={booking} />}

      {isTrip && (
        <section className={`${card} gap-4 print:hidden`}>
          <div className="flex flex-wrap justify-between items-baseline gap-2">
            <h2 className="font-raleway font-bold text-[17px] text-text-primary">Make it even better</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">Add any time before the trip</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {UPSELLS.map((u) => (
              <div key={u.name} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-2">
                <span className="font-raleway font-bold text-text-primary">{u.name}</span>
                <span className="text-[13px] leading-relaxed text-gray-700 dark:text-gray-300">{u.note}</span>
                <span className="self-start mt-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">Coming soon · price on approval</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="w-full px-4 md:px-10 mt-24 py-12 flex items-start justify-center min-h-[80vh] bg-gray-50 dark:bg-gray-950">
      <Suspense fallback={<div className="flex flex-col items-center gap-4"><Spin /></div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
