"use client";

import { useRouter } from "next/navigation";
import { useGetPackagePricingQuery } from "@/lib/api/packagesApi";
import CountdownTimer from "@/components/booking/CountdownTimer";
import Spinner from "@/components/ui/Spinner";
import { fmtMoney, fmtDate } from "@/lib/format";
import { BedIcon, CalendarIcon, ShieldIcon, StarIcon } from "@/components/ui/icons";

/**
 * Booking card for option-based (flagship) packages. Answers, top to bottom:
 * how much → how urgent → when → which rooms → how to pay → book.
 */
export default function OptionBookingPanel({ packageId }: { packageId: string }) {
  const router = useRouter();
  const { data: matrix, isLoading, refetch } = useGetPackagePricingQuery(packageId);

  if (isLoading || !matrix) {
    return (
      <div className="bg-white dark:bg-gray-900 w-full rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6 flex justify-center min-h-[200px] items-center">
        <Spinner />
      </div>
    );
  }

  const cheapest = matrix.options.reduce<typeof matrix.options[number] | null>(
    (min, option) =>
      !min || parseFloat(option.effective_price_per_person) < parseFloat(min.effective_price_per_person)
        ? option
        : min,
    null,
  );

  return (
    <div className="bg-white dark:bg-gray-900 w-full rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-5 sm:p-6">
      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 font-open-sans">From</span>
        <span className="text-[28px] font-bold font-raleway text-text-primary leading-none">
          {cheapest ? fmtMoney(cheapest.effective_price_per_person, matrix.currency) : "—"}
        </span>
        <span className="text-xs text-gray-500 font-open-sans">/person</span>
      </div>
      {cheapest?.early_bird_applied && (
        <p className="text-xs font-open-sans mt-1.5">
          <span className="line-through text-gray-400">
            {fmtMoney(cheapest.standard_price_per_person, matrix.currency)}
          </span>{" "}
          <span className="text-green-700 dark:text-green-400 font-semibold">
            Early Bird — save {fmtMoney(cheapest.saving_total, matrix.currency)}
          </span>
        </p>
      )}

      {/* Urgency — real countdown to the early-bird deadline */}
      {matrix.early_bird.active && matrix.early_bird.deadline && (
        <CountdownTimer
          deadline={matrix.early_bird.deadline}
          serverNow={matrix.server_now}
          label="Early Bird pricing ends in"
          expiredLabel="Early Bird pricing has ended"
          onExpire={() => refetch()}
          className="mt-4"
        />
      )}

      {/* Dates */}
      {matrix.tour_start && matrix.tour_end && (
        <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mt-4">
          <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CalendarIcon size={16} />
          </span>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">Tour dates</p>
            <p className="text-sm font-semibold font-open-sans text-text-primary">
              {fmtDate(matrix.tour_start)} – {fmtDate(matrix.tour_end)}
            </p>
          </div>
        </div>
      )}

      {/* Room options */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold font-open-sans uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
          <BedIcon size={13} />
          Room options
        </p>
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {matrix.options.slice(0, 4).map((option) => (
            <div key={option.id} className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-open-sans">
              <span className="text-gray-700 dark:text-gray-300 min-w-0">
                <span className="font-semibold text-text-primary">{option.hotel_name}</span>
                <span className="inline-flex items-center gap-px ml-1 align-[-2px] text-primary">
                  {Array.from({ length: option.star_rating }, (_, i) => (
                    <StarIcon key={i} size={9} />
                  ))}
                </span>
                <span className="block text-gray-500 dark:text-gray-400 mt-0.5">{option.occupancy_display}</span>
              </span>
              <span className="font-bold text-text-primary shrink-0">
                {fmtMoney(option.effective_price_per_person, matrix.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit note */}
      {matrix.installments.enabled && matrix.installments.deposit_minimum && (
        <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-4 leading-relaxed">
          Secure your spot from a{" "}
          <span className="font-bold text-text-primary">
            {fmtMoney(matrix.installments.deposit_minimum, matrix.currency)}
          </span>{" "}
          deposit — pay the rest in installments
          {matrix.installments.final_payment_deadline &&
            ` by ${fmtDate(matrix.installments.final_payment_deadline)}`}
          .
        </p>
      )}

      {/* CTA */}
      <button
        onClick={() => router.push(`/book?package=${packageId}`)}
        className="w-full bg-primary text-white py-3.5 rounded-full font-bold font-open-sans text-[15px] hover:bg-primary/90 active:scale-[.99] transition-all mt-5 shadow-sm"
      >
        Book Now
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-open-sans mt-3">
        <ShieldIcon size={12} />
        Secure checkout · Flexible cancellation terms
      </p>
    </div>
  );
}
