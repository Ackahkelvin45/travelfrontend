"use client";

/**
 * Post-Paystack landing page.
 *
 * Verifies ONCE against the gateway, then polls the DB-only status endpoint
 * with backoff (3s → 10s → 30s, capped ~5 min for mobile-money). `abandoned`
 * is treated as transient for the first minutes — MoMo/3DS approvals lag.
 * Retry never reuses a checkout URL: it routes to the resume page, which
 * mints a fresh payment attempt.
 */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useVerifyPaymentQuery,
  useLazyPaymentStatusQuery,
  type PaymentStatusResponse,
} from "@/lib/api/bookingsApi";
import { clearPendingBooking } from "@/lib/pendingBooking";
import { readPaymentPrompt } from "@/lib/payments/paystack";
import { AlertTriangleIcon, ClockIcon, LockIcon, XIcon } from "@/components/ui/icons";

/** Dual-ring progress mark used while we confirm against the gateway. */
function ConfirmingSpinner() {
  return (
    <span className="relative w-16 h-16" aria-hidden>
      <svg className="absolute inset-0 w-16 h-16 text-primary/15" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <svg className="absolute inset-0 w-16 h-16 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-primary">
        <LockIcon size={20} />
      </span>
    </span>
  );
}

const MAX_POLL_MS = 5 * 60 * 1000;
const ABANDONED_GRACE_MS = 3 * 60 * 1000;

type Phase = "working" | "failed" | "timeout";

function backoffDelay(elapsedMs: number): number {
  if (elapsedMs < 30_000) return 3_000;
  if (elapsedMs < 120_000) return 10_000;
  return 30_000;
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";

  // One-shot gateway verify on landing.
  // One-shot verify at landing; `refetch` doubles as the "check status now"
  // lever — it makes the BACKEND re-ask Paystack in-request, which settles
  // paid charges even if the webhook pipeline is down.
  const {
    data: verifyData,
    isError: verifyError,
    refetch: reverify,
    isFetching: isReverifying,
  } = useVerifyPaymentQuery(reference, { skip: !reference });
  const momoPrompt = reference ? readPaymentPrompt(reference) : null;

  const [pollStatus] = useLazyPaymentStatusQuery();
  const [polled, setPolled] = useState<PaymentStatusResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("working");

  const status = polled ?? verifyData ?? null;

  // Poll loop: all state changes happen in async ticks, and terminal
  // decisions (failed / abandoned-past-grace / timeout) are made here — the
  // render below is pure.
  useEffect(() => {
    if (!reference) return;
    const startedAt = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const loop = async () => {
      if (cancelled) return;
      const elapsed = Date.now() - startedAt;
      if (elapsed > MAX_POLL_MS) {
        setPhase("timeout");
        return;
      }
      try {
        const result = await pollStatus(reference).unwrap();
        if (cancelled) return;
        setPolled(result);
        if (result.status === "success") return; // redirect effect takes over
        if (
          result.status === "failed" ||
          (result.status === "abandoned" && elapsed > ABANDONED_GRACE_MS)
        ) {
          setPhase("failed");
          return;
        }
      } catch { /* transient network error — keep polling */ }
      timer = setTimeout(loop, backoffDelay(Date.now() - startedAt));
    };

    timer = setTimeout(loop, 3000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [reference, pollStatus]);

  // Auto "check now" once at ~60s: if we're still pending by then the webhook
  // may be delayed/down — one synchronous gateway re-check settles paid charges.
  useEffect(() => {
    if (!reference) return;
    const timer = setTimeout(() => {
      reverify();
    }, 60_000);
    return () => clearTimeout(timer);
  }, [reference, reverify]);

  // Success → clear resume state, hand over to the success page.
  useEffect(() => {
    if (status?.status === "success") {
      clearPendingBooking();
      router.replace(`/payment/success?reference=${status.booking_reference}`);
    }
  }, [status, router]);

  if (!reference) {
    return (
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm mb-4">Invalid payment reference.</p>
        <button onClick={() => router.push("/destinations")} className="text-primary font-semibold font-open-sans text-sm underline">
          Browse tours
        </button>
      </div>
    );
  }

  if (phase === "failed" || (verifyError && !status)) {
    return (
      <div className="text-center flex flex-col items-center gap-4 content-in max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 text-red-500 flex items-center justify-center">
          <XIcon size={26} />
        </div>
        <p className="text-text-primary font-bold font-raleway text-xl">Payment not completed</p>
        <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm leading-relaxed">
          {status?.status === "abandoned"
            ? "The payment window was closed before the payment finished. Your booking is saved — you can pay whenever you're ready."
            : "Your card was not charged, or the charge did not complete. Your booking is saved and it's safe to try again."}
        </p>
        {status?.booking_reference && (
          <button
            onClick={() => router.push(`/booking/${status.booking_reference}/pay`)}
            className="mt-2 bg-primary text-white px-7 py-3 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 transition-colors"
          >
            Try payment again
          </button>
        )}
        <button
          onClick={() => router.push("/destinations")}
          className="text-sm font-semibold font-open-sans text-gray-500 dark:text-gray-400 hover:text-text-primary transition-colors"
        >
          Back to tours
        </button>
      </div>
    );
  }

  if (phase === "timeout") {
    return (
      <div className="text-center flex flex-col items-center gap-4 content-in max-w-sm">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-500 flex items-center justify-center">
          <ClockIcon size={26} />
        </div>
        <p className="text-text-primary font-bold font-raleway text-xl">Still confirming…</p>
        <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm leading-relaxed">
          Your payment may still be processing — this doesn&apos;t mean it failed. We&apos;ll
          email your receipt the moment it confirms, and you can check your booking status
          any time.
        </p>
        <button
          onClick={() => reverify()}
          disabled={isReverifying}
          className="mt-2 bg-primary text-white px-7 py-3 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isReverifying ? "Checking…" : "Check payment status now"}
        </button>
        {status?.booking_reference && (
          <button
            onClick={() => router.push(`/booking/${status.booking_reference}/pay`)}
            className="text-primary font-semibold font-open-sans text-sm underline"
          >
            View booking status
          </button>
        )}
      </div>
    );
  }

  const isMomoWait = status?.status === "abandoned" || status?.status === "pending";
  return (
    <div className="flex flex-col items-center gap-5 content-in max-w-sm text-center" role="status" aria-live="polite">
      <ConfirmingSpinner />
      <div>
        <p className="text-text-primary font-bold font-raleway text-xl mb-1.5">
          {status?.status === "success" ? "Payment confirmed — redirecting…" : "Confirming your payment…"}
        </p>
        <p className="text-gray-600 dark:text-gray-300 font-open-sans text-sm leading-relaxed">
          {momoPrompt
            ? momoPrompt
            : isMomoWait
              ? "If you approved a mobile money prompt, confirmation can take a few minutes."
              : "This usually takes a few seconds."}
        </p>
      </div>
      <button
        onClick={() => reverify()}
        disabled={isReverifying}
        className="text-primary font-semibold font-open-sans text-xs underline disabled:opacity-60"
      >
        {isReverifying ? "Checking…" : "Check payment status now"}
      </button>
      <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-open-sans">
        <AlertTriangleIcon size={12} />
        Please don&apos;t close or refresh this page while we confirm your payment.
      </p>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <main className="w-full px-10 mt-24 py-10 flex items-center justify-center min-h-[60vh]">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <ConfirmingSpinner />
            <p className="text-text-primary font-semibold font-raleway text-base">Verifying your payment…</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </main>
  );
}
