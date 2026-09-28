/**
 * The cancellation/refund schedule, rendered from a package's refund_tiers.
 * Shared by the tour page, the option checkout and the core+add-ons checkout
 * so the customer sees the same table before they pay.
 */

export interface RefundTier {
  min_days: number;
  percent: number;
}

/** "Up to 90% refund when cancelling 60+ days before departure" from the most generous tier. */
export function cancellationSubtitle(tiers: RefundTier[]): string {
  const best = [...tiers].sort((a, b) => b.percent - a.percent)[0];
  if (!best || best.percent <= 0) return "See the refund schedule";
  return `Up to ${best.percent}% refund when cancelling ${best.min_days}+ days before departure`;
}

export default function RefundTiersTable({ tiers, note = true }: { tiers: RefundTier[]; note?: boolean }) {
  if (!tiers.length) return null;
  const sorted = [...tiers].sort((a, b) => b.min_days - a.min_days);
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm font-open-sans">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-2.5 font-semibold">Cancelling</th>
              <th className="px-4 py-2.5 font-semibold text-right">Refund of amount paid</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((tier, index) => {
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
            <tr className="border-t border-gray-100 dark:border-gray-800">
              <td className="px-4 py-2.5">After arrival / once the experience has started</td>
              <td className="px-4 py-2.5 text-right font-bold text-red-600">No refund</td>
            </tr>
          </tbody>
        </table>
      </div>
      {note && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 leading-relaxed">
          Refunds are calculated on the amount actually paid, excluding non-refundable third-party
          costs. No refunds once the tour has commenced, or for missed activities, unused services or
          voluntary early departure. We strongly recommend comprehensive travel insurance.
        </p>
      )}
    </>
  );
}
