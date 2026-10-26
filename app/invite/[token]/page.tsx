"use client";

/** An invited guest completes their own details (client feedback, Oct 2026).
 * The signed link is the access; it shows and edits only this guest. Signing
 * in with the invited email links the ticket to their own dashboard. */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import {
  useClaimGuestInviteMutation, useGuestInviteQuery, useSaveGuestInviteMutation, type GuestInvite,
} from "@/lib/api/bookingsApi";
import { useAppSelector } from "@/lib/store/hooks";
import { fmtDate } from "@/lib/format";

const field = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-3 text-[15px] text-text-primary focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20";
const fieldset = "m-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-4 min-w-0";
const legend = "font-raleway font-bold text-[17px] px-1.5 text-text-primary";
const label = "flex flex-col gap-1.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300";

// Ghana is GMT all year, so "HH:mm in Accra" is exactly UTC.
const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const toIso = (local: string) => (local ? `${local}:00Z` : null);

type Guest = GuestInvite["guest"];

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  // The route param arrives URL-encoded (the token contains ":"); the API calls encode it again.
  const token = decodeURIComponent(use(params).token);
  const signedIn = useAppSelector((s) => !!s.auth.token);
  const { data, isLoading, isError, error } = useGuestInviteQuery(token);
  const [save, { isLoading: saving }] = useSaveGuestInviteMutation();
  const [claim, { isLoading: claiming }] = useClaimGuestInviteMutation();
  const [g, setG] = useState<Guest | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [claimNote, setClaimNote] = useState<{ ok: boolean; text: string } | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- seed the editable copy from the server
  useEffect(() => { if (data && !g) setG(data.guest); }, [data, g]);

  if (isLoading) return <Centered><Spinner /></Centered>;
  if (isError || !data || !g) {
    const detail = (error as { data?: { detail?: string } } | undefined)?.data?.detail;
    return (
      <Centered>
        <h1 className="font-raleway text-2xl font-bold text-text-primary">This invite can&apos;t be opened</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md">{detail ?? "Please ask the person who booked to resend your invite."}</p>
      </Centered>
    );
  }

  const set = (patch: Partial<Guest>) => setG({ ...g, ...patch });
  const editable = data.status === "pending" || data.status === "confirmed";
  const next = `/invite/${token}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      await save({
        token, full_name: g.full_name, phone: g.phone, arrival_at: g.arrival_at, arrival_flight: g.arrival_flight,
        departure_at: g.departure_at, departure_flight: g.departure_flight, emergency_contact: g.emergency_contact,
        emergency_phone: g.emergency_phone, dietary: g.dietary, accessibility: g.accessibility,
      }).unwrap();
      setStatus({ ok: true, text: "Thank you. Your details are saved and the trip coordinator can see them." });
    } catch (err) {
      const d = (err as { data?: Record<string, string[] | string> }).data;
      const first = d && (typeof d.detail === "string" ? d.detail : Object.values(d).flat()[0]);
      setStatus({ ok: false, text: (first as string) || "We couldn't save. Please check the fields and try again." });
    }
  };

  const link = async () => {
    setClaimNote(null);
    try {
      await claim(token).unwrap();
      setClaimNote({ ok: true, text: "Linked. Your ticket now shows on your dashboard." });
    } catch (err) {
      setClaimNote({ ok: false, text: (err as { data?: { detail?: string } }).data?.detail ?? "We couldn't link your account." });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-[760px] mx-auto px-4 md:px-10 flex flex-col gap-5">
        <div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Booking {data.reference} · booked by {data.lead_name}</span>
          <h1 className="mt-1 font-raleway text-[30px] font-bold text-text-primary">Your details for {data.package_title}</h1>
          <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300">
            From {fmtDate(data.travel_date)}. Nothing is charged here; this only completes your place on the booking.
          </p>
        </div>

        <section className={fieldset} aria-label="Your place">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><dt className="text-xs text-gray-500 dark:text-gray-400">Ticket</dt><dd className="font-semibold text-text-primary">{data.ticket}</dd></div>
            <div><dt className="text-xs text-gray-500 dark:text-gray-400">Accommodation</dt><dd className="font-semibold text-text-primary">{data.unit ?? "Own stay"}</dd></div>
            <div><dt className="text-xs text-gray-500 dark:text-gray-400">Experiences</dt><dd className="font-semibold text-text-primary">{data.experiences.length ? data.experiences.join(", ") : "None added"}</dd></div>
          </dl>
        </section>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <fieldset className={fieldset} disabled={!editable}>
            <legend className={legend}>About you</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <label className={label}>Full name, as on your passport<input required className={field} value={g.full_name} onChange={(e) => set({ full_name: e.target.value })} /></label>
              <label className={label}>Phone, with country code<input type="tel" className={field} value={g.phone} onChange={(e) => set({ phone: e.target.value })} /></label>
              <label className={label}>Email<input disabled className={`${field} opacity-70`} value={g.email} /></label>
            </div>
          </fieldset>

          <fieldset className={fieldset} disabled={!editable}>
            <legend className={legend}>Arrival &amp; departure</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <label className={label}>Arrival date and time (Accra)<input type="datetime-local" className={field} value={toLocal(g.arrival_at)} onChange={(e) => set({ arrival_at: toIso(e.target.value) })} /></label>
              <label className={label}>Flight number<input className={field} placeholder="e.g. DL 156" value={g.arrival_flight} onChange={(e) => set({ arrival_flight: e.target.value })} /></label>
              <label className={label}>Departure date and time (Accra)<input type="datetime-local" className={field} value={toLocal(g.departure_at)} onChange={(e) => set({ departure_at: toIso(e.target.value) })} /></label>
              <label className={label}>Departure flight<input className={field} value={g.departure_flight} onChange={(e) => set({ departure_flight: e.target.value })} /></label>
            </div>
          </fieldset>

          <fieldset className={fieldset} disabled={!editable}>
            <legend className={legend}>Emergency contact and needs</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <label className={label}>Name and relationship<input className={field} placeholder="e.g. Kofi Mensah, brother" value={g.emergency_contact} onChange={(e) => set({ emergency_contact: e.target.value })} /></label>
              <label className={label}>Their phone, with country code<input type="tel" className={field} value={g.emergency_phone} onChange={(e) => set({ emergency_phone: e.target.value })} /></label>
            </div>
            <label className={label}>Dietary requirements or allergies<input className={field} placeholder="e.g. Vegetarian, nut allergy" value={g.dietary} onChange={(e) => set({ dietary: e.target.value })} /></label>
            <label className={label}>Accessibility needs<textarea rows={3} className={field} value={g.accessibility} onChange={(e) => set({ accessibility: e.target.value })} /></label>
          </fieldset>

          {status && <p role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{status.text}</p>}
          {editable ? (
            <button type="submit" disabled={saving} className="self-end bg-primary text-white font-montserrat font-semibold text-[15px] px-7 py-3.5 rounded-2xl disabled:opacity-50">
              {saving ? "Saving…" : g.details_completed_at ? "Save changes" : "Complete my details"}
            </button>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">This booking can no longer be changed.</p>
          )}
        </form>

        <section className={fieldset} aria-label="Your dashboard">
          <h2 className="font-raleway font-bold text-[17px] text-text-primary">See your trip in your own account</h2>
          {data.linked_account && !claimNote ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This ticket is linked to an account. <Link href="/dashboard" className="font-semibold text-[#8A6420] dark:text-primary underline">Open my dashboard</Link>
            </p>
          ) : signedIn ? (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={link} disabled={claiming} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {claiming ? "Linking…" : "Add this ticket to my account"}
              </button>
              {claimNote?.ok && <Link href="/dashboard" className="text-sm font-semibold text-[#8A6420] dark:text-primary underline">Open my dashboard</Link>}
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-[#8A6420] dark:text-primary underline">Create an account</Link>
              {" "}or{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-[#8A6420] dark:text-primary underline">sign in</Link>
              {" "}with {g.email} to see your ticket, room, experiences and payments.
            </p>
          )}
          {claimNote && <p role={claimNote.ok ? "status" : "alert"} className={`text-sm ${claimNote.ok ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>{claimNote.text}</p>}
        </section>
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="min-h-[70vh] pt-24 flex flex-col gap-3 items-center justify-center p-6 text-center">{children}</main>;
}
