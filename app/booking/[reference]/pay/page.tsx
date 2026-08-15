"use client";

/**
 * Resume/retry payment page — the recovery surface for closed Paystack tabs,
 * declined cards and callback timeouts. Every retry mints a fresh payment
 * attempt server-side (references are never reused).
 */

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetBookingByReferenceQuery,
  useInitializePaymentMutation,
} from "@/lib/api/bookingsApi";
import Spinner from "@/components/ui/Spinner";
import { fmtMoney, fmtDateLong } from "@/lib/format";
import { clearPendingBooking } from "@/lib/pendingBooking";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import PaymentMethodPicker, {
  DEFAULT_PAYMENT_METHOD,
  paymentMethodDisabledReason,
  type PaymentMethodState,
} from "@/components/payments/PaymentMethodPicker";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CreditCardIcon,
  LockIcon,
  SmartphoneIcon,
} from "@/components/ui/icons";

export default function ResumePaymentPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const { data: booking, isLoading, isError } = useGetBookingByReferenceQuery(reference, { skip: !reference });
  const [initializePayment, { isLoading: isInitializing }] = useInitializePaymentMutation();
  const [error, setError] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethodState>(DEFAULT_PAYMENT_METHOD);

  const handlePay = async (intent: "deposit" | "balance") => {
    if (!booking) return;
    setError(null);
    try {
      const payment = await initializePayment({
        booking_id: booking.id,
        intent,
        channel: payMethod.channel,
        ...(payMethod.channel === "momo"
          ? { momo_phone: payMethod.momoPhone, momo_provider: payMethod.momoProvider || undefined }
          : {}),
      }).unwrap();
      await routeAfterInitialize(payment, (reference) =>
        router.push(`/payment/callback?reference=${reference}`),
      );
    } catch (err: unknown) {
      const detail = (err as { data?: { detail?: string } })?.data?.detail;
      if (detail?.toLowerCase().includes("expired")) {
        clearPendingBooking();
      }
      setError(detail ?? "Could not start the payment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <main className="w-full px-4 mt-24 py-10 flex items-center justify-center min-h-[50vh]"><Spinner /></main>
    );
  }

  if (isError || !booking) {
    return (
      <main className="w-full px-4 mt-24 py-10 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 font-open-sans text-sm mb-4">
            We couldn&apos;t find this booking.
          </p>
          <Link href="/" className="text-primary font-semibold font-open-sans text-sm underline">Return home</Link>
        </div>
      </main>
    );
  }

  const isPaid = booking.payment_state === "fully_paid";
  const isCancelled = booking.status === "cancelled";
  const balance = parseFloat(booking.balance);
  const paid = parseFloat(booking.amount_paid);
  const needsDeposit =
    booking.payment_plan === "installment" && booking.status === "pending" && paid === 0;

  return (
    <main className="w-full px-4 mt-24 py-10 max-w-lg mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-primary/5 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans uppercase tracking-wide mb-1">
            Booking {booking.reference}
          </p>
          <h1 className="text-xl font-bold font-raleway text-text-primary">{booking.package_title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mt-1">
            {fmtDateLong(booking.travel_date)}
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-2.5 text-sm font-open-sans mb-6">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Total</span>
              <span className="font-semibold text-text-primary">{fmtMoney(booking.total_amount, booking.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Paid so far</span>
              <span className="font-semibold text-green-700 dark:text-green-400">{fmtMoney(booking.amount_paid, booking.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2.5">
              <span className="font-bold text-text-primary">Remaining balance</span>
              <span className="font-bold text-primary">{fmtMoney(booking.balance, booking.currency)}</span>
            </div>
          </div>

          {error && (
            <div role="alert" className="mb-4 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5 text-sm font-open-sans text-red-700 dark:text-red-300 content-in">
              <AlertTriangleIcon size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {isCancelled ? (
            <p className="text-sm font-open-sans text-gray-600 dark:text-gray-300 text-center">
              This booking has been cancelled and can no longer be paid.
            </p>
          ) : isPaid ? (
            <div className="text-center">
              <p className="flex items-center justify-center gap-1.5 text-sm font-open-sans text-green-700 dark:text-green-400 font-semibold mb-4">
                <CheckCircleIcon size={16} />
                This booking is fully paid.
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-primary text-white px-6 py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors"
              >
                View in dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <PaymentMethodPicker value={payMethod} onChange={setPayMethod} />
              <button
                onClick={() => handlePay(needsDeposit ? "deposit" : "balance")}
                disabled={isInitializing || !!paymentMethodDisabledReason(payMethod)}
                className="w-full bg-primary text-white py-3.5 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 active:scale-[.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isInitializing ? <Spinner className="w-4 h-4 text-white" /> : <LockIcon size={14} />}
                {isInitializing
                  ? "Opening secure payment…"
                  : needsDeposit && balance > 0
                    ? "Pay to secure your booking"
                    : `Pay remaining ${fmtMoney(booking.balance, booking.currency)}`}
              </button>
              <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-open-sans">
                <span className="flex items-center gap-1"><CreditCardIcon size={12} /> Card</span>
                <span className="flex items-center gap-1"><SmartphoneIcon size={12} /> Mobile Money</span>
                <span className="flex items-center gap-1"><LockIcon size={12} /> via Paystack</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans text-center">
                A new secure Paystack session is created each time — retrying after a
                declined card is safe.
                {booking.currency !== "GHS" &&
                  " Payments are processed in GHS at the current exchange rate; the exact GHS amount is shown on the payment page."}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
