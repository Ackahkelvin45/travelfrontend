"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetSiteSettingsQuery } from "@/lib/api/packagesApi";
import { useStartDonationMutation } from "@/lib/api/donationsApi";
import { payDonation } from "@/lib/donation";

const PRESETS = ["25", "50", "100", "250"];
const input = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function DonateForm() {
  const router = useRouter();
  const { data: site, isLoading } = useGetSiteSettingsQuery();
  const [start, { isLoading: starting }] = useStartDonationMutation();
  const [form, setForm] = useState({ name: "", email: "", amount: "50" });
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return null;
  if (!site?.donations_open) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 flex flex-col gap-2">
        <h2 className="font-raleway font-bold text-xl text-text-primary">Donations open soon</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">We&apos;re verifying the Academy&apos;s own account so that every gift goes straight to it. Please check back shortly.</p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await start({ name: form.name, email: form.email, amount: form.amount }).unwrap();
      await payDonation(res, (ref) => router.push(`/donate/thanks?reference=${ref}`));
    } catch (err) {
      setError((err as { data?: { detail?: string } })?.data?.detail ?? "The donation didn't start. No money was taken. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md p-6 md:p-8 flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount (USD)</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} type="button" aria-pressed={form.amount === p} onClick={() => setForm({ ...form, amount: p })}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold ${form.amount === p ? "border-primary bg-primary/10 text-[#6B4E1A] dark:text-primary" : "border-gray-200 dark:border-gray-700 text-text-primary"}`}>
              ${p}
            </button>
          ))}
        </div>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Or another amount
          <input required type="number" inputMode="decimal" min={1} step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={`${input} mt-1`} />
        </label>
      </fieldset>
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your name
        <input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${input} mt-1`} />
      </label>
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email for your receipt
        <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${input} mt-1`} />
      </label>
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
      <button type="submit" disabled={starting} className="bg-primary text-white font-montserrat font-semibold rounded-xl py-3.5 transition hover:brightness-95 disabled:opacity-50">
        {starting ? "Opening secure payment…" : `Donate $${form.amount || "0"}`}
      </button>
      <p className="text-[11px] text-center text-gray-500 dark:text-gray-400">Charged in Ghana cedis at today&apos;s rate through our secure payment partner. Card or mobile money.</p>
    </form>
  );
}
