"use client";

/**
 * Cancellation schedule + published policies for packages that don't use the
 * option-based CommercialSections (e.g. core + add-ons). Same accordions,
 * same data sources — the refund tiers from the package, the policy bodies
 * from the published documents.
 */

import { useState } from "react";
import { useGetCurrentPoliciesQuery, type PolicyDoc } from "@/lib/api/packagesApi";
import { AccordionItem } from "@/components/ui/Accordion";
import { FileTextIcon, ShieldIcon } from "@/components/ui/icons";
import RefundTiersTable, { cancellationSubtitle, type RefundTier } from "@/components/booking/RefundTiersTable";
import PolicyModal from "@/components/booking/PolicyModal";

export default function PolicySections({ refundTiers, showEntryRequirements }: { refundTiers: RefundTier[]; showEntryRequirements?: boolean }) {
  const { data: policies = [] } = useGetCurrentPoliciesQuery();
  const [openPolicy, setOpenPolicy] = useState<PolicyDoc | null>(null);

  if (!refundTiers.length && !policies.length) return null;

  return (
    <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">Booking terms</h2>
      <div className="flex flex-col gap-2.5">
        {refundTiers.length > 0 && (
          <AccordionItem
            title="Cancellation & refunds"
            subtitle={cancellationSubtitle(refundTiers)}
            icon={<ShieldIcon size={17} />}
          >
            <RefundTiersTable tiers={refundTiers} />
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
                  {doc.title}
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

      {showEntryRequirements && (
        <p className="mt-4 text-xs text-gray-600 dark:text-gray-300 font-open-sans leading-relaxed">
          <span className="font-semibold text-text-primary">Passports, visas and health entry rules</span> are your responsibility and change over time —
          check the official{" "}
          <a href="https://evisa.immigration.gov.gh/visa-requirements" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Ghana Immigration Service requirements
          </a>{" "}
          for your nationality before you travel. This tour does not include a Visa on Arrival service. We strongly recommend travel insurance.
        </p>
      )}
      <PolicyModal doc={openPolicy} onClose={() => setOpenPolicy(null)} />
    </section>
  );
}
