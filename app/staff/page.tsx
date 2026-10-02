"use client";

import Link from "next/link";
import { useState } from "react";
import { useStaffBookingsQuery, type StaffBookingListParams } from "@/lib/api/staffApi";
import Spinner from "@/components/ui/Spinner";
import { fmtDate, fmtMoney } from "@/lib/format";

const FILTERS: { label: string; params: StaffBookingListParams }[] = [
  { label: "All", params: {} },
  { label: "Unpaid", params: { payment_state: "unpaid" } },
  { label: "Part paid", params: { payment_state: "partially_paid" } },
  { label: "Fully paid", params: { payment_state: "fully_paid" } },
  { label: "Overdue", params: { overdue: "1" } },
  { label: "Cancellation requested", params: { pending_cancellation: "1" } },
  { label: "Arrived", params: { arrived: "1" } },
  { label: "Cancelled", params: { status: "cancelled" } },
];

const STATE_LABEL: Record<string, string> = { unpaid: "Unpaid", partially_paid: "Part paid", fully_paid: "Paid" };
const STATE_CLASS: Record<string, string> = {
  unpaid: "bg-gray-100 text-gray-700", partially_paid: "bg-amber-100 text-amber-800", fully_paid: "bg-green-100 text-green-700",
};

export default function StaffBookingsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(0);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useStaffBookingsQuery({ ...FILTERS[filter].params, q: q || undefined, page });

  const pageSize = 10;
  const pages = data ? Math.max(1, Math.ceil(data.count / pageSize)) : 1;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search by reference, name, email or tour"
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900"
        />
        {isFetching && <Spinner className="w-4 h-4" />}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            onClick={() => { setFilter(i); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-open-sans border transition-colors ${
              i === filter ? "bg-primary text-white border-primary" : "border-gray-200 dark:border-gray-700 text-text-primary hover:border-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : isError ? (
        <p className="text-sm text-red-600 font-open-sans">Couldn&apos;t load bookings. Try again.</p>
      ) : !data || data.results.length === 0 ? (
        <p className="text-sm text-gray-500 font-open-sans py-10 text-center">No bookings match.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="w-full text-sm font-open-sans">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3 text-right">Paid / Total</th>
                  <th className="px-4 py-3 text-right">Still owed</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((b) => (
                  <tr key={b.reference} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/staff/bookings/${b.reference}`} className="font-bold text-primary hover:underline">{b.reference}</Link>
                      <span className="block text-xs text-gray-500">{fmtDate(b.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-text-primary">{b.first_name} {b.last_name}</span>
                      <span className="block text-xs text-gray-500">{b.email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {b.package_title}
                      <span className="block text-xs text-gray-500">{fmtDate(b.travel_date)} · {b.num_guests} guest{b.num_guests === 1 ? "" : "s"}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-text-primary">
                      {fmtMoney(b.amount_paid, b.currency)} <span className="text-gray-400">/ {fmtMoney(b.total_amount, b.currency)}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-text-primary">
                      {parseFloat(b.balance) > 0 ? fmtMoney(b.balance, b.currency) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATE_CLASS[b.payment_state]}`}>{STATE_LABEL[b.payment_state]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.status === "cancelled" && <Flag className="bg-red-100 text-red-700">Cancelled</Flag>}
                        {b.status === "completed" && <Flag className="bg-blue-100 text-blue-700">Completed</Flag>}
                        {b.is_overdue && <Flag className="bg-red-100 text-red-700">Overdue</Flag>}
                        {b.has_pending_cancellation && <Flag className="bg-amber-100 text-amber-800">Cancellation requested</Flag>}
                        {b.arrived_at && <Flag className="bg-green-100 text-green-700">Arrived</Flag>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm font-open-sans text-gray-600 dark:text-gray-300">
            <span>{data.count} booking{data.count === 1 ? "" : "s"}</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 disabled:opacity-40">Previous</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Flag({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${className}`}>{children}</span>;
}
