"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import { PENDING_BOOKING_EVENT, PENDING_BOOKING_KEY, type PendingBooking } from "@/lib/pendingBooking";
import { fmtMoney } from "@/lib/format";

const HIDDEN_ON = ["/book", "/booking", "/payment", "/login", "/register"];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PENDING_BOOKING_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PENDING_BOOKING_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(PENDING_BOOKING_KEY);
}

/** "You have an unfinished booking" — the recovery surface for closed Paystack
 * tabs and abandoned checkouts. */
export default function PendingBookingBanner() {
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const pending = useMemo<PendingBooking | null>(() => {
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as PendingBooking;
      return new Date(data.expiresAt).getTime() > new Date().getTime() ? data : null;
    } catch {
      return null;
    }
  }, [raw]);

  if (!pending) return null;
  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-4 pb-4">
      <div className="max-w-3xl mx-auto bg-gray-900 dark:bg-gray-800 text-white border border-gray-700 rounded-2xl shadow-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm font-open-sans flex-1">
          You have an unfinished booking for{" "}
          <span className="font-bold">{pending.packageTitle}</span> —{" "}
          {fmtMoney(pending.amountDueToday, pending.currency)} due to secure it.
        </p>
        <Link
          href={`/booking/${pending.reference}/pay`}
          className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold font-open-sans text-center hover:bg-primary/90 transition-colors shrink-0"
        >
          Resume payment
        </Link>
      </div>
    </div>
  );
}
