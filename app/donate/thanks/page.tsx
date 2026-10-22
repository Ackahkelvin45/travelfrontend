"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLazyVerifyDonationQuery } from "@/lib/api/donationsApi";
import Spinner from "@/components/ui/Spinner";
import { fmtMoney } from "@/lib/format";

function Thanks() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [verify, { data, isError }] = useLazyVerifyDonationQuery();

  // Paystack can take a moment to settle: check a few times.
  useEffect(() => {
    if (!reference) return;
    let tries = 0;
    const tick = () => verify(reference).unwrap().then((d) => {
      if (d.status === "pending" && ++tries < 6) setTimeout(tick, 3000);
    }).catch(() => {});
    tick();
  }, [reference, verify]);

  if (!reference) return <p className="text-gray-700 dark:text-gray-300">No donation reference found.</p>;
  if (isError) return <p className="text-gray-700 dark:text-gray-300">We couldn&apos;t check this donation. If you were charged, your receipt will arrive by email.</p>;
  if (!data || data.status === "pending") {
    return <div className="flex flex-col items-center gap-3"><Spinner /><p className="text-text-primary font-semibold">Confirming your donation…</p></div>;
  }
  if (data.status === "failed") {
    return (
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-raleway text-2xl font-bold text-text-primary">The donation didn&apos;t go through</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">No money was taken.</p>
        <Link href="/donate" className="font-semibold text-[#8A6420] dark:text-primary">Try again</Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="font-raleway text-3xl font-bold text-text-primary">Thank you</h1>
      <p className="text-[15px] text-gray-700 dark:text-gray-300">Your {fmtMoney(data.amount, data.currency)} donation to the Michael Blackson Academy has been received.</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Reference {data.reference} · a receipt is on its way by email.</p>
      <Link href="/" className="mt-2 font-semibold text-[#8A6420] dark:text-primary">Back to Azura Travels</Link>
    </div>
  );
}

export default function DonationThanksPage() {
  return (
    <main className="w-full px-4 md:px-10 pt-32 pb-16 min-h-[70vh] flex items-start justify-center text-center">
      <Suspense fallback={<Spinner />}><Thanks /></Suspense>
    </main>
  );
}
