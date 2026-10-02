"use client";

import { useRouter } from "next/navigation";
import { useGetConfigurableMatrixQuery } from "@/lib/api/packagesApi";
import Spinner from "@/components/ui/Spinner";

export default function ConfigurableBookingPanel({ packageId, spotsLeft }: { packageId: string; spotsLeft?: number | null }) {
  const soldOut = spotsLeft === 0;
  const router = useRouter();
  const { data: matrix, isLoading } = useGetConfigurableMatrixQuery(packageId);

  const currency = matrix?.currency ?? "USD";
  const base = matrix?.base_price_per_person;
  const addonCount =
    (matrix?.addon_groups.reduce((n, g) => n + g.addons.filter((a) => parseFloat(a.price) > 0).length, 0) ?? 0) +
    (matrix?.ungrouped_addons.filter((a) => parseFloat(a.price) > 0).length ?? 0);

  return (
    <div className="bg-white dark:bg-gray-900 w-full max-w-md mx-auto lg:max-w-none rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6">
      {isLoading || !matrix ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">From</span>
            <span className="text-2xl font-bold font-raleway text-text-primary">
              {currency} {base ? parseFloat(base).toLocaleString() : "—"}
            </span>
            <span className="text-xs text-gray-500">/ person</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans mb-5">
            Core Tour included{addonCount > 0 ? ` · ${addonCount} optional add-on${addonCount === 1 ? "" : "s"}` : ""}.
            Bundle discounts apply automatically.
          </p>

          <button
            onClick={() => router.push(`/experience?package=${packageId}`)}
            disabled={soldOut}
            className="block w-full bg-primary text-white py-3.5 rounded-2xl font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {soldOut ? "Fully booked" : "Build your experience"}
          </button>
          {typeof spotsLeft === "number" && spotsLeft > 0 && spotsLeft <= 10 && (
            <p className="mt-2 text-[11px] text-center text-amber-700 dark:text-amber-500 font-semibold">Only {spotsLeft} place{spotsLeft === 1 ? "" : "s"} left</p>
          )}
          <p className="mt-3 text-[11px] text-center text-gray-500">
            Deposit from {matrix.installments.deposit_minimum ? `${currency} ${parseFloat(matrix.installments.deposit_minimum).toLocaleString()}` : "—"} · secure checkout via Paystack
          </p>
        </>
      )}
    </div>
  );
}
