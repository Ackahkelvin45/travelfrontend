"use client";

/** Optional Academy donation at checkout (Change Request v4 §7): unselected by
 * default, 2% to 15% of the booking or a custom USD amount, shown apart from
 * the booking total and charged separately to the Academy's own account. */

import { useState } from "react";
import type { DonationChoice } from "@/lib/donation";
import { fmtMoney } from "@/lib/format";

const pill = (on: boolean) =>
  `rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
    on ? "border-primary bg-primary/10 text-[#6B4E1A] dark:text-primary" : "border-gray-200 dark:border-gray-700 text-text-primary"
  }`;

export default function DonationPicker({ total, currency, value, onChange, disabled = false }: {
  total: string; currency: string; value: DonationChoice; onChange: (v: DonationChoice) => void; disabled?: boolean;
}) {
  const [custom, setCustom] = useState(value && "amount" in value ? value.amount : "");
  const pct = (p: number) => (parseFloat(total) * p / 100).toFixed(2); // preview; the server prices the gift
  const percent = value && "percent" in value ? value.percent : null;

  return (
    <section className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-3">
      <div>
        <h2 className="font-raleway font-bold text-[17px] text-text-primary">Support the Michael Blackson Academy <span className="font-normal text-sm text-gray-500 dark:text-gray-400">· optional</span></h2>
        <p className="mt-1 text-[13px] text-gray-700 dark:text-gray-300">
          A voluntary gift on top of your booking. It goes to the Academy&apos;s own account as a separate payment, after your booking is paid.
        </p>
      </div>
      <div role="radiogroup" aria-label="Academy donation" className="flex flex-wrap gap-2">
        <button type="button" role="radio" aria-checked={!value} disabled={disabled} onClick={() => onChange(null)} className={pill(!value)}>No, thanks</button>
        <button type="button" role="radio" aria-checked={percent !== null} disabled={disabled}
          onClick={() => onChange({ percent: percent ?? 2 })} className={pill(percent !== null)}>A percentage</button>
        <button type="button" role="radio" aria-checked={!!value && "amount" in value} disabled={disabled}
          onClick={() => onChange({ amount: custom || "25" })} className={pill(!!value && "amount" in value)}>Other amount</button>
      </div>
      {percent !== null && (
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex flex-col gap-1.5 max-w-sm">
          <span>{percent}% of your booking · <span className="font-montserrat text-sm text-text-primary">{fmtMoney(pct(percent), currency)}</span></span>
          <input
            type="range" min={2} max={15} step={1} value={percent} disabled={disabled}
            onChange={(e) => onChange({ percent: Number(e.target.value) })} className="accent-primary"
          />
          <span className="flex justify-between font-normal text-gray-500 dark:text-gray-400"><span>2%</span><span>15%</span></span>
        </label>
      )}
      {value && "amount" in value && (
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex flex-col gap-1 max-w-[200px]">
          Amount in USD
          <input
            type="number" inputMode="decimal" min={1} step="1" value={custom} disabled={disabled}
            onChange={(e) => { setCustom(e.target.value); onChange({ amount: e.target.value }); }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
      )}
    </section>
  );
}
