"use client";

/**
 * Customer dashboard. For the 95% case (one booking) the dashboard IS the
 * booking detail — no list-then-click indirection. The payment panel
 * (progress, balance, deadline, top-up) is the centerpiece.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { BASE_URL } from "@/lib/api/baseApi";
import {
  useGetMyBookingsQuery,
  useInitializePaymentMutation,
  type BookingDetail,
  type PaymentRow,
} from "@/lib/api/bookingsApi";
import { useGetTripUpdatesQuery, useGetPackageDetailQuery } from "@/lib/api/packagesApi";
import Spinner from "@/components/ui/Spinner";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import {
  useLazyCancellationQuoteQuery,
  useRequestCancellationMutation,
  useAvailableAddonsQuery,
} from "@/lib/api/bookingsApi";
import { fmtMoney, fmtDate, fmtDateLong, daysUntil } from "@/lib/format";
import { useRequestAccountDeletionMutation } from "@/lib/api/authApi";

// ── Payment panel ────────────────────────────────────────────────────────────

function PaymentPanel({ booking }: { booking: BookingDetail }) {
  const router = useRouter();
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const total = parseFloat(booking.total_amount);
  const paid = parseFloat(booking.amount_paid);
  const balance = parseFloat(booking.balance);
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

  const pay = async (intent: "balance" | "custom", amount?: string) => {
    setError(null);
    try {
      const payment = await initializePayment({
        booking_id: booking.id,
        intent,
        ...(intent === "custom" ? { amount } : {}),
        channel: "any", // Paystack's popup collects the method, network and number
      }).unwrap();
      await routeAfterInitialize(payment, (reference) =>
        router.push(`/payment/callback?reference=${reference}`),
      );
    } catch (err: unknown) {
      setError((err as { data?: { detail?: string } })?.data?.detail ?? "Could not start the payment.");
    }
  };

  const customValid =
    customAmount !== "" &&
    !Number.isNaN(parseFloat(customAmount)) &&
    parseFloat(customAmount) > 0 &&
    parseFloat(customAmount) <= balance;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-raleway text-text-primary">Payments</h2>
        {booking.payment_state === "fully_paid" ? (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold font-open-sans">FULLY PAID</span>
        ) : paid > 0 ? (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold font-open-sans">PARTIALLY PAID</span>
        ) : (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold font-open-sans">UNPAID</span>
        )}
      </div>

      {/* What the total is made of — server-computed, matches the receipt */}
      <details className="mb-4 rounded-xl border border-gray-100 dark:border-gray-800 open:bg-gray-50/60 dark:open:bg-gray-800/40">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold font-open-sans text-text-primary">
          Price breakdown · {fmtMoney(booking.line_items.total, booking.currency)}
        </summary>
        <div className="px-4 pb-3 flex flex-col gap-1.5 text-sm font-open-sans">
          {booking.line_items.lines.map((l) => (
            <div key={l.label + l.detail} className="flex justify-between gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                {l.label}
                <span className="block text-xs text-gray-500 dark:text-gray-400">{l.detail}</span>
              </span>
              <span className="text-text-primary shrink-0">{fmtMoney(l.amount, booking.currency)}</span>
            </div>
          ))}
          {parseFloat(booking.line_items.discount) > 0 && (
            <div className="flex justify-between gap-4 text-green-700 dark:text-green-400">
              <span>{booking.line_items.discount_note || "Bundle discount"}</span>
              <span className="shrink-0">− {fmtMoney(booking.line_items.discount, booking.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 font-semibold text-text-primary">
            <span>Total</span><span>{fmtMoney(booking.line_items.total, booking.currency)}</span>
          </div>
        </div>
      </details>

      {/* Progress */}
      <div className="mb-2 flex justify-between text-sm font-open-sans">
        <span className="text-gray-700 dark:text-gray-300">
          Paid <span className="font-bold text-text-primary">{fmtMoney(booking.amount_paid, booking.currency)}</span>
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          of <span className="font-semibold">{fmtMoney(booking.total_amount, booking.currency)}</span>
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {balance > 0 && (
        <>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm font-open-sans text-gray-700 dark:text-gray-300">Remaining balance</span>
            <span className="text-xl font-bold font-raleway text-primary">{fmtMoney(booking.balance, booking.currency)}</span>
          </div>
          {booking.payment_deadline && (() => {
            const days = daysUntil(booking.payment_deadline);
            const overdue = days !== null && days < 0;
            return (
              <p className={`text-sm font-open-sans mb-4 ${overdue ? "text-red-600 font-bold" : "text-gray-700 dark:text-gray-300"}`}>
                {overdue && booking.cure_deadline
                  ? `Overdue — please pay by ${new Date(booking.cure_deadline).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra" })} GMT. No late fee; we'll contact you before anything changes.`
                  : overdue
                  ? `Payment deadline passed on ${fmtDate(booking.payment_deadline)} — please pay now or contact us.`
                  : <>Full balance due by <span className="font-bold text-text-primary">{fmtDate(booking.payment_deadline)}</span>{days !== null && ` (in ${days} day${days === 1 ? "" : "s"})`}</>}
              </p>
            );
          })()}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-open-sans text-red-600">{error}</div>
          )}

          {booking.currency !== "GHS" && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mb-3">
              Payments are processed in GHS at today&apos;s live exchange rate — the exact
              GHS amount is shown on the secure payment page.
            </p>
          )}
          {booking.cancellation_request?.status === "pending" ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-open-sans text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Cancellation requested on {fmtDate(booking.cancellation_request.requested_at)} — under review.</p>
              <p className="mt-1">
                Estimated refund {fmtMoney(booking.cancellation_request.refund_total ?? "0", booking.currency)}
                {booking.cancellation_request.percent && ` (${parseFloat(booking.cancellation_request.percent)}% of amount paid)`}.
                Payments are paused until we confirm the outcome by email.
              </p>
            </div>
          ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => pay("balance")}
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Spinner className="w-4 h-4 text-white" />}
              Pay remaining {fmtMoney(booking.balance, booking.currency)}
            </button>
            <button
              onClick={() => setCustomOpen(!customOpen)}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-text-primary py-3 rounded-full font-semibold font-open-sans text-sm hover:border-primary transition-colors"
            >
              Pay a custom amount
            </button>
          </div>
          )}

          {customOpen && (
            <div className="mt-4 flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max={balance}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={`Amount in ${booking.currency}`}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-1.5">
                  Between {fmtMoney(1, booking.currency)} and {fmtMoney(booking.balance, booking.currency)}.
                  {customValid && ` Balance after payment: ${fmtMoney(balance - parseFloat(customAmount), booking.currency)}.`}
                </p>
              </div>
              <button
                onClick={() => pay("custom", parseFloat(customAmount).toFixed(2))}
                disabled={!customValid || isLoading}
                className="bg-primary text-white px-6 py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Pay
              </button>
            </div>
          )}
        </>
      )}

      {(booking.status === "pending" || booking.status === "confirmed") &&
        booking.cancellation_request?.status !== "pending" && (
          <CancellationRequestPanel booking={booking} />
        )}
      {booking.cancellation_request && booking.cancellation_request.status !== "pending" && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 font-open-sans">
          Cancellation request of {fmtDate(booking.cancellation_request.requested_at)}:{" "}
          <span className="font-semibold capitalize">{booking.cancellation_request.status}</span>
          {booking.cancellation_request.staff_note && ` — ${booking.cancellation_request.staff_note}`}
        </p>
      )}
    </div>
  );
}

// ── Cancellation request (Refund Policy) ─────────────────────────────────────

function CancellationRequestPanel({ booking }: { booking: BookingDetail }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchQuote, { data: quote, isFetching }] = useLazyCancellationQuoteQuery();
  const [request, { isLoading }] = useRequestCancellationMutation();

  const start = () => {
    setOpen(true);
    fetchQuote(booking.reference);
  };

  const submit = async () => {
    setError(null);
    try {
      const r = await request({ reference: booking.reference, reason }).unwrap();
      setDone(`Request received ${new Date(r.requested_at).toLocaleString("en-GB")}. We've emailed you a confirmation.`);
    } catch (err: unknown) {
      setError((err as { data?: { detail?: string } })?.data?.detail ?? "Could not submit the request.");
    }
  };

  if (done) {
    return <p className="mt-6 text-sm font-open-sans text-green-700 dark:text-green-400">{done}</p>;
  }

  return (
    <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
      {!open ? (
        <button onClick={start} className="text-xs font-semibold font-open-sans text-gray-500 hover:text-red-600 underline underline-offset-2">
          Need to cancel? Request cancellation
        </button>
      ) : (
        <div className="flex flex-col gap-3 text-sm font-open-sans">
          <p className="font-bold font-raleway text-text-primary">Request cancellation</p>
          {isFetching || !quote ? (
            <Spinner />
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Amount paid</span><span>{fmtMoney(quote.breakdown.net_paid, quote.currency)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Days before departure</span><span>{quote.breakdown.days_before_departure}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Refund rate</span><span>{parseFloat(quote.breakdown.percent)}%</span></div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5 font-bold text-text-primary">
                <span>Estimated refund if you request today</span><span>{fmtMoney(quote.refund_total, quote.currency)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Calculated from the moment your request is received. {quote.arrival_rule} No further balance is
                collected after cancellation.
              </p>
            </div>
          )}
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary resize-none"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={isLoading || !quote?.eligible}
              className="bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Submitting…" : "Submit cancellation request"}
            </button>
            <button onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold text-text-primary">
              Keep my booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add an experience after booking ──────────────────────────────────────────

function AddExperience({ booking }: { booking: BookingDetail }) {
  const router = useRouter();
  const { data } = useAvailableAddonsQuery(booking.reference);
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();
  const [chosen, setChosen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!data || (!data.can_add && !data.reason) || (data.can_add && data.addons.length === 0)) return null;
  const addon = data.addons.find((a) => a.code === chosen);

  const pay = async () => {
    if (!addon) return;
    setError(null);
    try {
      const payment = await initializePayment({ booking_id: booking.id, intent: "addon", addon_code: addon.code, channel: "any" }).unwrap();
      await routeAfterInitialize(payment, (reference) => router.push(`/payment/callback?reference=${reference}`));
    } catch (err: unknown) {
      setError((err as { data?: { detail?: string } })?.data?.detail ?? "Could not start the payment.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h2 className="text-lg font-bold font-raleway text-text-primary mb-1">Add an experience</h2>
      {!data.can_add ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans">{data.reason}</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mb-4">
            Pay for it now and it&apos;s added to your booking straight away. Available until {data.open_until ? fmtDate(data.open_until) : "a week before departure"}.
          </p>
          <div className="flex flex-col gap-2">
            {data.addons.map((a) => (
              <button
                key={a.code}
                onClick={() => setChosen(chosen === a.code ? null : a.code)}
                className={`text-left rounded-xl border p-4 flex justify-between gap-4 transition-colors ${chosen === a.code ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700 hover:border-primary/50"}`}
              >
                <span>
                  <span className="text-sm font-semibold font-open-sans text-text-primary">{a.name}</span>
                  {a.description && <span className="block text-xs text-gray-500 dark:text-gray-400">{a.description}</span>}
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{a.quantity} × {fmtMoney(a.unit_price, data.currency)}</span>
                </span>
                <span className="text-sm font-bold font-open-sans text-text-primary shrink-0">{fmtMoney(a.line_total, data.currency)}</span>
              </button>
            ))}
          </div>
          {addon && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={pay}
                disabled={isLoading}
                className="bg-primary text-white px-6 py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading && <Spinner className="w-4 h-4 text-white" />}
                Pay {fmtMoney(addon.line_total, data.currency)} and add {addon.name}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">Cancelling it later keeps 50% of its price (booking terms).</span>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600 font-open-sans">{error}</p>}
        </>
      )}
    </div>
  );
}

// ── Receipt modal (print-friendly) ───────────────────────────────────────────

function ReceiptModal({ booking, payment, onClose }: {
  booking: BookingDetail;
  payment: PaymentRow;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:p-0" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 print:dark:bg-white rounded-2xl max-w-md w-full p-8 print:shadow-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-5 mb-5">
          <p className="text-lg font-bold font-raleway text-primary tracking-widest uppercase">Azura Travels</p>
          <p className="text-xs text-gray-500 font-open-sans mt-1">Payment Receipt</p>
        </div>
        <div className="flex justify-center mb-5 print:block">
          {/* QR encodes the booking's public verification URL; server-rendered PNG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${BASE_URL}payments/bookings/${booking.reference}/qr.png`}
            alt={`QR code for booking ${booking.reference}`}
            width={110}
            height={110}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 bg-white"
          />
          <span className="sr-only">Scan to verify booking {booking.reference}</span>
        </div>
        <div className="flex flex-col gap-3 text-sm font-open-sans">
          {[
            ["Booking reference", booking.reference],
            ["Payment reference", payment.reference ?? `offline-${payment.id.slice(0, 8)}`],
            ["Guest", `${booking.first_name} ${booking.last_name}`],
            ["Package", booking.package_title],
            ["Payment type", payment.purpose],
            ["Method", payment.method.replace("_", " ")],
            ["Date", payment.paid_at ? fmtDateLong(payment.paid_at) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-semibold text-text-primary text-right capitalize">{value}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-1">
            <span className="font-bold text-text-primary">Amount paid</span>
            <span className="font-bold text-primary text-lg">{fmtMoney(payment.amount, payment.currency)}</span>
          </div>
          {payment.charged_amount && payment.charged_currency && (
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Processed by card as</span>
              <span>{fmtMoney(payment.charged_amount, payment.charged_currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Booking balance after all payments</span>
            <span>{fmtMoney(booking.balance, booking.currency)}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-primary text-white py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors"
          >
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-gray-700 text-text-primary py-3 rounded-full font-semibold font-open-sans text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking detail block ─────────────────────────────────────────────────────
const FALLBACK_COVER = "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=800&q=80";

function PackageCoverImage({ packageId, alt }: { packageId: string; alt: string }) {
  const { data: pkg } = useGetPackageDetailQuery(packageId, { skip: !packageId });
  const cover = pkg?.images.find((img) => img.is_cover)?.image ?? pkg?.images[0]?.image ?? FALLBACK_COVER;
  return (
    <img
      src={cover}
      alt={alt}
      className="w-full h-48 md:h-56 object-cover"
    />
  );
}
function BookingBlock({ booking }: { booking: BookingDetail }) {
  const [receiptFor, setReceiptFor] = useState<PaymentRow | null>(null);
  const successfulPayments = booking.payments.filter((p) => p.status === "success" || p.status === "refunded");

  const statusColor: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Trip header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <PackageCoverImage packageId={booking.package_id} alt={booking.package_title} />
        <div className="bg-primary/5 px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans uppercase tracking-wide">
              Booking {booking.reference}
            </p>
            <h2 className="text-xl font-bold font-raleway text-text-primary mt-0.5">{booking.package_title}</h2>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold font-open-sans uppercase ${statusColor[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
            {booking.status}
          </span>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-open-sans">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Travel date</p>
            <p className="font-semibold text-text-primary">{fmtDate(booking.travel_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Guests</p>
            <p className="font-semibold text-text-primary">{booking.num_guests}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lead guest</p>
            <p className="font-semibold text-text-primary">{booking.first_name} {booking.last_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Booked on</p>
            <p className="font-semibold text-text-primary">{fmtDate(booking.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Payment panel */}
      <PaymentPanel booking={booking} />

      {/* Add an experience (owner rule: until 7 days before departure) */}
      {(booking.status === "pending" || booking.status === "confirmed") && <AddExperience booking={booking} />}

      {/* Payment history */}
      {successfulPayments.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold font-raleway text-text-primary mb-4">Payment history</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-open-sans">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Method</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {successfulPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {payment.paid_at ? fmtDate(payment.paid_at) : "—"}
                    </td>
                    <td className="py-3 pr-4 capitalize text-gray-700 dark:text-gray-300">{payment.purpose}</td>
                    <td className="py-3 pr-4 capitalize text-gray-700 dark:text-gray-300">{payment.method.replace("_", " ")}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-text-primary whitespace-nowrap">
                      {fmtMoney(payment.amount, payment.currency)}
                      {payment.status === "refunded" && (
                        <span className="ml-2 text-xs text-red-500 font-open-sans">refunded</span>
                      )}
                      {payment.disputed && (
                        <span className="ml-2 text-xs text-amber-700 font-open-sans" title="Your bank has opened a dispute on this payment">disputed</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setReceiptFor(payment)}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trip updates */}
      <TripUpdates packageId={booking.package_id} />

      {receiptFor && <ReceiptModal booking={booking} payment={receiptFor} onClose={() => setReceiptFor(null)} />}
    </div>
  );
}

function TripUpdates({ packageId }: { packageId: string }) {
  const { data: updates } = useGetTripUpdatesQuery(packageId, { skip: !packageId });
  if (!updates || updates.length === 0) return null;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h2 className="text-lg font-bold font-raleway text-text-primary mb-4">Trip updates</h2>
      <div className="flex flex-col gap-5">
        {updates.map((update) => (
          <div key={update.id} className="border-l-2 border-primary pl-4">
            <p className="text-sm font-bold font-open-sans text-text-primary">{update.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mb-1.5">{fmtDate(update.published_at)}</p>
            <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{update.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
function BookingsFilter({
  search,
  setSearch,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onClear,
  hasFilters,
}: {
  search: string;
  setSearch: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col gap-4 lg:sticky lg:top-24">
        <p className="text-sm font-bold font-raleway text-text-primary">Filter bookings</p>

        <div>
          <label htmlFor="bk-search" className="block text-xs font-semibold font-open-sans text-text-primary mb-1.5">
            Search
          </label>
          <div className="relative">
            <svg
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="bk-search"
              type="text"
              placeholder="Reference or tour name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bk-from" className="block text-xs font-semibold font-open-sans text-text-primary mb-1.5">
            Travel date from
          </label>
          <input
            id="bk-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="bk-to" className="block text-xs font-semibold font-open-sans text-text-primary mb-1.5">
            Travel date to
          </label>
          <input
            id="bk-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-open-sans text-text-primary outline-none focus:border-primary transition-colors"
          />
        </div>

        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs font-semibold font-open-sans text-primary hover:underline text-left"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { token, hydrated } = useSelector((state: RootState) => state.auth);
  const { data: bookings, isLoading, isError } = useGetMyBookingsQuery(undefined, { skip: !token });
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login?next=/dashboard");
    }
  }, [hydrated, token, router]);

  const activeBooking = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;
    if (bookings.length === 1) return bookings[0];
    return bookings.find((b) => b.reference === selected) ?? null;
  }, [bookings, selected]);

  if (!hydrated || (!token && !isError)) {
    return <main className="mt-24 py-16 flex justify-center min-h-[50vh]"><Spinner /></main>;
  }

  if (isLoading) {
    return <main className="mt-24 py-16 flex justify-center min-h-[50vh]"><Spinner /></main>;
  }

  return (
    <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-raleway text-text-primary">My Bookings</h1>
        <SupportAndPrivacy />
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans mb-2">
            No bookings on this account yet.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mb-6 max-w-md mx-auto">
            Booked as a guest? Open the link in your booking confirmation email to attach
            that booking to this account.
          </p>
          <Link
            href="/experiences"
            className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors"
          >
            Browse tours
          </Link>
        </div>
      ) : activeBooking ? (
        <>
          {bookings.length > 1 && (
            <button
              onClick={() => setSelected(null)}
              className="mb-6 text-sm font-semibold font-open-sans text-gray-700 dark:text-gray-300 hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              All bookings
            </button>
          )}
          <BookingBlock booking={activeBooking} />
        </>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <BookingsFilter
            search={search}
            setSearch={setSearch}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onClear={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
            hasFilters={!!(search || dateFrom || dateTo)}
          />

          <div className="flex-1 w-full">
            {(() => {
              const q = search.trim().toLowerCase();
              const filtered = bookings.filter((b) => {
                if (q && !b.reference.toLowerCase().includes(q) && !b.package_title.toLowerCase().includes(q)) return false;
                if (dateFrom && b.travel_date < dateFrom) return false;
                if (dateTo && b.travel_date > dateTo) return false;
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans">
                      No bookings match your filters.
                    </p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col gap-5">
                  {filtered.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelected(booking.reference)}
                      className="text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 font-open-sans tracking-wide">{booking.reference}</p>
                          <p className="text-lg font-bold font-raleway text-text-primary mt-1">{booking.package_title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mt-1.5">
                            {fmtDate(booking.travel_date)} · {booking.num_guests} guest{booking.num_guests > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold font-raleway text-primary whitespace-nowrap">
                            {fmtMoney(booking.amount_paid, booking.currency)}
                            <span className="text-gray-400 dark:text-gray-500 font-semibold"> / </span>
                            {fmtMoney(booking.total_amount, booking.currency)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans capitalize mt-1.5">
                            {booking.payment_state.replace("_", " ")} · {booking.status}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </main>
  );
}


/** Appendix C: the account shows how to reach us, and the Privacy Policy right to ask for deletion. */
function SupportAndPrivacy() {
  const [requestDeletion, { isLoading }] = useRequestAccountDeletionMutation();
  const [phase, setPhase] = useState<"idle" | "confirm" | "done">("idle");
  return (
    <div className="text-xs font-open-sans text-gray-600 dark:text-gray-300 text-right flex flex-col gap-1">
      <p>
        Need help? <a href="mailto:hello@azuratravels.live" className="text-primary font-semibold">hello@azuratravels.live</a>
      </p>
      {phase === "idle" && (
        <button onClick={() => setPhase("confirm")} className="text-gray-400 hover:text-red-600 underline underline-offset-2">Request account deletion</button>
      )}
      {phase === "confirm" && (
        <span className="flex gap-2 justify-end items-center">
          <span>Ask us to delete your account and personal data?</span>
          <button
            disabled={isLoading}
            onClick={async () => { try { await requestDeletion().unwrap(); } finally { setPhase("done"); } }}
            className="text-red-600 font-semibold"
          >Yes</button>
          <button onClick={() => setPhase("idle")} className="text-gray-500">No</button>
        </span>
      )}
      {phase === "done" && <span className="text-green-700 dark:text-green-400">Request received — we&apos;ll confirm by email.</span>}
    </div>
  );
}
