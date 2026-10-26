"use client";

/** Checkout step 3 (canvas: CheckoutPayment). Full payment vs securing rooms
 * with a part payment, both priced by the server; a group can choose to pay
 * per person. "Pay" creates the booking from the room hold (once — a retry
 * reuses it), then hands over to Paystack exactly like every other flow. An
 * optional Academy donation (a server-priced % of the trip) rides on that
 * first payment as its own line, split to the Academy at settlement. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutHeader from "@/components/booking/CheckoutHeader";
import DonationPicker from "@/components/booking/DonationPicker";
import Spinner from "@/components/ui/Spinner";
import {
  useComponentCheckoutMutation,
  useComponentQuoteMutation,
  useCreateHoldMutation,
  useInitializePaymentMutation,
  type ComponentQuote,
  type PaymentPlan,
} from "@/lib/api/bookingsApi";
import { useGetComponentMatrixQuery } from "@/lib/api/packagesApi";
import { fmtDate, fmtMoney } from "@/lib/format";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import { savePendingBooking } from "@/lib/pendingBooking";
import { guestCount, loadCheckout, saveCheckout, splitName, toSelection, type CheckoutState } from "@/lib/trip";

type Phase = "idle" | "creating" | "redirecting";

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600 * 1000).toISOString();

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [state, setState] = useState<CheckoutState | null | undefined>(undefined);
  useEffect(() => {
    const s = loadCheckout();
    if (s && !s.details) { router.replace("/checkout/details"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read sessionStorage after hydration
    setState(s);
  }, [router]);

  const { data: matrix } = useGetComponentMatrixQuery(state?.packageId ?? "", { skip: !state });
  const [requestQuote] = useComponentQuoteMutation();
  const [createHold] = useCreateHoldMutation();
  const [checkout] = useComponentCheckoutMutation();
  const [initializePayment] = useInitializePaymentMutation();
  const [quotes, setQuotes] = useState<Partial<Record<PaymentPlan, ComponentQuote>>>({});
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [paySeparately, setPaySeparately] = useState(false);
  const [donation, setDonation] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseSelection = useMemo(() => (state && matrix ? toSelection(state.packageId, state.choices, matrix) : null), [state, matrix]);

  // Price both plans; the deposit option exists only if the server prices it.
  useEffect(() => {
    if (!baseSelection || !matrix) return;
    const hold_token = state?.hold?.token;
    requestQuote({ ...baseSelection, hold_token, payment_plan: "full" }).unwrap()
      .then((q) => setQuotes((prev) => ({ ...prev, full: q })))
      .catch((e) => setError(e?.data?.detail ?? "We couldn't price this trip."));
    if (matrix.installments.enabled) {
      requestQuote({ ...baseSelection, hold_token, payment_plan: "installment" }).unwrap()
        .then((q) => setQuotes((prev) => ({ ...prev, installment: q })))
        .catch(() => { /* not eligible (e.g. no rooms to spread) — full only */ });
    }
  }, [baseSelection, matrix, requestQuote, state?.hold?.token]);

  const chosen: PaymentPlan = state?.booking?.plan ?? plan ?? (quotes.installment ? "installment" : "full");
  const quote = quotes[chosen] ?? quotes.full;
  const separately = state?.booking?.paySeparately ?? paySeparately;
  // Preview of the server's split (organiser's share + every room deposit); the
  // amount actually charged is the booking's deposit, priced server-side.
  const dueNowFor = (q: ComponentQuote) => separately
    ? q.travellers.reduce((sum, t, i) => sum + parseFloat(i === 0 ? t.due_now : t.room_deposit), 0).toFixed(2)
    : q.amount_due_today;
  const dueNow = quote ? dueNowFor(quote) : undefined;
  const gift = quote?.donation_options.find((o) => o.percent === donation);
  // What this payment charges: the booking part plus any donation. Paying in
  // one go uses the server's figure; a per-guest split previews the sum.
  const payNow = gift ? (separately ? (parseFloat(dueNow!) + parseFloat(gift.amount)).toFixed(2) : gift.due_today) : dueNow;

  if (state === undefined) return <Centered><Spinner /></Centered>;
  if (!state || !state.details) {
    return (
      <Centered>
        <p className="text-gray-700 dark:text-gray-300">Your trip wasn&apos;t found in this tab.</p>
        <Link href="/experiences" className="font-semibold text-[#8A6420] dark:text-primary">Choose an experience</Link>
      </Centered>
    );
  }

  const d = state.details;
  const n = guestCount(state.choices);
  const c = quote?.currency ?? matrix?.currency ?? "USD";

  const pay = async () => {
    if (!quote || !baseSelection || phase !== "idle") return;
    setError(null);
    setPhase("creating");
    try {
      let current = state;
      if (!current.booking) {
        let hold = current.hold;
        const { first, last } = splitName(d.fullName);
        const place = (token: string) => checkout({
          ...baseSelection,
          payment_plan: chosen,
          travellers: baseSelection.travellers.map((t, i) => ({ ...t, name: current.choices.names[i] })),
          hold_token: token,
          first_name: first, last_name: last, email: d.email, phone: d.phone || undefined, country: d.country || undefined,
          accepted_policies: d.acceptedPolicies, marketing_consent: d.marketingConsent,
          pay_separately: separately, whatsapp_updates: !!d.whatsappUpdates,
          expected_total: quote.total,
          ...(current.linkedTo ? { linked_to: current.linkedTo } : {}),
        }).unwrap();
        let booking;
        try {
          booking = await place(hold?.token ?? "");
        } catch (first: unknown) {
          // The hold ran out while the guest filled in details: re-hold once and retry.
          const detail = (first as { data?: { detail?: string } }).data?.detail ?? "";
          if (!baseSelection.rooms.length || !/hold/i.test(detail)) throw first;
          hold = await createHold({
            package_id: current.packageId, stay_types: baseSelection.rooms.map((r) => r.stay_type), replace_token: hold?.token,
          }).unwrap();
          booking = await place(hold.token);
        }
        current = { ...current, hold, booking: { id: booking.id, reference: booking.reference, plan: chosen, paySeparately: separately } };
        saveCheckout(current);
        setState(current);
        savePendingBooking({
          bookingId: booking.id, reference: booking.reference, email: d.email, packageTitle: current.packageTitle,
          amountDueToday: booking.amount_due_today, currency: booking.currency,
          expiresAt: hoursFromNow(24),
        });
      }
      const payment = await initializePayment({
        ...(gift ? { donation_percent: gift.percent } : {}),
        booking_id: current.booking!.id,
        intent: current.booking!.plan === "installment" || current.booking!.paySeparately ? "deposit" : "balance",
        channel: "any", // Paystack's page collects card or mobile money
      }).unwrap();
      setPhase("redirecting");
      await routeAfterInitialize(payment, (ref) => router.push(`/payment/callback?reference=${ref}`));
    } catch (err: unknown) {
      setPhase("idle");
      const e = err as { status?: number; data?: { detail?: string; quote?: ComponentQuote } };
      if (e.status === 409 && e.data?.quote) {
        setQuotes((prev) => ({ ...prev, [chosen]: e.data!.quote }));
        setError("The price changed since you started. Please check the new total and pay again.");
      } else {
        setError(e.data?.detail ?? "Payment didn't start. No money was taken — please try again.");
      }
    }
  };

  const plans: { id: PaymentPlan; label: string; q?: ComponentQuote; note: string }[] = [
    {
      id: "installment", label: `Secure rooms with ${parseFloat(quotes.installment?.accommodation_deposit_percent ?? "50")}%`, q: quotes.installment,
      note: `Core and experiences in full now · room balance by ${fmtDate(quotes.installment?.final_payment_deadline)}, reminders sent before`,
    },
    { id: "full", label: "Pay in full", q: quotes.full, note: "Nothing more to pay" },
  ];
  const locked = !!state.booking;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CheckoutHeader step={3} hold={state.booking ? null : state.hold} backHref="/checkout/details" />
      <main className="max-w-[760px] mx-auto px-4 md:px-10 pt-10 pb-20 flex flex-col gap-5">
        <div>
          <h1 className="font-raleway text-[30px] font-bold text-text-primary">Payment</h1>
          <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300">
            Booking for {d.fullName}{n > 1 ? ` and ${n - 1} guest${n > 2 ? "s" : ""}` : ""} · {state.packageTitle}
          </p>
        </div>

        <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-3.5">
          <h2 className="font-raleway font-bold text-[17px] text-text-primary">How would you like to pay?</h2>
          <div role="radiogroup" aria-label="Payment plan" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {plans.filter((p) => p.q).map((p) => {
              const on = chosen === p.id;
              return (
                <button
                  key={p.id} type="button" role="radio" aria-checked={on} disabled={locked && !on}
                  onClick={() => setPlan(p.id)}
                  className={`text-left p-4 rounded-xl border-2 flex flex-col gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${on ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700"}`}
                >
                  <span className="font-raleway font-bold text-[15px] text-text-primary">{p.label}</span>
                  <span className="font-montserrat font-bold text-xl text-text-primary">{fmtMoney(dueNowFor(p.q!), c)}</span>
                  {separately && <span className="text-xs text-gray-500 dark:text-gray-400">your share and the room deposits</span>}
                  <span className="text-xs text-gray-700 dark:text-gray-300">{p.note}</span>
                </button>
              );
            })}
          </div>
          {quote ? (
            <dl className={`grid ${gift ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"} gap-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3.5 text-[13px]`}>
              <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">Trip total</dt><dd className="font-montserrat font-bold text-text-primary">{fmtMoney(quote.total, c)}</dd></div>
              {gift && <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">Academy donation ({gift.percent}%)</dt><dd className="font-montserrat font-bold text-text-primary">+{fmtMoney(gift.amount, c)}</dd></div>}
              <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">Paying now</dt><dd className="font-montserrat font-bold text-[#8A6420] dark:text-primary">{fmtMoney(payNow!, c)}</dd></div>
              <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">Balance after</dt><dd className="font-montserrat font-bold text-text-primary">{fmtMoney((parseFloat(quote.total) - parseFloat(dueNow!)).toFixed(2), c)}</dd></div>
            </dl>
          ) : <Spinner />}
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Charged in Ghana cedis at today&apos;s rate through our secure payment partner. Your booking and balance stay in {c}.
            {matrix?.notices.fees ? ` ${matrix.notices.fees}` : ""}
          </p>
        </section>

        {state.choices.mode === "group" && quote && (
          <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-3.5">
            <h2 className="font-raleway font-bold text-[17px] text-text-primary">Who pays?</h2>
            <div role="radiogroup" aria-label="Who pays" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { on: false, label: "I'll pay for everyone", note: "One payment for the whole group." },
                { on: true, label: "Each guest pays their share", note: "You pay your share plus the room deposits now; we give you a pay link for each guest." },
              ].map((o) => (
                <button
                  key={o.label} type="button" role="radio" aria-checked={separately === o.on} disabled={locked && separately !== o.on}
                  onClick={() => setPaySeparately(o.on)}
                  className={`text-left p-4 rounded-xl border-2 flex flex-col gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${separately === o.on ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700"}`}
                >
                  <span className="font-raleway font-bold text-[15px] text-text-primary">{o.label}</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{o.note}</span>
                </button>
              ))}
            </div>
            {separately && (
              <dl className="flex flex-col gap-1.5 text-[13px] text-gray-700 dark:text-gray-300">
                {quote.travellers.map((t, i) => (
                  <div key={t.index} className="flex justify-between gap-3">
                    <dt>{state.choices.names[i] || `Guest ${i + 1}`}{i === 0 ? " (you)" : ""}</dt>
                    <dd className="shrink-0">{fmtMoney(t.share, c)} share · {fmtMoney(i === 0 ? t.due_now : t.room_deposit, c)} now</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        )}

        {quote && quote.donation_options.length > 0 && (
          <DonationPicker options={quote.donation_options} currency={c} value={donation} onChange={setDonation} disabled={phase !== "idle"} />
        )}
        {gift && (
          <p className="-mt-2 px-1 text-[13px] text-gray-700 dark:text-gray-300">
            Total with your donation: <strong className="text-text-primary">{fmtMoney(gift.total, c)}</strong>
          </p>
        )}

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-5 flex gap-3 items-start">
            <span aria-hidden className="w-8 h-8 shrink-0 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">!</span>
            <div className="flex flex-col gap-1">
              <strong className="text-red-800 dark:text-red-200">Payment didn&apos;t go through</strong>
              <span className="text-sm leading-relaxed text-red-900 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {phase === "idle" ? (
          <div className="flex flex-col gap-3">
            <button type="button" onClick={pay} disabled={!quote} className="bg-primary text-white font-montserrat font-semibold text-base py-4 rounded-2xl transition hover:-translate-y-0.5 hover:brightness-95 motion-reduce:transform-none disabled:opacity-50">
              {quote ? `Pay ${fmtMoney(payNow!, c)} securely` : "Pricing…"}
            </button>
            <span className="text-center text-xs text-gray-500 dark:text-gray-400">Card or mobile money · You&apos;ll confirm on the secure payment page</span>
          </div>
        ) : (
          <div role="status" className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-7 flex items-center gap-4">
            <Spinner />
            <div className="flex flex-col gap-0.5">
              <strong className="text-text-primary">{phase === "creating" ? "Securing your booking…" : "Opening secure payment…"}</strong>
              <span className="text-[13px] text-gray-700 dark:text-gray-300">Please don&apos;t close this page. We confirm only after the payment is verified.</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-500 dark:text-gray-400 pt-1.5">
          <span>Secure checkout</span><span>No duplicate charges</span><span>Receipt sent by email</span>
        </div>
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="min-h-[60vh] flex flex-col gap-3 items-center justify-center p-6 text-center">{children}</main>;
}
