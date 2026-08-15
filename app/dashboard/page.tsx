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
import {
  useGetMyBookingsQuery,
  useInitializePaymentMutation,
  type BookingDetail,
  type PaymentRow,
} from "@/lib/api/bookingsApi";
import { useGetTripUpdatesQuery } from "@/lib/api/packagesApi";
import Spinner from "@/components/ui/Spinner";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import PaymentMethodPicker, {
  DEFAULT_PAYMENT_METHOD,
  paymentMethodDisabledReason,
  type PaymentMethodState,
} from "@/components/payments/PaymentMethodPicker";
import { fmtMoney, fmtDate, fmtDateLong, daysUntil } from "@/lib/format";

// ── Payment panel ────────────────────────────────────────────────────────────

function PaymentPanel({ booking }: { booking: BookingDetail }) {
  const router = useRouter();
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethodState>(DEFAULT_PAYMENT_METHOD);

  const total = parseFloat(booking.total_amount);
  const paid = parseFloat(booking.amount_paid);
  const balance = parseFloat(booking.balance);
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

  const pay = async (intent: "balance" | "custom", amount?: string) => {
    const methodProblem = paymentMethodDisabledReason(payMethod);
    if (methodProblem) {
      setError(methodProblem);
      return;
    }
    setError(null);
    try {
      const payment = await initializePayment({
        booking_id: booking.id,
        intent,
        ...(intent === "custom" ? { amount } : {}),
        channel: payMethod.channel,
        ...(payMethod.channel === "momo"
          ? { momo_phone: payMethod.momoPhone, momo_provider: payMethod.momoProvider || undefined }
          : {}),
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
                {overdue
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
          <div className="mb-4">
            <PaymentMethodPicker value={payMethod} onChange={setPayMethod} />
          </div>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { token, hydrated } = useSelector((state: RootState) => state.auth);
  const { data: bookings, isLoading, isError } = useGetMyBookingsQuery(undefined, { skip: !token });
  const [selected, setSelected] = useState<string | null>(null);

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
    <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold font-raleway text-text-primary mb-8">My Bookings</h1>

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
            href="/destinations"
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
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              onClick={() => setSelected(booking.reference)}
              className="text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:border-primary transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">{booking.reference}</p>
                  <p className="text-base font-bold font-raleway text-text-primary mt-0.5">{booking.package_title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-1">
                    {fmtDate(booking.travel_date)} · {booking.num_guests} guest{booking.num_guests > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold font-raleway text-primary">
                    {fmtMoney(booking.amount_paid, booking.currency)} / {fmtMoney(booking.total_amount, booking.currency)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans capitalize mt-1">
                    {booking.payment_state.replace("_", " ")} · {booking.status}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
