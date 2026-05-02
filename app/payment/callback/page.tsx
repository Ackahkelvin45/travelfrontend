"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVerifyPaymentQuery } from "@/lib/api/bookingsApi";

const POLL_INTERVAL_MS = 3000; // re-check every 3 seconds
const MAX_POLL_ATTEMPTS = 20;  // stop polling after ~60 seconds

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref") ?? "";

  const pollCount = useRef(0);
  const [isPolling, setIsPolling] = useState(true);

  const { data, isLoading, isError } = useVerifyPaymentQuery(reference, {
    skip: !reference,
    pollingInterval: isPolling ? POLL_INTERVAL_MS : 0,
  });

  // Stop polling once we get a terminal status or hit the max attempt count
  useEffect(() => {
    if (!data) return;
    if (data.status !== "pending") {
      setIsPolling(false);
      return;
    }
    pollCount.current += 1;
    if (pollCount.current >= MAX_POLL_ATTEMPTS) {
      setIsPolling(false);
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    if (data.status === "success") {
      router.replace(`/booking/${data.booking_reference}/confirmed`);
    }
  }, [data, router]);

  if (!reference) {
    return (
      <div className="text-center">
        <p className="text-gray-500 font-open-sans text-sm mb-4">Invalid payment reference.</p>
        <button
          onClick={() => router.push("/destinations")}
          className="text-primary font-semibold font-open-sans text-sm underline"
        >
          Browse tours
        </button>
      </div>
    );
  }

  if (isLoading || (data?.status === "success")) {
    return (
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-text-primary font-semibold font-raleway text-base">
          {data?.status === "success" ? "Redirecting to confirmation…" : "Verifying your payment…"}
        </p>
        <p className="text-gray-400 font-open-sans text-sm">Please wait, do not close this page.</p>
      </div>
    );
  }

  if (isError || data?.status === "failed" || data?.status === "abandoned") {
    return (
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <p className="text-text-primary font-bold font-raleway text-xl">Payment {data?.status ?? "failed"}</p>
        <p className="text-gray-500 font-open-sans text-sm max-w-xs">
          {data?.status === "abandoned"
            ? "You closed the payment window. Your booking has not been confirmed."
            : "Something went wrong with your payment. Please try again."}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-2 bg-primary text-white px-6 py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (data?.status === "pending") {
    const timedOut = pollCount.current >= MAX_POLL_ATTEMPTS;
    return (
      <div className="text-center flex flex-col items-center gap-4">
        {timedOut ? (
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        ) : (
          <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        <p className="text-text-primary font-bold font-raleway text-xl">
          {timedOut ? "Payment Pending" : "Confirming payment…"}
        </p>
        <p className="text-gray-500 font-open-sans text-sm max-w-xs">
          {timedOut
            ? "We could not confirm your payment automatically. Please check your email or contact support."
            : "Still waiting for confirmation. Please keep this page open."}
        </p>
        {timedOut && (
          <button
            onClick={() => router.push("/")}
            className="mt-2 text-primary font-semibold font-open-sans text-sm underline"
          >
            Return home
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default function PaymentCallbackPage() {
  return (
    <main className="w-full px-10 mt-24 py-10 flex items-center justify-center min-h-[60vh]">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-text-primary font-semibold font-raleway text-base">Verifying your payment…</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </main>
  );
}
