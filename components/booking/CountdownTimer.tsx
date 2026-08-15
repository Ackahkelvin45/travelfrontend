"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  /** ISO deadline from the backend. */
  deadline: string;
  /** ISO server_now from the same response — corrects browser clock drift. */
  serverNow: string;
  /** Heading above the digits, e.g. "Early Bird pricing ends in". */
  label: string;
  /** Shown once the deadline passes. */
  expiredLabel?: string;
  onExpire?: () => void;
  className?: string;
}

/**
 * Prominent segmented countdown (days / hours / minutes / seconds), driven by
 * the SERVER clock like components/booking/Countdown.tsx: the offset is
 * captured once, remaining time recomputed from absolute timestamps every
 * second — immune to laptop sleep and clock drift. Never shows negatives.
 */
export default function CountdownTimer({
  deadline,
  serverNow,
  label,
  expiredLabel = "This offer has ended",
  onExpire,
  className = "",
}: CountdownTimerProps) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const offset = new Date(serverNow).getTime() - Date.now();
    const deadlineMs = new Date(deadline).getTime();

    let expired = false;
    const tick = () => {
      const remaining = deadlineMs - (Date.now() + offset);
      setRemainingMs(remaining);
      if (remaining <= 0 && !expired) {
        expired = true;
        onExpire?.();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline, serverNow, onExpire]);

  // Avoid a layout jump before the first tick.
  if (remainingMs === null) return <div className={className} style={{ minHeight: 74 }} />;

  if (remainingMs <= 0) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 ${className}`}>
        <p className="text-sm font-semibold font-open-sans text-gray-600 dark:text-gray-300 text-center">
          {expiredLabel}
        </p>
      </div>
    );
  }

  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const segments = [
    { value: Math.floor(totalSeconds / 86400), unit: "Days" },
    { value: Math.floor((totalSeconds % 86400) / 3600), unit: "Hrs" },
    { value: Math.floor((totalSeconds % 3600) / 60), unit: "Min" },
    { value: totalSeconds % 60, unit: "Sec" },
  ];

  return (
    <div className={`content-in rounded-xl border border-primary/25 bg-primary/[.06] dark:bg-primary/10 px-4 pt-3 pb-3.5 ${className}`}>
      <p className="text-[11px] font-semibold font-open-sans uppercase tracking-wider text-primary text-center mb-2">
        {label}
      </p>
      <div className="flex items-start justify-center gap-1.5" role="timer" aria-live="off">
        {segments.map((seg, i) => (
          <div key={seg.unit} className="flex items-start gap-1.5">
            {i > 0 && (
              <span className="text-lg font-bold font-raleway text-primary/40 leading-9 select-none">:</span>
            )}
            <div className="flex flex-col items-center">
              <span className="w-11 h-9 rounded-lg bg-white dark:bg-gray-900 border border-primary/20 flex items-center justify-center text-lg font-bold font-raleway text-text-primary tabular-nums">
                {String(seg.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-open-sans mt-1 uppercase tracking-wide">
                {seg.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
