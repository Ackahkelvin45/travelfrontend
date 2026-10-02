"use client";

import Link from "next/link";
import { useState } from "react";
import { useStaffRefundsQuery, useResolveRefundMutation, type StaffRefund } from "@/lib/api/staffApi";
import Spinner from "@/components/ui/Spinner";
import { fmtDate, fmtMoney } from "@/lib/format";

const BASIS: Record<string, string> = {
  organizer_cancellation: "Full refund — we cancelled",
  arrived_or_started: "Arrival rule",
};

export default function StaffRefundsPage() {
  const [tab, setTab] = useState<"pending" | "processed" | "rejected">("pending");
  const { data, isLoading, isError } = useStaffRefundsQuery({ status: tab });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-raleway text-text-primary">Refunds to pay</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans mt-1">
          Send the money first — in the Paystack dashboard for card/MoMo payments, or by bank transfer — then record it here with the reference. The guest is emailed the amount and reference automatically.
        </p>
      </div>
      <div className="flex gap-2">
        {(["pending", "processed", "rejected"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-open-sans border capitalize ${t === tab ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-700 text-text-primary"}`}>{t === "pending" ? "To pay" : t}</button>
        ))}
      </div>

      {isLoading ? <div className="py-16 flex justify-center"><Spinner /></div>
        : isError ? <p className="text-sm text-red-600 font-open-sans">Couldn&apos;t load refunds.</p>
        : !data?.length ? <p className="text-sm text-gray-500 font-open-sans py-10 text-center">Nothing here.</p>
        : <div className="flex flex-col gap-4">{data.map((r) => <RefundCard key={r.id} r={r} />)}</div>}
    </div>
  );
}

function RefundCard({ r }: { r: StaffRefund }) {
  const [mode, setMode] = useState<"process" | "reject" | null>(null);
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolve, { isLoading }] = useResolveRefundMutation();
  const b = r.booking;

  const submit = async () => {
    if (!mode) return;
    setError(null);
    try { await resolve({ id: r.id, decision: mode, external_reference: ref, note, reference: b.reference }).unwrap(); }
    catch (e) { setError((e as { data?: { detail?: string } })?.data?.detail ?? "Could not save."); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 font-open-sans">Created {fmtDate(r.requested_at)}{r.basis && ` · ${BASIS[r.basis] ?? r.basis}`}</p>
          <p className="text-lg font-bold font-raleway text-text-primary">{b.first_name} {b.last_name}</p>
          <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300">
            <Link href={`/staff/bookings/${b.reference}`} className="text-primary font-semibold hover:underline">{b.reference}</Link> · {b.package_title}
          </p>
          <p className="text-xs text-gray-500 font-open-sans">{b.email}{r.reason && ` · ${r.reason}`}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-open-sans">Amount to return</p>
          <p className="text-2xl font-bold font-raleway text-text-primary">{fmtMoney(r.amount, r.currency)}</p>
          {r.percent && <p className="text-xs text-gray-500 font-open-sans">{parseFloat(r.percent)}% of the payment below</p>}
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm font-open-sans text-gray-700 dark:text-gray-300 flex flex-col gap-1">
        <p><span className="text-gray-500">Original payment:</span> {r.payment_reference ?? "offline payment"}{r.payment_method && ` (${r.payment_method.replace("_", " ")})`}</p>
        {r.gateway_instruction
          ? <p className="font-semibold text-text-primary">{r.gateway_instruction}</p>
          : <p>Return {fmtMoney(r.amount, r.currency)} {r.payment_method === "paystack" ? "via the Paystack dashboard to this transaction." : "by bank transfer to the guest."}</p>}
      </div>

      {r.status !== "pending" ? (
        <p className="text-sm font-open-sans">
          <span className={`font-semibold capitalize ${r.status === "processed" ? "text-green-700" : "text-red-600"}`}>{r.status}</span>
          {r.processed_at && ` on ${fmtDate(r.processed_at)}`}{r.external_reference && ` · ref ${r.external_reference}`}
          {r.execution_note && <span className="block text-xs text-gray-500 mt-1">{r.execution_note}</span>}
        </p>
      ) : !mode ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode("process")} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold font-open-sans hover:bg-primary/90">I&apos;ve sent this refund</button>
          <button onClick={() => setMode("reject")} className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold font-open-sans text-text-primary hover:border-red-400">Won&apos;t be paid</button>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
          {mode === "process" ? (
            <>
              <p className="text-sm font-bold font-open-sans text-text-primary">Record that {fmtMoney(r.amount, r.currency)} has been sent</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans">The guest is emailed the amount, today&apos;s date and this reference.</p>
              <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Refund reference (Paystack refund id or bank transfer reference) — required" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900" />
            </>
          ) : (
            <p className="text-sm font-bold font-open-sans text-text-primary">Mark this refund as not payable. The guest is <em>not</em> emailed — contact them directly.</p>
          )}
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (optional)" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={isLoading || (mode === "process" && !ref.trim())} className={`px-5 py-2.5 rounded-full text-white text-sm font-semibold font-open-sans disabled:opacity-50 ${mode === "process" ? "bg-primary hover:bg-primary/90" : "bg-red-600 hover:bg-red-700"}`}>
              {isLoading ? "Saving…" : mode === "process" ? "Confirm — refund sent" : "Confirm — won't be paid"}
            </button>
            <button onClick={() => setMode(null)} className="px-4 py-2.5 text-sm font-semibold font-open-sans text-gray-500 hover:text-text-primary">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
