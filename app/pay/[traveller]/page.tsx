"use client";

/** A group member's "pay your share" link: the organiser forwards it, the
 * member pays their own outstanding share under the group's booking. */

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { useTravellerShareQuery } from "@/lib/api/donationsApi";
import { useInitializePaymentMutation } from "@/lib/api/bookingsApi";
import { fmtMoney } from "@/lib/format";
import { routeAfterInitialize } from "@/lib/payments/paystack";

export default function PaySharePage({ params }: { params: Promise<{ traveller: string }> }) {
  const { traveller } = use(params);
  const router = useRouter();
  const { data: share, isLoading, isError } = useTravellerShareQuery(traveller);
  const [initializePayment, { isLoading: starting }] = useInitializePaymentMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!share) return;
    setError(null);
    try {
      const payment = await initializePayment({
        booking_id: share.booking_id, intent: "traveller", traveller_id: share.traveller_id,
        payer_email: email || undefined, channel: "any",
      }).unwrap();
      await routeAfterInitialize(payment, (ref) => router.push(`/payment/callback?reference=${ref}`));
    } catch (err) {
      setError((err as { data?: { detail?: string } })?.data?.detail ?? "Payment didn't start. No money was taken. Please try again.");
    }
  };

  const card = "w-full max-w-md rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md p-6 md:p-8 flex flex-col gap-4";
  return (
    <main className="w-full px-4 pt-32 pb-16 min-h-[70vh] flex items-start justify-center bg-gray-50 dark:bg-gray-950">
      {isLoading ? <Spinner /> : isError || !share ? (
        <div className={card}><p className="text-gray-700 dark:text-gray-300">This pay link isn&apos;t valid. Ask your organiser to send it again.</p></div>
      ) : (
        <form onSubmit={pay} className={card}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6420] dark:text-primary">{share.package_title}</p>
            <h1 className="mt-1 font-raleway text-2xl font-bold text-text-primary">{share.full_name}&apos;s share</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">Group booking {share.reference}, organised by {share.organiser}.</p>
          </div>
          <dl className="grid grid-cols-3 gap-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3.5 text-[13px]">
            <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">Share</dt><dd className="font-montserrat font-bold text-text-primary">{fmtMoney(share.share, share.currency)}</dd></div>
            <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">Paid</dt><dd className="font-montserrat font-bold text-green-700 dark:text-green-400">{fmtMoney(share.paid, share.currency)}</dd></div>
            <div className="flex flex-col gap-0.5"><dt className="text-gray-500 dark:text-gray-400">To pay</dt><dd className="font-montserrat font-bold text-[#8A6420] dark:text-primary">{fmtMoney(share.outstanding, share.currency)}</dd></div>
          </dl>
          {share.payable ? (
            <>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email for your receipt
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </label>
              {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
              <button type="submit" disabled={starting} className="bg-primary text-white font-montserrat font-semibold rounded-xl py-3.5 transition hover:brightness-95 disabled:opacity-50">
                {starting ? "Opening secure payment…" : `Pay ${fmtMoney(share.outstanding, share.currency)}`}
              </button>
              <p className="text-[11px] text-center text-gray-500 dark:text-gray-400">Charged in Ghana cedis at today&apos;s rate. Card or mobile money. Every share must be paid before 6 January.</p>
            </>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {parseFloat(share.outstanding) <= 0 ? "This share is paid in full. Thank you!" : "This booking can't take payments right now. Please contact the team."}
            </p>
          )}
          <Link href="/faqs" className="text-sm font-semibold text-[#8A6420] dark:text-primary">Questions? See the FAQs</Link>
        </form>
      )}
    </main>
  );
}
