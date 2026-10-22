"use client";

/** Checkout step 2 (canvas: CheckoutDetails). Lead contact, a name for every
 * Core ticket, and agreements. Nothing is created yet; the booking is made
 * at payment, when the plan is chosen. */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutHeader from "@/components/booking/CheckoutHeader";
import CountrySelect from "@/components/booking/CountrySelect";
import PhoneInputWithCountry from "@/components/booking/PhoneInputWithCountry";
import PolicyModal from "@/components/booking/PolicyModal";
import QuoteSummary from "@/components/booking/QuoteSummary";
import Spinner from "@/components/ui/Spinner";
import { useComponentQuoteMutation, type ComponentQuote } from "@/lib/api/bookingsApi";
import { useGetComponentMatrixQuery, useGetCurrentPoliciesQuery, type PolicyDoc } from "@/lib/api/packagesApi";
import { fmtDateRange } from "@/lib/format";
import { guestCount, loadCheckout, saveCheckout, toSelection, type CheckoutState } from "@/lib/trip";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-3 text-[15px] focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20";
const fieldset = "m-0 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6 flex flex-col gap-4 min-w-0";
const legend = "font-raleway font-bold text-[17px] px-1.5 text-text-primary";
const label = "flex flex-col gap-1.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300";

export default function CheckoutDetailsPage() {
  const router = useRouter();
  const [state, setState] = useState<CheckoutState | null | undefined>(undefined);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read sessionStorage after hydration
  useEffect(() => setState(loadCheckout()), []);

  const { data: matrix } = useGetComponentMatrixQuery(state?.packageId ?? "", { skip: !state });
  const { data: policies = [] } = useGetCurrentPoliciesQuery();
  const required = policies.filter((d) => d.is_required);
  const optional = policies.filter((d) => !d.is_required);
  const [requestQuote] = useComponentQuoteMutation();
  const [quote, setQuote] = useState<ComponentQuote | null>(null);

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", country: "" });
  const [names, setNames] = useState<string[]>([]);
  const [termsOk, setTermsOk] = useState(false);
  const [optionalOk, setOptionalOk] = useState<Record<string, boolean>>({});
  const [marketing, setMarketing] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [openPolicy, setOpenPolicy] = useState<PolicyDoc | null>(null);
  const [tried, setTried] = useState(false);

  // Prefill from a previous visit to this step.
  useEffect(() => {
    if (!state) return;
    const d = state.details;
    /* eslint-disable react-hooks/set-state-in-effect -- one-time prefill */
    if (d) {
      setForm({ fullName: d.fullName, email: d.email, phone: d.phone, country: d.country });
      setTermsOk(required.length > 0 && required.every((r) => d.acceptedPolicies.includes(r.type)));
      setOptionalOk(Object.fromEntries(d.acceptedPolicies.map((t) => [t, true])));
      setMarketing(d.marketingConsent);
      setWhatsapp(!!d.whatsappUpdates);
    }
    setNames(state.choices.names);
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per loaded state
  }, [state]);

  const selection = useMemo(() => (state && matrix ? toSelection(state.packageId, state.choices, matrix) : null), [state, matrix]);
  useEffect(() => {
    if (selection) requestQuote({ ...selection, hold_token: state?.hold?.token }).unwrap().then(setQuote).catch(() => setQuote(null));
  }, [selection, requestQuote, state?.hold?.token]);

  if (state === undefined) return <Centered><Spinner /></Centered>;
  if (!state) {
    return (
      <Centered>
        <p className="text-gray-700 dark:text-gray-300">Your trip wasn&apos;t found in this tab.</p>
        <Link href="/experiences" className="font-semibold text-[#8A6420] dark:text-primary">Choose an experience</Link>
      </Centered>
    );
  }

  const n = guestCount(state.choices);
  const guestNames = Array.from({ length: n }, (_, i) => (i === 0 ? names[0] || form.fullName : names[i] ?? ""));
  const backHref = `/tour/${state.packageId}#book`;
  const rooms = selection?.rooms ?? [];
  const holdLabel = (i: number) => {
    const r = rooms.findIndex((room) => room.occupants.includes(i));
    if (r < 0) return "Own stay";
    const stay = matrix?.stay_types.find((s) => s.code === rooms[r].stay_type);
    const sameType = rooms.slice(0, r + 1).filter((room) => room.stay_type === rooms[r].stay_type).length;
    return `${stay?.name ?? "Room"} · ${stay?.kind === "airbnb" ? "Unit" : "Room"} ${sameType}`;
  };

  const errors = {
    fullName: form.fullName.trim().split(/\s+/).length < 2 ? "Enter your first and last name." : "",
    email: EMAIL_RE.test(form.email) ? "" : "Enter a valid email address.",
    phone: form.phone.replace(/\D/g, "").length >= 7 ? "" : "Enter a phone or WhatsApp number.",
    country: form.country ? "" : "Choose your country of residence.",
    names: guestNames.every((g) => g.trim().split(/\s+/).length >= 2) ? "" : "Enter a full name for every guest.",
  };
  const valid = Object.values(errors).every((e) => !e) && (termsOk || required.length === 0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    saveCheckout({
      ...state,
      choices: { ...state.choices, names: guestNames.map((g) => g.trim()) },
      details: {
        ...form,
        acceptedPolicies: [
          ...(termsOk ? required.map((d) => d.type) : []),
          ...optional.filter((d) => optionalOk[d.type]).map((d) => d.type),
        ],
        marketingConsent: marketing, whatsappUpdates: whatsapp && !!form.phone,
      },
    });
    router.push("/checkout/payment");
  };

  const err = (msg: string) => (tried && msg ? <span role="alert" className="text-xs font-normal text-red-700 dark:text-red-400">{msg}</span> : null);
  const policyLink = (d: PolicyDoc) => (
    <button type="button" onClick={() => setOpenPolicy(d)} className="underline text-[#8A6420] dark:text-primary font-semibold">{d.title}</button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CheckoutHeader step={2} hold={state.hold} backHref={backHref} />
      <div className="max-w-[1240px] mx-auto px-4 md:px-10 pt-10 pb-20 flex flex-wrap gap-8 items-start">
        <form onSubmit={onSubmit} noValidate className="flex-[999_1_600px] min-w-0 flex flex-col gap-5">
          <div>
            <h1 className="font-raleway text-[30px] font-bold text-text-primary">Your Details</h1>
            <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300">Short and simple. We&apos;ll ask for travel details after you book.</p>
          </div>

          <fieldset className={fieldset}>
            <legend className={legend}>Lead guest contact</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <label className={label}>Full name
                <input className={field} autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                {err(errors.fullName)}
              </label>
              <label className={label}>Email
                <input className={field} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {err(errors.email)}
              </label>
              <div className={label}>Phone or WhatsApp
                <PhoneInputWithCountry value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                {err(errors.phone)}
              </div>
              <div className={label}>Country of residence
                <CountrySelect value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
                {err(errors.country)}
              </div>
            </div>
          </fieldset>

          <fieldset className={fieldset}>
            <legend className={legend}>Travellers &amp; rooms</legend>
            <p className="text-[13px] text-gray-700 dark:text-gray-300">Full name for every guest, as it appears on their ID. Each guest holds one Core ticket.</p>
            {guestNames.map((g, i) => (
              <div key={i} className="flex flex-wrap gap-2.5 items-end">
                <label className={`${label} flex-[1_1_260px]`}>Guest {i + 1}{i === 0 ? " (lead)" : ""} · Core ticket
                  <input
                    className={field} value={g} placeholder="Full name"
                    onChange={(e) => setNames((prev) => { const next = [...prev]; next[i] = e.target.value; return next; })}
                  />
                </label>
                <span className="rounded-xl bg-primary/10 text-[#6B4E1A] dark:text-primary text-xs font-semibold px-3.5 py-3">{holdLabel(i)}</span>
                {selection && selection.travellers[i].experiences.length > 0 && (
                  <span className="rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3.5 py-3">
                    {selection.travellers[i].experiences.map((c) => matrix?.experiences.find((e) => e.code === c)?.name ?? c).join(" · ")}
                  </span>
                )}
              </div>
            ))}
            {err(errors.names)}
            <Link href={backHref} className="self-start text-[13px] font-semibold text-[#8A6420] dark:text-primary py-1.5">Change travellers, rooms or experiences</Link>
          </fieldset>

          <fieldset className={fieldset}>
            <legend className={legend}>Agreements</legend>
            {required.length > 0 && (
              <label className={`flex gap-3 items-start text-sm leading-relaxed p-3.5 rounded-xl border cursor-pointer transition-colors ${termsOk ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700"}`}>
                <input type="checkbox" checked={termsOk} onChange={(e) => setTermsOk(e.target.checked)} className="w-[18px] h-[18px] mt-1 accent-primary" />
                <span className="text-text-primary">
                  <strong>Required.</strong> I accept the{" "}
                  {required.map((d, i) => (
                    <span key={d.type}>{policyLink(d)} (v{d.version}){i < required.length - 2 ? ", " : i === required.length - 2 ? " and " : "."}</span>
                  ))}
                </span>
              </label>
            )}
            <label className="flex gap-3 items-start text-sm leading-relaxed text-gray-700 dark:text-gray-300 px-3.5">
              <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} className="w-[18px] h-[18px] mt-1 accent-primary" />
              <span>Optional. Also send my booking confirmation and receipts on WhatsApp, to the number above.</span>
            </label>
            <label className="flex gap-3 items-start text-sm leading-relaxed text-gray-700 dark:text-gray-300 px-3.5">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="w-[18px] h-[18px] mt-1 accent-primary" />
              <span>Optional. Send me offers and updates by email and WhatsApp.</span>
            </label>
            {optional.map((d) => (
              <label key={d.type} className="flex gap-3 items-start text-sm leading-relaxed text-gray-700 dark:text-gray-300 px-3.5">
                <input type="checkbox" checked={!!optionalOk[d.type]} onChange={(e) => setOptionalOk({ ...optionalOk, [d.type]: e.target.checked })} className="w-[18px] h-[18px] mt-1 accent-primary" />
                <span>Optional. I agree to the {policyLink(d)}.</span>
              </label>
            ))}
          </fieldset>

          <div className="flex flex-wrap justify-between items-center gap-3">
            <Link href={backHref} className="text-sm font-semibold text-[#8A6420] dark:text-primary py-3">Back to trip</Link>
            <button type="submit" className="bg-primary text-white font-montserrat font-semibold text-[15px] px-8 py-4 rounded-2xl transition hover:-translate-y-0.5 hover:brightness-95 motion-reduce:transform-none">
              {termsOk || required.length === 0 ? "Continue to Payment" : "Accept the terms to continue"}
            </button>
          </div>
        </form>

        <aside className="flex-[1_1_340px] min-w-0 lg:sticky lg:top-[100px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md p-6 flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-raleway font-bold text-[15px] text-text-primary">{state.packageTitle}</span>
            <span className="text-xs text-gray-700 dark:text-gray-300">{matrix ? fmtDateRange(matrix.tour_start, matrix.tour_end) : ""} · <span className="capitalize">{state.choices.mode}</span></span>
          </div>
          {quote ? <QuoteSummary quote={quote} /> : <Spinner />}
          <p className="text-[11px] text-center text-gray-500 dark:text-gray-400">No promo codes. Core tickets are never discounted.</p>
        </aside>
      </div>
      <PolicyModal doc={openPolicy} onClose={() => setOpenPolicy(null)} />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="min-h-[60vh] flex flex-col gap-3 items-center justify-center p-6 text-center">{children}</main>;
}
