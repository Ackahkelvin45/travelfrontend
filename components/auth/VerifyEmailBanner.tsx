"use client";

/**
 * "Confirm your email" banner. Shown when the login/register pages are
 * loaded with ?verified=invalid (bad/expired token), when registration just
 * completed, or from the dashboard if the account is unverified.
 *
 * The backend sends the verification email on signup; this banner is the UI
 * prompt with a "Resend" action (POST /auth/resend-verification/ always
 * returns 200 with a generic message, so it can't probe registered emails).
 */

import { useState } from "react";
import { useResendVerificationMutation } from "@/lib/api/authApi";

export default function VerifyEmailBanner({
  email,
  variant = "info",
}: {
  email: string;
  variant?: "info" | "warning";
}) {
  const [resend, { isLoading }] = useResendVerificationMutation();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm font-open-sans text-green-700 dark:text-green-300">
        If that email needs verification, a new link is on its way. Check your
        inbox (and spam folder).
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-open-sans flex flex-wrap items-center gap-2 ${
        variant === "warning"
          ? "bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          : "bg-primary/5 border border-primary/20 text-text-primary"
      }`}
    >
      <span className="flex-1 min-w-48">
        Please confirm your email address to secure your account. We sent a
        link to <span className="font-semibold">{email}</span>.
      </span>
      <button
        type="button"
        disabled={isLoading || !email}
        onClick={async () => {
          try {
            await resend({ email }).unwrap();
            setSent(true);
          } catch {
            setSent(true); // generic success either way
          }
        }}
        className="text-primary font-semibold hover:underline disabled:opacity-60 shrink-0"
      >
        {isLoading ? "Sending…" : "Resend link"}
      </button>
    </div>
  );
}
