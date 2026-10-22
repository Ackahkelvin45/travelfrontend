"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { RoomHold } from "@/lib/api/bookingsApi";
import logo from "../../assets/logo/logo.png";
import logoDark from "../../assets/logo/logodark.png";

const STEPS = ["Trip", "Details", "Payment", "Confirmed"];

/** Remaining hold time from the server clock (offset captured per hold). */
function useHoldClock(hold: RoomHold | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!hold) return;
    const offset = new Date(hold.server_now).getTime() - Date.now();
    const end = new Date(hold.held_until).getTime();
    const tick = () => setLeft(Math.max(0, Math.floor((end - (Date.now() + offset)) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [hold]);
  return left;
}

export default function CheckoutHeader({ step, hold, backHref }: { step: 2 | 3; hold: RoomHold | null; backHref: string }) {
  const left = useHoldClock(hold);
  const clock = left === null ? "" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;

  return (
    <header className="sticky top-0 z-30 h-[76px] bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 px-4 md:px-10 flex items-center justify-between gap-4">
      <Link href={backHref} aria-label="Back to your trip" className="shrink-0">
        <Image src={logo} alt="Azura Travels" className="h-12 w-[72px] md:h-14 md:w-[100px] object-contain dark:hidden" priority />
        <Image src={logoDark} alt="Azura Travels" className="h-12 w-[72px] md:h-14 md:w-[100px] object-contain hidden dark:block" priority />
      </Link>
      <ol aria-label="Checkout progress" className="flex items-center gap-1.5 sm:gap-2.5 font-montserrat text-[13px] font-semibold">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step, current = n === step;
          return (
            <li key={label} className="flex items-center gap-2.5">
              {i > 0 && <span aria-hidden className={`hidden sm:block w-9 h-0.5 ${n <= step ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />}
              <span aria-current={current ? "step" : undefined} className={`flex items-center gap-2 ${done ? "text-green-700 dark:text-green-400" : current ? "text-text-primary" : "text-gray-500"}`}>
                <span className={`w-[26px] h-[26px] rounded-full flex items-center justify-center ${
                  done ? "bg-green-100 dark:bg-green-900/40" : current ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800"
                }`}>{done ? "✓" : n}</span>
                <span className="hidden lg:inline">{label}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {hold && left !== null ? (
        <div role="timer" aria-label="Room hold time remaining" className={`shrink-0 flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold border ${
          left > 0 ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200"
        }`}>
          <span aria-hidden className="w-2 h-2 rounded-full bg-amber-600 motion-safe:animate-pulse" />
          {left > 0 ? <><span className="hidden sm:inline">Room held </span><span className="tabular-nums">{clock}</span></> : "Hold expired"}
        </div>
      ) : <span className="w-[100px]" aria-hidden />}
    </header>
  );
}
