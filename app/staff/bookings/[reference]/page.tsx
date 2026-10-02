"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  useStaffBookingQuery, useStaffMeQuery,
  useRecordOfflinePaymentMutation, useExtendDeadlineMutation, useMarkArrivedMutation,
  useStaffBookingEmailsQuery, useStaffCancelBookingMutation, useChangeTravellerMutation, useRemoveAddonMutation,
  type StaffBooking,
} from "@/lib/api/staffApi";
import Spinner from "@/components/ui/Spinner";
import { fmtDate, fmtDateLong, fmtMoney } from "@/lib/format";

const err = (e: unknown, fallback: string) => (e as { data?: { detail?: string } })?.data?.detail ?? fallback;

export default function StaffBookingPage() {
  const { reference } = useParams<{ reference: string }>();
  const { data: b, isLoading, isError } = useStaffBookingQuery(reference);
  const { data: me } = useStaffMeQuery();
  const can = (p: string) => !!me?.perms.includes(p as never);

  if (isLoading) return <div className="py-16 flex justify-center"><Spinner /></div>;
  if (isError || !b) return <p className="text-sm text-red-600 font-open-sans">Booking not found.</p>;

  const balance = parseFloat(b.balance);
  const open = b.status === "pending" || b.status === "confirmed";
  const pendingCancel = b.cancellation_requests.find((r) => r.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/staff" className="text-sm font-semibold font-open-sans text-gray-600 dark:text-gray-300 hover:text-primary">← All bookings</Link>

      {/* Header */}
      <Card className="bg-primary/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 font-open-sans">Booking {b.reference}</p>
            <h1 className="text-2xl font-bold font-raleway text-text-primary">{b.first_name} {b.last_name}</h1>
            <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300 mt-1">
              {b.email}{b.phone && ` · ${b.phone}`}{b.country && ` · ${b.country}`}
            </p>
            <p className="text-xs font-open-sans text-gray-500 mt-1">
              {b.account_email ? `Has an account (${b.account_email})` : "Guest booking — no account yet"} · booked {fmtDate(b.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={{ confirmed: "green", pending: "yellow", cancelled: "red", completed: "blue" }[b.status] ?? "gray"}>{b.status}</Badge>
            {b.is_overdue && <Badge tone="red">Overdue</Badge>}
            {b.arrived_at && <Badge tone="green">Arrived {fmtDate(b.arrived_at)}</Badge>}
            {pendingCancel && <Badge tone="yellow">Cancellation requested</Badge>}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          {/* Trip + what they bought */}
          <Card title="Trip">
            <Row label="Tour" value={b.package_title} />
            <Row label="Travel date" value={fmtDateLong(b.travel_date)} />
            <Row label="Guests" value={String(b.num_guests)} />
            <Row label="Payment plan" value={b.payment_plan === "installment" ? "Deposit, then balance" : "Pay in full"} />
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-open-sans mb-2">What they bought</p>
              {b.line_items.lines.map((l) => (
                <div key={l.label + l.detail} className="flex justify-between gap-4 text-sm font-open-sans py-1">
                  <span className="text-gray-700 dark:text-gray-300">{l.label}<span className="block text-xs text-gray-500">{l.detail}</span></span>
                  <span className="text-text-primary shrink-0">{fmtMoney(l.amount, b.currency)}</span>
                </div>
              ))}
              {parseFloat(b.line_items.discount) > 0 && (
                <div className="flex justify-between text-sm font-open-sans py-1 text-green-700 dark:text-green-400">
                  <span>{b.line_items.discount_note || "Bundle discount"}</span><span>− {fmtMoney(b.line_items.discount, b.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold font-open-sans pt-2 border-t border-gray-200 dark:border-gray-700 text-text-primary">
                <span>Total</span><span>{fmtMoney(b.line_items.total, b.currency)}</span>
              </div>
            </div>
          </Card>

          {"special_requests" in b && (
            <Card title="Special requests" note="Restricted — may include dietary or medical details. Do not copy into emails.">
              <p className="text-sm font-open-sans text-text-primary whitespace-pre-line">{b.special_requests || "None given."}</p>
            </Card>
          )}

          {/* Payments */}
          <Card title="Payments">
            {b.payments.length === 0 ? (
              <p className="text-sm text-gray-500 font-open-sans">No payments yet.</p>
            ) : (
              <table className="w-full text-sm font-open-sans">
                <thead className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="pb-2">Date</th><th className="pb-2">Type</th><th className="pb-2">Method</th><th className="pb-2">Status</th><th className="pb-2 text-right">Amount</th></tr>
                </thead>
                <tbody>
                  {b.payments.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="py-2 whitespace-nowrap">{p.paid_at ? fmtDate(p.paid_at) : fmtDate(p.created_at)}</td>
                      <td className="py-2 capitalize">{p.purpose}</td>
                      <td className="py-2 capitalize">{p.method.replace("_", " ")}</td>
                      <td className="py-2 flex gap-1 flex-wrap">
                        <Badge tone={{ success: "green", pending: "yellow", failed: "red", abandoned: "gray", refunded: "blue" }[p.status] ?? "gray"}>{p.status}</Badge>
                        {p.disputed && <Badge tone="red">chargeback</Badge>}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap font-semibold text-text-primary">{fmtMoney(p.amount, p.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {b.cancellation_requests.length > 0 && (
            <Card title="Cancellation requests" note="Approve or reject from the Cancellations queue.">
              {b.cancellation_requests.map((r) => (
                <div key={r.id} className="text-sm font-open-sans py-2 border-t first:border-0 border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between gap-3">
                    <span>Received {fmtDate(r.requested_at)} · <span className="capitalize font-semibold">{r.status}</span></span>
                    <span>Quoted refund {fmtMoney(r.refund_total ?? "0", b.currency)}{r.percent && ` (${parseFloat(r.percent)}%)`}</span>
                  </div>
                  {r.reason && <p className="text-xs text-gray-500 mt-1">Guest: “{r.reason}”</p>}
                  {r.staff_note && <p className="text-xs text-gray-500 mt-1">Staff: {r.staff_note}</p>}
                </div>
              ))}
            </Card>
          )}

          {b.refunds.length > 0 && (
            <Card title="Refunds">
              {b.refunds.map((r) => (
                <div key={r.id} className="flex flex-wrap justify-between gap-2 text-sm font-open-sans py-2 border-t first:border-0 border-gray-100 dark:border-gray-800">
                  <span>{fmtMoney(r.amount, r.currency)} · <span className="capitalize font-semibold">{r.status}</span>{r.processed_at && ` on ${fmtDate(r.processed_at)}`}</span>
                  <span className="text-xs text-gray-500">{r.gateway_amount ?? (r.external_reference && `Ref ${r.external_reference}`)}</span>
                </div>
              ))}
            </Card>
          )}

          {b.addon_changes.length > 0 && (
            <Card title="Experiences cancelled">
              {b.addon_changes.map((c, i) => (
                <div key={i} className="text-sm font-open-sans py-2 border-t first:border-0 border-gray-100 dark:border-gray-800">
                  <span className="font-semibold">{c.name}</span> · {fmtDate(c.at)} by {c.by}
                  <span className="block text-gray-700 dark:text-gray-300">Charge {fmtMoney(c.charge, b.currency)} → fee kept {fmtMoney(c.fee, b.currency)}{parseFloat(c.refund) > 0 && ` · refund ${fmtMoney(c.refund, b.currency)}`} · total {fmtMoney(c.old_total, b.currency)} → {fmtMoney(c.new_total, b.currency)}</span>
                  {c.note && <span className="block text-xs text-gray-500">{c.note}</span>}
                </div>
              ))}
            </Card>
          )}

          {b.traveller_changes.length > 0 && (
            <Card title="Traveller changes">
              {b.traveller_changes.map((c, i) => (
                <div key={i} className="text-sm font-open-sans py-2 border-t first:border-0 border-gray-100 dark:border-gray-800">
                  <span className="font-semibold capitalize">{c.kind}</span> · {fmtDate(c.at)} by {c.by}
                  <span className="block text-gray-700 dark:text-gray-300">{c.from.first_name} {c.from.last_name} ({c.from.email}) → {c.to.first_name} {c.to.last_name} ({c.to.email})</span>
                  {c.note && <span className="block text-xs text-gray-500">{c.note}</span>}
                </div>
              ))}
            </Card>
          )}

          <EmailHistory reference={b.reference} />

          <Card title="Policies accepted at booking">
            {b.policy_acceptances.length === 0 ? <p className="text-sm text-gray-500 font-open-sans">None recorded.</p> : (
              <ul className="text-sm font-open-sans text-gray-700 dark:text-gray-300 flex flex-col gap-1">
                {b.policy_acceptances.map((a) => <li key={a.type}>{a.title} <span className="text-gray-400">v{a.version}</span> — {fmtDate(a.accepted_at)}</li>)}
              </ul>
            )}
          </Card>
        </div>

        {/* Money + actions */}
        <div className="flex flex-col gap-6">
          <Card title="Money">
            <Row label="Total" value={fmtMoney(b.total_amount, b.currency)} />
            <Row label="Paid so far" value={fmtMoney(b.amount_paid, b.currency)} strong />
            {parseFloat(b.amount_refunded) > 0 && <Row label="Refunded" value={fmtMoney(b.amount_refunded, b.currency)} />}
            <Row label="Still owed" value={balance > 0 ? fmtMoney(b.balance, b.currency) : "Nothing — fully paid"} strong />
            <Row label="Deadline" value={b.payment_deadline ? fmtDateLong(b.payment_deadline) : "—"} />
            {b.payment_deadline_override && (
              <p className="text-xs text-gray-500 font-open-sans mt-1">Extended: {b.payment_deadline_override_reason}</p>
            )}
            {b.cure_deadline && <Row label="Cure period ends" value={new Date(b.cure_deadline).toLocaleString("en-GB", { timeZone: "Africa/Accra" }) + " GMT"} />}
            {b.currency !== "GHS" && <p className="text-xs text-gray-500 font-open-sans mt-2">Card/MoMo payments are charged in GHS at the day&apos;s rate.</p>}
          </Card>

          {open && can("bookings.change_booking") && (
            <Card title="Traveller" note="Free. Corrections any time; replacements up to 14 days before departure, later ones need a review note.">
              <ChangeTraveller b={b} />
            </Card>
          )}
          {open && (can("payments.add_payment") || can("bookings.extend_deadline") || can("bookings.mark_arrived")) && (
            <Card title="Actions">
              <div className="flex flex-col gap-4">
                {can("payments.add_payment") && balance > 0 && !pendingCancel && <RecordPayment b={b} />}
                {can("payments.add_payment") && pendingCancel && (
                  <p className="text-xs font-open-sans text-amber-800 bg-amber-50 dark:bg-amber-900/30 rounded-xl px-3 py-2">Payments are paused while the cancellation request is under review.</p>
                )}
                {can("bookings.extend_deadline") && balance > 0 && <ExtendDeadline b={b} />}
                {can("bookings.mark_arrived") && !b.arrived_at && <MarkArrived b={b} />}
              </div>
            </Card>
          )}
          {open && can("bookings.cancel_booking") && b.addons.some((a) => parseFloat(a.line_total) > 0 && !a.code.endsWith("_cancellation_fee")) && (
            <Card title="Cancel an experience or hotel" note="Owner rule: 50% of the item's charge is kept as a fee. Cancelling the hotel makes it a No Accra Hotel booking. Finance only.">
              <RemoveAddon b={b} />
            </Card>
          )}
          {open && (can("bookings.cancel_booking") || can("bookings.cancel_as_organizer")) && (
            <Card title="Cancel this booking" note="Finance only. Talk to the guest first.">
              <CancelBooking b={b} canGuest={can("bookings.cancel_booking")} canOrganizer={can("bookings.cancel_as_organizer")} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Actions ──────────────────────────────────────────────────────────────────

function RecordPayment({ b }: { b: StaffBooking }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bank_transfer" | "other">("bank_transfer");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [record, { isLoading }] = useRecordOfflinePaymentMutation();
  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(b.balance);

  if (!open) return <ActionButton onClick={() => setOpen(true)}>Record a payment received</ActionButton>;
  return (
    <ActionForm title="Record a payment received" hint={`Bank transfer or cash the guest has already paid. Up to ${fmtMoney(b.balance, b.currency)}. The guest gets a receipt email.`}>
      <input type="number" step="0.01" min="0.01" max={b.balance} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount in ${b.currency}`} className={inputCls} />
      <select value={method} onChange={(e) => setMethod(e.target.value as "bank_transfer" | "other")} className={inputCls}>
        <option value="bank_transfer">Bank transfer</option>
        <option value="other">Cash / other</option>
      </select>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reference or note (e.g. GCB slip 1234)" className={inputCls} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <ActionButton
          disabled={!valid || isLoading}
          onClick={async () => {
            setError(null);
            try { await record({ reference: b.reference, amount: parseFloat(amount).toFixed(2), method, note }).unwrap(); setOpen(false); setAmount(""); setNote(""); }
            catch (e) { setError(err(e, "Could not record the payment.")); }
          }}
        >{isLoading ? "Saving…" : `Confirm ${valid ? fmtMoney(parseFloat(amount).toFixed(2), b.currency) : ""}`}</ActionButton>
        <Cancel onClick={() => setOpen(false)} />
      </div>
    </ActionForm>
  );
}

function ExtendDeadline({ b }: { b: StaffBooking }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [extend, { isLoading }] = useExtendDeadlineMutation();

  if (!open) return <ActionButton variant="secondary" onClick={() => setOpen(true)}>Give more time to pay</ActionButton>;
  return (
    <ActionForm title="Give more time to pay" hint="Sets a new deadline for this booking only. The reason is kept on record and reminders follow the new date.">
      <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why? (required — e.g. agreed by phone, salary on the 30th)" className={inputCls} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <ActionButton
          disabled={!date || !reason.trim() || isLoading}
          onClick={async () => {
            setError(null);
            try { await extend({ reference: b.reference, date, reason }).unwrap(); setOpen(false); }
            catch (e) { setError(err(e, "Could not extend the deadline.")); }
          }}
        >{isLoading ? "Saving…" : "Confirm new deadline"}</ActionButton>
        <Cancel onClick={() => setOpen(false)} />
      </div>
    </ActionForm>
  );
}

function MarkArrived({ b }: { b: StaffBooking }) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mark, { isLoading }] = useMarkArrivedMutation();

  if (!confirm) return <ActionButton variant="secondary" onClick={() => setConfirm(true)}>Guest has arrived</ActionButton>;
  return (
    <ActionForm title="Guest has arrived" hint="Use once the guest is in Ghana or the tour has started for them. After this, a voluntary cancellation gets no refund. This cannot be undone here.">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <ActionButton disabled={isLoading} onClick={async () => { setError(null); try { await mark({ reference: b.reference }).unwrap(); } catch (e) { setError(err(e, "Could not update.")); } }}>
          {isLoading ? "Saving…" : "Yes, mark as arrived"}
        </ActionButton>
        <Cancel onClick={() => setConfirm(false)} />
      </div>
    </ActionForm>
  );
}

function CancelBooking({ b, canGuest, canOrganizer }: { b: StaffBooking; canGuest: boolean; canOrganizer: boolean }) {
  const [mode, setMode] = useState<"guest" | "organizer" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cancel, { isLoading }] = useStaffCancelBookingMutation();
  if (!mode) {
    return (
      <div className="flex flex-col gap-2">
        {canGuest && <ActionButton variant="secondary" onClick={() => setMode("guest")}>Cancel — guest&apos;s choice / non-payment</ActionButton>}
        {canOrganizer && <ActionButton variant="secondary" onClick={() => setMode("organizer")}>Cancel — we can&apos;t deliver (full refund)</ActionButton>}
      </div>
    );
  }
  return (
    <ActionForm
      title={mode === "guest" ? "Cancel — refund follows the date bands" : "Cancel as organizer — full refund"}
      hint={mode === "guest"
        ? `The refund is calculated on ${fmtMoney(b.amount_paid, b.currency)} paid using today's date band. It goes to the Refunds queue.`
        : `The guest is refunded the full ${fmtMoney(b.amount_paid, b.currency)} paid, regardless of date. It goes to the Refunds queue.`}
    >
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the record (optional)" className={inputCls} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <ActionButton disabled={isLoading} onClick={async () => { setError(null); try { await cancel({ reference: b.reference, mode, note }).unwrap(); } catch (e) { setError(err(e, "Could not cancel.")); } }}>
          {isLoading ? "Cancelling…" : "Yes, cancel this booking"}
        </ActionButton>
        <Cancel onClick={() => setMode(null)} />
      </div>
    </ActionForm>
  );
}

function ChangeTraveller({ b }: { b: StaffBooking }) {
  const [kind, setKind] = useState<"correction" | "replacement" | null>(null);
  const [first, setFirst] = useState(b.first_name);
  const [last, setLast] = useState(b.last_name);
  const [email, setEmail] = useState(b.email);
  const [phone, setPhone] = useState(b.phone ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [change, { isLoading }] = useChangeTravellerMutation();
  const lateReplacement = kind === "replacement" && b.days_to_departure < 14;

  if (!kind) {
    return (
      <div className="flex flex-col gap-2">
        <ActionButton variant="secondary" onClick={() => setKind("correction")}>Correct a name spelling</ActionButton>
        <ActionButton variant="secondary" onClick={() => { setKind("replacement"); setFirst(""); setLast(""); setEmail(""); setPhone(""); }}>Replace the traveller</ActionButton>
      </div>
    );
  }
  return (
    <ActionForm
      title={kind === "correction" ? "Correct the traveller's name" : "Replace the traveller"}
      hint={kind === "correction"
        ? "Same person, fixed spelling. They get a confirmation email."
        : `A different person takes this place. All payments stay with the booking. The new traveller is emailed a link to claim it; the previous email is told. ${b.days_to_departure} days to departure${lateReplacement ? " — inside the 14-day cutoff, so a review note is required." : "."}`}
    >
      <div className="grid grid-cols-2 gap-2">
        <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" className={inputCls} />
        <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" className={inputCls} />
      </div>
      {kind === "replacement" && (
        <>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New traveller's email" className={inputCls} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className={inputCls} />
        </>
      )}
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={lateReplacement ? "Review note (required) — who approved, supplier confirmed?" : "Note (optional)"} className={inputCls} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <ActionButton
          disabled={isLoading || !first.trim() || !last.trim() || (kind === "replacement" && !email.trim()) || (lateReplacement && !note.trim())}
          onClick={async () => {
            setError(null);
            try { await change({ reference: b.reference, kind, first_name: first, last_name: last, email: kind === "replacement" ? email : undefined, phone: phone || undefined, note }).unwrap(); setKind(null); }
            catch (e) { setError(err(e, "Could not update the traveller.")); }
          }}
        >{isLoading ? "Saving…" : kind === "correction" ? "Save correction" : "Confirm replacement"}</ActionButton>
        <Cancel onClick={() => setKind(null)} />
      </div>
    </ActionForm>
  );
}

function RemoveAddon({ b }: { b: StaffBooking }) {
  const [code, setCode] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [remove, { isLoading }] = useRemoveAddonMutation();
  const removable = b.addons.filter((a) => parseFloat(a.line_total) > 0 && !a.code.endsWith("_cancellation_fee"));
  const chosen = removable.find((a) => a.code === code);
  const paid = parseFloat(b.amount_paid) - parseFloat(b.amount_refunded);
  const fee = chosen ? parseFloat(chosen.line_total) / 2 : 0;
  const newTotal = chosen ? parseFloat(b.total_amount) - parseFloat(chosen.line_total) + fee : 0;
  const refund = Math.max(0, paid - newTotal);

  if (!chosen) {
    return (
      <div className="flex flex-col gap-2">
        {removable.map((a) => (
          <ActionButton key={a.code} variant="secondary" onClick={() => setCode(a.code)}>Cancel {a.name} ({fmtMoney(a.line_total, b.currency)})</ActionButton>
        ))}
      </div>
    );
  }
  return (
    <ActionForm
      title={`Cancel ${chosen.name}`}
      hint={`Charge ${fmtMoney(chosen.line_total, b.currency)} → fee kept ${fmtMoney(fee.toFixed(2), b.currency)}. New total ${fmtMoney(newTotal.toFixed(2), b.currency)}. ${refund > 0 ? `Guest is owed ${fmtMoney(refund.toFixed(2), b.currency)} — goes to the Refunds queue.` : `No refund due; the balance drops to ${fmtMoney(Math.max(0, newTotal - paid).toFixed(2), b.currency)}.`} The guest is emailed.`}
    >
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the record (optional)" className={inputCls} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <ActionButton disabled={isLoading} onClick={async () => { setError(null); try { await remove({ reference: b.reference, code: chosen.code, note }).unwrap(); setCode(null); } catch (e) { setError(err(e, "Could not cancel the add-on.")); } }}>
          {isLoading ? "Saving…" : "Confirm cancellation"}
        </ActionButton>
        <Cancel onClick={() => setCode(null)} />
      </div>
    </ActionForm>
  );
}

function EmailHistory({ reference }: { reference: string }) {
  const { data, isLoading } = useStaffBookingEmailsQuery(reference);
  return (
    <Card title="Emails sent to this guest" note="What we sent and whether the email provider accepted it.">
      {isLoading ? <Spinner /> : !data?.length ? <p className="text-sm text-gray-500 font-open-sans">Nothing logged yet.</p> : (
        <ul className="flex flex-col gap-1.5 text-sm font-open-sans">
          {data.map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-2">
              <span className="text-gray-700 dark:text-gray-300">{e.subject}<span className="block text-xs text-gray-500">{e.kind.replace(/_/g, " ")} · {new Date(e.sent_at).toLocaleString("en-GB")}</span></span>
              <span className={`text-xs font-semibold self-start px-2 py-0.5 rounded-full ${e.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} title={e.error || e.provider_id}>{e.status}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── Bits ─────────────────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900";

function Card({ title, note, children, className = "" }: { title?: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 ${className}`}>
      {title && <h2 className="text-base font-bold font-raleway text-text-primary mb-3">{title}</h2>}
      {note && <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans -mt-2 mb-3">{note}</p>}
      {children}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm font-open-sans py-1">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-right ${strong ? "font-bold text-text-primary" : "text-text-primary"}`}>{value}</span>
    </div>
  );
}

const TONE: Record<string, string> = {
  green: "bg-green-100 text-green-700", yellow: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700", gray: "bg-gray-100 text-gray-700",
};
function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold font-open-sans capitalize ${TONE[tone]}`}>{children}</span>;
}

function ActionButton({ children, onClick, disabled, variant = "primary" }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "primary" | "secondary" }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`w-full py-3 rounded-full font-semibold font-open-sans text-sm transition-colors disabled:opacity-50 ${
        variant === "primary" ? "bg-primary text-white hover:bg-primary/90" : "border border-gray-200 dark:border-gray-700 text-text-primary hover:border-primary"
      }`}
    >{children}</button>
  );
}
function Cancel({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="px-4 py-3 rounded-full text-sm font-semibold font-open-sans text-gray-500 hover:text-text-primary">Cancel</button>;
}
function ActionForm({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
      <div><p className="text-sm font-bold font-open-sans text-text-primary">{title}</p><p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans mt-0.5">{hint}</p></div>
      {children}
    </div>
  );
}
