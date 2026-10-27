"use client";

/** Optional Academy donation at checkout (client, 24 Oct 2026): unselected by
 * default, 5%, 10% or 20% of the trip total, added to the first payment as its
 * own line. Amounts come from the server quote; the gift settles to the
 * Academy's own account. */

import type { DonationOption } from "@/lib/api/bookingsApi";
import { fmtMoney } from "@/lib/format";

const pill = (on: boolean) =>
  `rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
    on ? "border-primary bg-primary/10 text-[#6B4E1A] dark:text-primary" : "border-gray-200 dark:border-gray-700 text-text-primary"
  }`;

export default function DonationPicker({ options, currency, value, onChange, disabled = false }: {
  options: DonationOption[]; currency: string; value: number | null; onChange: (percent: number | null) => void; disabled?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-3">
      <div>
        <h2 className="font-raleway font-bold text-[17px] text-text-primary">Support the Michael Blackson Academy <span className="font-normal text-sm text-gray-500 dark:text-gray-400">· optional</span></h2>
        <p className="mt-1 text-[13px] text-gray-700 dark:text-gray-300">
          Add a donation of your trip cost to this payment. It goes to the Academy&apos;s own account and gets its own receipt.
        </p>
      </div>
      <div role="radiogroup" aria-label="Academy donation" className="flex flex-wrap gap-2">
        <button type="button" role="radio" aria-checked={value === null} disabled={disabled} onClick={() => onChange(null)} className={pill(value === null)}>No, thanks</button>
        {options.map((o) => (
          <button key={o.percent} type="button" role="radio" aria-checked={value === o.percent} disabled={disabled}
            onClick={() => onChange(o.percent)} className={pill(value === o.percent)}>
            {o.percent}% · {fmtMoney(o.amount, currency)}
          </button>
        ))}
      </div>
    </section>
  );
}
