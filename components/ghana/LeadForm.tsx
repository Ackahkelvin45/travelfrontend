"use client";

import { useState } from "react";
import { useSubscribeNewsletterMutation } from "@/lib/api/newsletterApi";

/** Consent-gated email capture (stores via the existing newsletter endpoint). */
export default function LeadForm({ title = "Get December in Ghana Updates", cta = "Keep me posted" }: { title?: string; cta?: string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) return setError("Please tick the box so we can contact you.");
    try {
      await subscribe({ email }).unwrap();
      setDone(true);
    } catch (err: unknown) {
      const data = (err as { data?: { email?: string[]; message?: string } })?.data;
      setError(data?.email?.[0] || data?.message || "Something went wrong. Please try again.");
    }
  };

  if (done) {
    return (
      <div role="status" className="content-in flex flex-col gap-3">
        <span aria-hidden="true" className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl">✓</span>
        <h3 className="font-raleway font-bold text-xl text-text-primary">You&apos;re on the list</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">Medaase! We&apos;ll send dates and availability. Reminders stop once you book or opt out.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <h3 className="font-raleway font-bold text-xl text-text-primary">{title}</h3>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="font-normal px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        />
      </label>
      <label className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-[#BD8F3A]" />
        I agree to receive trip updates and offers by email. Unsubscribe any time.
      </label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={isLoading} className="self-start bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all disabled:opacity-60">
        {isLoading ? "Sending…" : cta}
      </button>
    </form>
  );
}
