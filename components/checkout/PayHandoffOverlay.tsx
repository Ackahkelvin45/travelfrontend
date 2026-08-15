"use client";

import { LockIcon } from "@/components/ui/icons";

/**
 * Full-screen state shown from the moment the customer clicks Pay until the
 * browser leaves for Paystack — creating the booking + minting the payment
 * session takes a couple of seconds and MUST NOT look like a dead button.
 */
export default function PayHandoffOverlay({ phase }: { phase: "creating" | "redirecting" }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-white/95 dark:bg-gray-950/95 flex items-center justify-center p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center text-center max-w-xs content-in">
        <span className="relative w-16 h-16 mb-6" aria-hidden>
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
        <p className="text-lg font-bold font-raleway text-text-primary mb-1.5">
          {phase === "creating" ? "Preparing your booking…" : "Opening secure payment…"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans leading-relaxed">
          {phase === "creating"
            ? "Saving your booking details."
            : "You're being taken to Paystack's secure checkout."}{" "}
          Please don&apos;t close or refresh this page.
        </p>
      </div>
    </div>
  );
}
