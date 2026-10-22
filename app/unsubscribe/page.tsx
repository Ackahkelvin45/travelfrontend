"use client";

/** The "Stop these emails" link in quote reminders (signed token). Turns off
 * marketing for that enquiry; booking and payment emails are unaffected. */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { BASE_URL } from "@/lib/api/baseApi";

function Unsubscribe() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}leads/unsubscribe/`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
    })
      .then(async (r) => setState({ ok: r.ok, text: ((await r.json()) as { detail?: string }).detail ?? "" }))
      .catch(() => setState({ ok: false, text: "We couldn't reach our server. Please try the link again." }));
  }, [token]);

  if (!token) return <p className="text-gray-700 dark:text-gray-300">This link is incomplete.</p>;
  if (!state) return <Spinner />;
  return (
    <div className="flex flex-col items-center gap-3">
      <h1 className="font-raleway text-2xl font-bold text-text-primary">{state.ok ? "You're unsubscribed" : "Something went wrong"}</h1>
      <p className="text-sm text-gray-700 dark:text-gray-300">{state.text}</p>
      {state.ok && <p className="text-xs text-gray-500 dark:text-gray-400">You&apos;ll still get emails about any booking you make.</p>}
      <Link href="/" className="mt-2 font-semibold text-[#8A6420] dark:text-primary">Back to Azura Travels</Link>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="w-full px-4 pt-32 pb-16 min-h-[60vh] flex items-start justify-center text-center">
      <Suspense fallback={<Spinner />}><Unsubscribe /></Suspense>
    </main>
  );
}
