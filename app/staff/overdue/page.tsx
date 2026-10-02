"use client";

import Link from "next/link";
import { useState } from "react";
import { useStaffBookingsQuery, useStaffBookingQuery, useStaffCancelBookingMutation, useStaffMeQuery, type StaffBookingRow } from "@/lib/api/staffApi";
import Spinner from "@/components/ui/Spinner";
import { fmtDate, fmtMoney } from "@/lib/format";

export default function StaffOverduePage() {
  const { data, isLoading, isError } = useStaffBookingsQuery({ overdue: "1" });
  const { data: me } = useStaffMeQuery();
  const canGuest = !!me?.perms.includes("bookings.cancel_booking");
  const canOrganizer = !!me?.perms.includes("bookings.cancel_as_organizer");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-raleway text-text-primary">Overdue balances</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans mt-1">
          Guests past their payment deadline. Each gets one overdue notice and 72 hours to pay — nothing is cancelled automatically.
          After the cure period, Finance decides. Most guests just need a call.
        </p>
      </div>
      {isLoading ? <div className="py-16 flex justify-center"><Spinner /></div>
        : isError ? <p className="text-sm text-red-600 font-open-sans">Couldn&apos;t load.</p>
        : !data?.results.length ? <p className="text-sm text-gray-500 font-open-sans py-10 text-center">No overdue balances. 🎉</p>
        : <div className="flex flex-col gap-4">{data.results.map((b) => <OverdueCard key={b.reference} row={b} canGuest={canGuest} canOrganizer={canOrganizer} />)}</div>}
    </div>
  );
}

function OverdueCard({ row, canGuest, canOrganizer }: { row: StaffBookingRow; canGuest: boolean; canOrganizer: boolean }) {
  const { data: b } = useStaffBookingQuery(row.reference);   // for notice / cure details
  const [mode, setMode] = useState<"guest" | "organizer" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cancel, { isLoading }] = useStaffCancelBookingMutation();
  const [now] = useState(() => Date.now());   // read once per mount — not during every render

  const cureEnd = b?.cure_deadline ? new Date(b.cure_deadline) : null;
  const cureExpired = cureEnd ? cureEnd.getTime() < now : false;
  const stage = !b ? "" : !b.overdue_notice_sent_at ? "Notice not sent yet (goes out with the daily run)"
    : cureExpired ? `Cure period ended ${cureEnd!.toLocaleString("en-GB", { timeZone: "Africa/Accra" })} GMT — decision needed`
    : `In cure period until ${cureEnd!.toLocaleString("en-GB", { timeZone: "Africa/Accra" })} GMT`;

  const submit = async () => {
    if (!mode) return;
    setError(null);
    try { await cancel({ reference: row.reference, mode, note }).unwrap(); setMode(null); }
    catch (e) { setError((e as { data?: { detail?: string } })?.data?.detail ?? "Could not cancel."); }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-lg font-bold font-raleway text-text-primary">{row.first_name} {row.last_name}</p>
          <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300">
            <Link href={`/staff/bookings/${row.reference}`} className="text-primary font-semibold hover:underline">{row.reference}</Link> · {row.package_title} · departs {fmtDate(row.travel_date)}
          </p>
          <p className="text-xs text-gray-500 font-open-sans">{row.email}</p>
          <p className={`text-xs font-open-sans mt-1 ${cureExpired ? "text-red-600 font-semibold" : "text-gray-500"}`}>{stage}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-open-sans">Still owed</p>
          <p className="text-2xl font-bold font-raleway text-red-600">{fmtMoney(row.balance, row.currency)}</p>
          <p className="text-xs text-gray-500 font-open-sans">paid {fmtMoney(row.amount_paid, row.currency)} · due {row.payment_deadline ? fmtDate(row.payment_deadline) : "—"}</p>
        </div>
      </div>

      {(canGuest || canOrganizer) && !mode && (
        <div className="flex flex-wrap gap-2">
          {canGuest && <button onClick={() => setMode("guest")} className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold font-open-sans text-text-primary hover:border-red-400">Cancel — guest didn&apos;t pay</button>}
          {canOrganizer && <button onClick={() => setMode("organizer")} className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-semibold font-open-sans text-text-primary hover:border-primary">Cancel — our fault, full refund</button>}
        </div>
      )}
      {mode && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-4 flex flex-col gap-3">
          <p className="text-sm font-bold font-open-sans text-text-primary">
            {mode === "guest"
              ? `Cancel this booking. The refund follows the date bands on the ${fmtMoney(row.amount_paid, row.currency)} paid, as of today.`
              : `Cancel as organizer. The guest is refunded the full ${fmtMoney(row.amount_paid, row.currency)} paid.`}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans">Any refund goes to the Refunds queue for Finance to pay. Make sure you&apos;ve spoken to the guest first.</p>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the record (optional)" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={isLoading} className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold font-open-sans hover:bg-red-700 disabled:opacity-50">{isLoading ? "Cancelling…" : "Yes, cancel this booking"}</button>
            <button onClick={() => setMode(null)} className="px-4 py-2.5 text-sm font-semibold font-open-sans text-gray-500 hover:text-text-primary">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
