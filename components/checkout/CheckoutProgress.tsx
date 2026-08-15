"use client";

import { CheckIcon } from "@/components/ui/icons";

export const CHECKOUT_STEPS = ["Build your trip", "Your details", "Review & pay", "Confirmation"] as const;

/**
 * Compact 4-step checkout indicator. `current` is 1-based; steps before it
 * render as completed (check), the active one is highlighted, later steps are
 * muted. Completed steps are clickable when onStepClick is provided.
 */
export default function CheckoutProgress({
  current,
  onStepClick,
}: {
  current: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const clickable = done && !!onStepClick && n < 4;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3 min-w-0">
            {i > 0 && (
              <span
                aria-hidden
                className={`w-5 sm:w-8 h-px shrink-0 ${done || active ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(n)}
              aria-current={active ? "step" : undefined}
              className={`flex items-center gap-1.5 min-w-0 ${clickable ? "cursor-pointer" : "cursor-default"}`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-raleway shrink-0 transition-colors ${
                  done
                    ? "bg-primary text-white"
                    : active
                      ? "bg-primary text-white ring-4 ring-primary/15"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                {done ? <CheckIcon size={11} /> : n}
              </span>
              <span
                className={`text-xs sm:text-[13px] font-semibold font-open-sans truncate ${
                  active ? "text-text-primary" : done ? "text-gray-600 dark:text-gray-300" : "text-gray-400"
                } ${active ? "" : "hidden md:inline"}`}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
