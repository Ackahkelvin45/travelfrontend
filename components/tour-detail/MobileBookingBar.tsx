"use client";

import { useRouter } from "next/navigation";
import Countdown from "@/components/booking/Countdown";

interface MobileBookingBarProps {
  /** Formatted from-price, e.g. "USD 1,500.00". */
  priceLabel: string | null;
  bookHref: string;
  /** Optional early-bird deadline for a compact urgency line. */
  deadline?: string | null;
  serverNow?: string | null;
}

/**
 * Fixed bottom booking bar — mobile/tablet only. The desktop booking card
 * sits at the end of the DOM on small screens, so this keeps price + CTA
 * one thumb-tap away at any scroll position.
 */
export default function MobileBookingBar({ priceLabel, bookHref, deadline, serverNow }: MobileBookingBarProps) {
  const router = useRouter();

  return (
    <div className="page-enter lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
        <div className="min-w-0">
          <p className="text-[15px] font-bold font-raleway text-text-primary leading-tight">
            {priceLabel ? (
              <>
                <span className="text-xs font-normal font-open-sans text-gray-500 dark:text-gray-400 mr-1">From</span>
                {priceLabel}
                <span className="text-xs font-normal font-open-sans text-gray-500 dark:text-gray-400"> /person</span>
              </>
            ) : (
              "Check availability"
            )}
          </p>
          {deadline && serverNow && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-open-sans mt-0.5 truncate">
              Early Bird ends in{" "}
              <Countdown deadline={deadline} serverNow={serverNow} className="font-bold text-primary" />
            </p>
          )}
        </div>
        <button
          onClick={() => router.push(bookHref)}
          className="shrink-0 bg-primary text-white px-7 py-3 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 active:scale-[.98] transition-all"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
