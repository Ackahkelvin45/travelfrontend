"use client";

import { useState } from "react";
import type { PackageDetail, PricingMatrix } from "@/lib/api/packagesApi";
import type { PaymentPlan } from "@/lib/api/bookingsApi";
import { fmtMoney, fmtDate, fmtDateRange } from "@/lib/format";
import {
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  ImageIcon,
  LockIcon,
  UsersIcon,
  StarIcon,
} from "@/components/ui/icons";

type MatrixOption = PricingMatrix["options"][number];

/** All money on this card is a server number (or the display-only sum of two
 * server numbers, which the backend re-validates at checkout). */
export function summarize(matrix: PricingMatrix, option: MatrixOption | null, visa: boolean, plan: PaymentPlan) {
  const visaFee = matrix.visa.fee_per_guest;
  const visaTotal = visa && visaFee && option ? parseFloat(visaFee) * option.guests_per_booking : 0;
  const baseTotal = option ? parseFloat(option.effective_total) : 0;
  const saving = option ? parseFloat(option.saving_total) : 0;
  const total = baseTotal + visaTotal;
  const depositMin = matrix.installments.deposit_minimum ? parseFloat(matrix.installments.deposit_minimum) : null;
  const dueToday = plan === "installment" && depositMin ? Math.min(depositMin, total) : total;
  return { visaTotal, baseTotal, saving, total, dueToday };
}

function SummaryBody({
  pkg, matrix, option, visa, plan,
}: {
  pkg: PackageDetail | undefined;
  matrix: PricingMatrix;
  option: MatrixOption | null;
  visa: boolean;
  plan: PaymentPlan;
}) {
  const currency = matrix.currency;
  const { visaTotal, saving, total, dueToday } = summarize(matrix, option, visa, plan);
  const cover = pkg?.images?.find((img) => img.is_cover) ?? pkg?.images?.[0];

  return (
    <div>
      {/* Tour identity */}
      <div className="flex gap-3.5 items-start">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.image}
            alt={pkg?.title ?? "Tour"}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
          />
        ) : (
          <span className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ImageIcon size={20} />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold font-raleway text-text-primary leading-snug">
            {pkg?.title ?? "Your tour"}
          </p>
          {matrix.tour_start && matrix.tour_end && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-1">
              <CalendarIcon size={12} />
              {fmtDateRange(matrix.tour_start, matrix.tour_end)}
            </p>
          )}
          {pkg?.duration_days && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-0.5">
              <ClockIcon size={12} />
              {pkg.duration_days} days
            </p>
          )}
        </div>
      </div>

      {option ? (
        <>
          {/* Selection */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-1.5 text-sm font-open-sans">
            <p className="font-semibold text-text-primary flex items-center gap-1.5">
              {option.hotel_name}
              <span className="inline-flex items-center gap-px text-primary">
                {Array.from({ length: option.star_rating }, (_, i) => (
                  <StarIcon key={i} size={10} />
                ))}
              </span>
            </p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <UsersIcon size={12} />
              {option.occupancy_display} · {option.guests_per_booking} guest{option.guests_per_booking > 1 ? "s" : ""}
            </p>
          </div>

          {/* Price breakdown */}
          <dl className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 text-sm font-open-sans">
            <div className="flex justify-between gap-3">
              <dt className="text-gray-600 dark:text-gray-300">Room ({option.guests_per_booking} guest{option.guests_per_booking > 1 ? "s" : ""})</dt>
              <dd className="font-semibold text-text-primary">{fmtMoney(option.standard_total, currency)}</dd>
            </div>
            {option.early_bird_applied && saving > 0 && (
              <div className="flex justify-between gap-3 text-green-700 dark:text-green-400">
                <dt>Early Bird discount</dt>
                <dd className="font-semibold">−{fmtMoney(option.saving_total, currency)}</dd>
              </div>
            )}
            {visa && visaTotal > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600 dark:text-gray-300">Visa on Arrival × {option.guests_per_booking}</dt>
                <dd className="font-semibold text-text-primary">{fmtMoney(visaTotal, currency)}</dd>
              </div>
            )}
            <div className="flex justify-between items-baseline gap-3 border-t border-gray-200 dark:border-gray-700 pt-2.5 mt-0.5">
              <dt className="text-base font-bold font-raleway text-text-primary">Total</dt>
              <dd className="text-xl font-bold font-raleway text-text-primary">{fmtMoney(total, currency)}</dd>
            </div>
          </dl>

          {/* Due today */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 mt-3 flex flex-col gap-1.5 text-sm font-open-sans">
            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Due today</span>
              <span className="font-bold text-primary">{fmtMoney(dueToday, currency)}</span>
            </div>
            {matrix.charge.exchange_rate && matrix.charge.currency !== currency && (
              <div className="flex justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>Charged as (today&apos;s rate)</span>
                <span className="font-semibold">
                  {fmtMoney(dueToday * parseFloat(matrix.charge.exchange_rate), matrix.charge.currency)}
                </span>
              </div>
            )}
            {plan === "installment" && dueToday < total && (
              <>
                <div className="flex justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Balance after deposit</span>
                  <span>{fmtMoney(total - dueToday, currency)}</span>
                </div>
                {matrix.installments.final_payment_deadline && (
                  <div className="flex justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Pay balance by</span>
                    <span className="font-semibold">{fmtDate(matrix.installments.final_payment_deadline)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 font-open-sans">
          Select a hotel and room to see your price.
        </p>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-open-sans mt-4">
        <LockIcon size={11} />
        Secure checkout — payments processed by Paystack
      </p>
    </div>
  );
}

/** Desktop: persistent card. `cta` renders below the body (page supplies it). */
export function CheckoutSummaryCard(props: {
  pkg: PackageDetail | undefined;
  matrix: PricingMatrix;
  option: MatrixOption | null;
  visa: boolean;
  plan: PaymentPlan;
  cta?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
      <p className="text-xs font-bold font-open-sans uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
        Your booking
      </p>
      <SummaryBody {...props} />
      {props.cta && <div className="mt-5">{props.cta}</div>}
    </div>
  );
}

/** Mobile: collapsed bar showing the total; expands to the full summary. */
export function CheckoutSummaryCollapsible(props: {
  pkg: PackageDetail | undefined;
  matrix: PricingMatrix;
  option: MatrixOption | null;
  visa: boolean;
  plan: PaymentPlan;
}) {
  const [open, setOpen] = useState(false);
  const { dueToday } = summarize(props.matrix, props.option, props.visa, props.plan);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5"
      >
        <span className="text-sm font-bold font-raleway text-text-primary">Your booking</span>
        <span className="flex items-center gap-2">
          {props.option && (
            <span className="text-sm font-bold font-open-sans text-primary">
              {fmtMoney(dueToday, props.matrix.currency)} due today
            </span>
          )}
          <ChevronDownIcon
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div className={`acc-body ${open ? "acc-open" : ""}`} aria-hidden={!open}>
        <div>
          <div className="px-4 pb-4">
            <SummaryBody {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}
