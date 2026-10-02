"use client";

import Link from "next/link";
import { useState } from "react";
import { useStaffCancellationsQuery, useResolveCancellationMutation, useStaffMeQuery, type StaffCancellation } from "@/lib/api/staffApi";
import Spinner from "@/components/ui/Spinner";
import { fmtDate, fmtDateLong, fmtMoney } from "@/lib/format";

export default function StaffCancellationsPage() {
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const { data, isLoading, isError } = useStaffCancellationsQuery({ status: tab });
  const { data: me } = useStaffMeQuery();
  const canResolve = !!me?.perms.includes("bookings.resolve_cancellation");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-raleway text-text-primary">Cancellation requests</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans mt-1">
          The refund is fixed at the moment the guest asked — approving later doesn&apos;t change it. Payments on a booking are paused while its request is pending.
        </p>
      </div>
      <div className="flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-open-sans border capitalize ${t === tab ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-700 text-text-primary"}`}>{t}</button>
        ))}
      </div>

      {isLoading ? <div className="py-16 flex justify-center"><Spinner /></div>
        : isError ? <p className="text-sm text-red-600 font-open-sans">Couldn&apos;t load requests.</p>
        : !data?.length ? <p className="text-sm text-gray-500 font-open-sans py-10 text-center">Nothing {tab} right now.</p>
        : <div className="flex flex-col gap-4">{data.map((r) => <RequestCard key={r.id} r={r} canResolve={canResolve && r.status === "pending"} />)}</div>}
    </div>
  );
}

function RequestCard({ r, canResolve }: { r: StaffCancellation; canResolve: boolean }) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolve, { isLoading }] = useResolveCancellationMutation();
  const b = r.booking;

  const submit = async () => {
    if (!decision) return;
    setError(null);
    try { await resolve({ id: r.id, decision, note, reference: b.reference }).unwrap(); }
    catch (e) { setError((e as { data?: { detail?: string } })?.data?.detail ?? "Could not save the decision."); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 font-open-sans">Received {new Date(r.requested_at).toLocaleString("en-GB", { timeZone: "Africa/Accra" })} GMT</p>
          <p className="text-lg font-bold font-raleway text-text-primary">{b.first_name} {b.last_name}</p>
          <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300">
            <Link href={`/staff/bookings/${b.reference}`} className="text-primary font-semibold hover:underline">{b.reference}</Link> · {b.package_title} · departs {fmtDateLong(b.travel_date)}
          </p>
          <p className="text-xs text-gray-500 font-open-sans">{b.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-open-sans">Refund if approved</p>
          <p className="text-2xl font-bold font-raleway text-text-primary">{fmtMoney(r.refund_total ?? "0", b.currency)}</p>
          <p className="text-xs text-gray-500 font-open-sans">
            {r.percent && `${parseFloat(r.percent)}% of `}{fmtMoney(b.amount_paid, b.currency)} paid
            {r.days_before_departure !== null && ` · ${r.days_before_departure} days before departure`}
          </p>
          {b.arrived_at && <p className="text-xs text-red-600 font-semibold mt-1">Guest marked arrived {fmtDate(b.arrived_at)}</p>}
        </div>
      </div>

      {r.reason && <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">Guest&apos;s reason: “{r.reason}”</p>}

      {r.status !== "pending" ? (
        <p className="text-sm font-open-sans">
          <span className={`font-semibold capitalize ${r.status === "approved" ? "text-green-700" : "text-red-600"}`}>{r.status}</span>
          {r.resolved_at && ` on ${fmtDate(r.resolved_at)}`}{r.staff_note && ` — “${r.staff_note}”`}
        </p>
      ) : !canResolve ? (
        <p className="text-xs text-gray-500 font-open-sans">Waiting for an Operations team member to decide.</p>
      ) : !decision ? (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDecision("approve")} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold font-open-sans hover:bg-primary/90">Approve cancellation</button>
          <button onClick={() => setDecision("reject")} className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold font-open-sans text-text-primary hover:border-red-400">Reject</button>
        </div>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
          <p className="text-sm font-bold font-open-sans text-text-primary">
            {decision === "approve"
              ? `Approve — the booking is cancelled and a refund of ${fmtMoney(r.refund_total ?? "0", b.currency)} goes to the Refunds queue for Finance to pay.`
              : "Reject — the booking stays active and the guest can pay again."}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans">The guest receives an email with the outcome and your note.</p>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to the guest (optional)" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900 resize-none" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={isLoading} className={`px-5 py-2.5 rounded-full text-white text-sm font-semibold font-open-sans disabled:opacity-50 ${decision === "approve" ? "bg-primary hover:bg-primary/90" : "bg-red-600 hover:bg-red-700"}`}>
              {isLoading ? "Saving…" : decision === "approve" ? "Yes, approve" : "Yes, reject"}
            </button>
            <button onClick={() => setDecision(null)} className="px-4 py-2.5 text-sm font-semibold font-open-sans text-gray-500 hover:text-text-primary">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
