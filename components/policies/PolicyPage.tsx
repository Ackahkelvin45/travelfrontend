"use client";

/**
 * A published policy document as its own page. The text comes from the
 * versioned PolicyDocument the customer actually accepts at checkout — one
 * source of truth, so a policy page can never drift from the contract.
 */

import Link from "next/link";
import { useGetCurrentPoliciesQuery, type PolicyDoc } from "@/lib/api/packagesApi";
import Spinner from "@/components/ui/Spinner";

export const POLICY_PATHS: Record<PolicyDoc["type"], string> = {
  terms: "/terms-and-conditions",
  refund: "/refund-policy",
  installment: "/installment-policy",
  privacy: "/privacy-policy",
  media: "/privacy-policy",
};

export default function PolicyPage({ type, fallbackTitle }: { type: PolicyDoc["type"]; fallbackTitle: string }) {
  const { data: policies = [], isLoading } = useGetCurrentPoliciesQuery();
  const doc = policies.find((d) => d.type === type);

  return (
    <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold font-raleway text-text-primary mb-2">
        {doc?.title ?? fallbackTitle}
      </h1>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : doc ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 print:hidden">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">
              Version {doc.version}
              {doc.published_at && ` · published ${new Date(doc.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
            </p>
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold font-open-sans border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-text-primary hover:border-primary"
            >
              Print / save as PDF
            </button>
          </div>
          <div className="text-sm font-open-sans text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
            {doc.body}
          </div>
        </>
      ) : (
        <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300">
          This policy has not been published yet. Please{" "}
          <a href="mailto:hello@azuratravels.live" className="text-primary underline">contact us</a>{" "}
          for a copy.
        </p>
      )}

      <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-5 gap-y-2 text-xs font-open-sans">
        {(["terms", "refund", "installment", "privacy"] as const)
          .filter((t) => t !== type)
          .map((t) => (
            <Link key={t} href={POLICY_PATHS[t]} className="text-primary hover:underline">
              {policies.find((d) => d.type === t)?.title ?? t}
            </Link>
          ))}
      </div>
    </main>
  );
}
