"use client";

/**
 * The commercial half of an option-based package page, shown BEFORE the
 * customer enters checkout. Rooms & Pricing stays fully visible — it drives
 * the booking decision; the supporting terms (payment schedule, visa,
 * refunds, policies) sit in accordions so the page stays scannable.
 *
 * Every number rendered here comes from the pricing matrix; every policy
 * body from the published policy documents — nothing is hardcoded.
 */

import { useState } from "react";
import {
  useGetCurrentPoliciesQuery,
  useGetPackagePricingQuery,
  type PolicyDoc,
} from "@/lib/api/packagesApi";
import { fmtMoney, fmtDate } from "@/lib/format";
import Countdown from "@/components/booking/Countdown";
import { AccordionItem } from "@/components/ui/Accordion";
import {
  CreditCardIcon,
  FileTextIcon,
  PlaneIcon,
  ShieldIcon,
  StarIcon,
  XIcon,
} from "@/components/ui/icons";

export default function CommercialSections({
  packageId,
  refundTiers,
}: {
  packageId: string;
  refundTiers: { min_days: number; percent: number }[];
}) {
  const { data: matrix } = useGetPackagePricingQuery(packageId);
  const { data: policies = [] } = useGetCurrentPoliciesQuery();
  const [openPolicy, setOpenPolicy] = useState<PolicyDoc | null>(null);

  if (!matrix) return null;
  const currency = matrix.currency;

  return (
    <>
      {/* ── Rooms & Pricing — always visible ── */}
      <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold font-raleway text-text-primary mb-1.5">Rooms &amp; pricing</h2>
        {matrix.early_bird.active && matrix.early_bird.deadline && (
          <p className="text-sm font-open-sans text-gray-600 dark:text-gray-300 mb-4">
            Early Bird rates end in{" "}
            <Countdown
              deadline={matrix.early_bird.deadline}
              serverNow={matrix.server_now}
              className="font-bold text-primary"
            />{" "}
            <span className="text-gray-400">({fmtDate(matrix.early_bird.deadline)})</span>
          </p>
        )}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 mt-2">
          <table className="w-full text-sm font-open-sans">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Hotel</th>
                <th className="px-4 py-3 font-semibold">Occupancy</th>
                <th className="px-4 py-3 font-semibold text-right">Standard</th>
                {matrix.early_bird.active && <th className="px-4 py-3 font-semibold text-right">Early Bird</th>}
                {matrix.early_bird.active && <th className="px-4 py-3 font-semibold text-right">You save</th>}
              </tr>
            </thead>
            <tbody>
              {matrix.options.map((option) => (
                <tr key={option.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-text-primary whitespace-nowrap">
                    {option.hotel_name}
                    <span className="inline-flex items-center gap-px ml-1.5 align-[-2px] text-primary">
                      {Array.from({ length: option.star_rating }, (_, i) => (
                        <StarIcon key={i} size={11} />
                      ))}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">{option.occupancy_display}</td>
                  <td className="px-4 py-3.5 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    <span className={option.early_bird_applied ? "line-through text-gray-400" : "font-semibold text-text-primary"}>
                      {fmtMoney(option.standard_price_per_person, currency)}
                    </span>
                    <span className="text-xs text-gray-400"> /person</span>
                  </td>
                  {matrix.early_bird.active && (
                    <td className="px-4 py-3.5 text-right font-bold text-text-primary whitespace-nowrap">
                      {option.early_bird_price_per_person
                        ? fmtMoney(option.early_bird_price_per_person, currency)
                        : "—"}
                    </td>
                  )}
                  {matrix.early_bird.active && (
                    <td className="px-4 py-3.5 text-right text-green-700 dark:text-green-400 font-semibold whitespace-nowrap">
                      {parseFloat(option.saving_total) > 0 ? fmtMoney(option.saving_total, currency) : "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-2.5">
          Double occupancy is priced per person sharing (2 guests per booking).
        </p>
      </section>

      {/* ── Good to know — supporting terms in accordions ── */}
      <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Good to know</h2>
        <div className="flex flex-col gap-2.5">
          {matrix.installments.enabled && (
            <AccordionItem
              title="Payment options"
              subtitle={
                matrix.installments.deposit_minimum
                  ? `Pay in full, or secure your spot with a ${fmtMoney(matrix.installments.deposit_minimum, currency)} deposit`
                  : "Pay in full or in installments"
              }
              icon={<CreditCardIcon size={17} />}
              defaultOpen
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm font-bold text-text-primary mb-1">Pay in full</p>
                  <p className="text-sm leading-relaxed">
                    One payment at checkout and you&apos;re done — your booking is confirmed immediately.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-sm font-bold text-text-primary mb-1">
                    {matrix.installments.deposit_minimum
                      ? `${fmtMoney(matrix.installments.deposit_minimum, currency)} deposit`
                      : "Deposit"}
                  </p>
                  <ul className="list-disc pl-4 flex flex-col gap-1 text-sm leading-relaxed">
                    <li>
                      Booking <span className="font-semibold">confirmed once the deposit is received</span>.
                    </li>
                    <li>Top up any amount, any time, from your dashboard.</li>
                    {matrix.installments.final_payment_deadline && (
                      <li>
                        Full balance due by{" "}
                        <span className="font-semibold text-text-primary">
                          {fmtDate(matrix.installments.final_payment_deadline)}
                        </span>
                        .
                      </li>
                    )}
                    <li>
                      Unpaid balances after the deadline may lead to cancellation and deposit forfeiture
                      under the cancellation policy.
                    </li>
                  </ul>
                </div>
              </div>
            </AccordionItem>
          )}

          {matrix.visa.enabled && (
            <AccordionItem
              title="Visa service"
              subtitle={
                matrix.visa.fee_per_guest
                  ? `Visa on Arrival — ${fmtMoney(matrix.visa.fee_per_guest, currency)} per guest`
                  : "Visa on Arrival available"
              }
              icon={<PlaneIcon size={17} />}
            >
              {matrix.visa.info && (
                <p className="whitespace-pre-line mb-2">{matrix.visa.info}</p>
              )}
              <p className="text-xs text-amber-700 dark:text-amber-500 font-semibold">
                Visa fees are third-party costs and are non-refundable once processing has begun.
              </p>
            </AccordionItem>
          )}

          {refundTiers.length > 0 && (
            <AccordionItem
              title="Cancellation & refunds"
              subtitle={cancellationSubtitle(refundTiers)}
              icon={<ShieldIcon size={17} />}
            >
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm font-open-sans">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <th className="px-4 py-2.5 font-semibold">Cancelling</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Refund of amount paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...refundTiers]
                      .sort((a, b) => b.min_days - a.min_days)
                      .map((tier, index, sorted) => {
                        const upper = index === 0 ? null : sorted[index - 1].min_days - 1;
                        const label =
                          upper === null
                            ? `${tier.min_days}+ days before departure`
                            : tier.min_days === 0
                              ? `Less than ${sorted[index - 1].min_days} days before departure`
                              : `${tier.min_days}–${upper} days before departure`;
                        return (
                          <tr key={tier.min_days} className="border-t border-gray-100 dark:border-gray-800">
                            <td className="px-4 py-2.5">{label}</td>
                            <td className={`px-4 py-2.5 text-right font-bold ${tier.percent > 0 ? "text-text-primary" : "text-red-600"}`}>
                              {tier.percent > 0 ? `${tier.percent}%` : "No refund"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
                Refunds are calculated on the amount actually paid, excluding non-refundable third-party
                costs (visa fees, government charges, flights booked on your behalf). No refunds once the
                tour has commenced, or for missed activities, unused services or voluntary early departure.
                We strongly recommend comprehensive travel insurance.
              </p>
            </AccordionItem>
          )}

          {policies.length > 0 && (
            <AccordionItem
              title="Terms & policies"
              subtitle="The exact versions you accept at checkout"
              icon={<FileTextIcon size={17} />}
            >
              <div className="flex flex-wrap gap-2.5">
                {policies.map((doc) => (
                  <button
                    key={doc.type}
                    onClick={() => setOpenPolicy(doc)}
                    className="border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm font-semibold font-open-sans text-text-primary hover:border-primary hover:text-primary transition-colors"
                  >
                    {doc.title} <span className="text-xs text-gray-400">v{doc.version}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                You&apos;ll be asked to accept these policies at checkout; your acceptance of the exact
                versions shown here is recorded with your booking.
              </p>
            </AccordionItem>
          )}
        </div>
      </section>

      {openPolicy && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpenPolicy(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold font-raleway text-text-primary">
                {openPolicy.title}{" "}
                <span className="text-xs text-gray-400 font-open-sans">v{openPolicy.version}</span>
              </h3>
              <button
                onClick={() => setOpenPolicy(null)}
                aria-label="Close"
                className="text-gray-400 hover:text-text-primary p-1 -m-1"
              >
                <XIcon size={16} />
              </button>
            </div>
            <div className="text-sm font-open-sans text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {openPolicy.body}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** "90% refund up to 60 days before departure" from the most generous tier. */
function cancellationSubtitle(tiers: { min_days: number; percent: number }[]): string {
  const best = [...tiers].sort((a, b) => b.percent - a.percent)[0];
  if (!best || best.percent <= 0) return "See the refund schedule";
  return `Up to ${best.percent}% refund when cancelling ${best.min_days}+ days before departure`;
}
