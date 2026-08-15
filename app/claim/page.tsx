"use client";

/** Landing page for the claim link in confirmation emails: attaches a guest
 * booking to the signed-in account. Possession of the emailed token is the
 * proof of ownership. */

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { useClaimBookingMutation } from "@/lib/api/bookingsApi";
import Spinner from "@/components/ui/Spinner";

function ClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const { token: authToken, hydrated } = useSelector((state: RootState) => state.auth);
  const [claim] = useClaimBookingMutation();
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("");
  const attempted = useRef(false);

  useEffect(() => {
    if (!hydrated || !token || attempted.current) return;
    if (!authToken) {
      router.replace(`/login?next=${encodeURIComponent(`/claim?token=${token}`)}`);
      return;
    }
    attempted.current = true;
    claim({ token })
      .unwrap()
      .then((result) => {
        setState("done");
        setMessage(`Booking ${result.reference} is now linked to your account.`);
      })
      .catch((err) => {
        setState("error");
        setMessage(err?.data?.detail ?? "This claim link is invalid or has expired.");
      });
  }, [hydrated, authToken, token, claim, router]);

  if (!token) {
    return <p className="text-sm text-gray-500 font-open-sans">Missing claim token.</p>;
  }

  if (state === "working") {
    return (
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300">Linking your booking…</p>
      </div>
    );
  }

  return (
    <div className="text-center flex flex-col items-center gap-4">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${state === "done" ? "bg-green-100" : "bg-red-100"}`}>
        {state === "done" ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        )}
      </div>
      <p className="text-text-primary font-bold font-raleway text-lg">{message}</p>
      <Link href="/dashboard" className="bg-primary text-white px-6 py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors">
        Go to my bookings
      </Link>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <main className="w-full px-4 mt-24 py-16 flex items-center justify-center min-h-[50vh]">
      <Suspense fallback={<Spinner />}>
        <ClaimContent />
      </Suspense>
    </main>
  );
}
