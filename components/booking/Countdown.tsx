"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  /** ISO deadline from the backend. */
  deadline: string;
  /** ISO server_now from the same response — corrects browser clock drift. */
  serverNow: string;
  /** Called once when the countdown crosses zero. */
  onExpire?: () => void;
  className?: string;
}

/**
 * Deadline countdown driven by the SERVER clock: offset = server_now - local
 * now is captured once per fetch, and remaining time is recomputed from
 * absolute timestamps every tick — immune to laptop sleep and clock drift.
 */
export default function Countdown({ deadline, serverNow, onExpire, className = "" }: CountdownProps) {
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

  if (remainingMs === null) return null;
  if (remainingMs <= 0) {
    return <span className={className}>Offer ended</span>;
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts =
    days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return <span className={className}>{parts}</span>;
}
