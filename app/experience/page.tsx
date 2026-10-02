"use client";

/**
 * Core-tour + add-ons checkout (Michael Blackson style): /experience?package=<id>
 *
 * A mandatory Core Tour is always in the cart; the guest picks one hotel
 * (single-select) and any experiences (multi-select). The live total mirrors
 * the server's non-stacking bundle-discount engine (highest qualifying rule) —
 * the backend re-validates via expected_total at checkout.
 */

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetConfigurableMatrixQuery,
  useGetPackageDetailQuery,
  useGetCurrentPoliciesQuery,
  type ConfigurableAddon,
  type PolicyDoc,
} from "@/lib/api/packagesApi";
import RefundTiersTable from "@/components/booking/RefundTiersTable";
import PolicyModal from "@/components/booking/PolicyModal";
import {
  useConfigurableCheckoutMutation,
  useInitializePaymentMutation,
  type PaymentPlan,
} from "@/lib/api/bookingsApi";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import { savePendingBooking } from "@/lib/pendingBooking";
import Spinner from "@/components/ui/Spinner";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactForm {
  firstName: string; lastName: string; email: string; phone: string; country: string; specialRequests: string;
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ExperienceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package") ?? "";

  const { data: pkg } = useGetPackageDetailQuery(packageId, { skip: !packageId });
  const { data: matrix, isLoading } = useGetConfigurableMatrixQuery(packageId, { skip: !packageId });
  const { data: allPolicies = [] } = useGetCurrentPoliciesQuery();
  const policies = useMemo(() => allPolicies.filter((d) => d.is_required), [allPolicies]);
  const optionalPolicies = useMemo(() => allPolicies.filter((d) => !d.is_required), [allPolicies]);

  const [numGuests, setNumGuests] = useState(1);
  const [plan, setPlan] = useState<PaymentPlan>("full");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [seeded, setSeeded] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    firstName: "", lastName: "", email: "", phone: "", country: "", specialRequests: "",
  });
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [openPolicy, setOpenPolicy] = useState<PolicyDoc | null>(null);
  // Installment Policy: initial payment may be anything from the deposit up to the total.
  const [initialExtra, setInitialExtra] = useState("");
  const [payPhase, setPayPhase] = useState<null | "creating" | "redirecting">(null);
  const [error, setError] = useState<string | null>(null);

  const [configurableCheckout] = useConfigurableCheckoutMutation();
  const [initializePayment] = useInitializePaymentMutation();

  // Seed default selections (e.g. the $0 "No Hotel") once the matrix loads.
  if (matrix && !seeded) {
    const defaults = new Set<string>();
    matrix.addon_groups.forEach((g) => g.addons.forEach((a) => { if (a.is_default) defaults.add(a.code); }));
    matrix.ungrouped_addons.forEach((a) => { if (a.is_default) defaults.add(a.code); });
    setSelected(defaults);
    setSeeded(true);
  }

  const allAddons = useMemo(() => {
    const map = new Map<string, ConfigurableAddon>();
    matrix?.addon_groups.forEach((g) => g.addons.forEach((a) => map.set(a.code, a)));
    matrix?.ungrouped_addons.forEach((a) => map.set(a.code, a));
    return map;
  }, [matrix]);

  const pricing = useMemo(() => {
    const currency = matrix?.currency ?? pkg?.currency ?? "USD";
    const basePP = parseFloat(matrix?.base_price_per_person ?? pkg?.base_price_per_person ?? "0");
    const baseTotal = basePP * numGuests;
    const lines: { label: string; amount: number }[] = [];
    let addonsTotal = 0;
    selected.forEach((code) => {
      const a = allAddons.get(code);
      if (!a) return;
      const qty = a.unit === "per_person" ? numGuests : 1;
      const amt = parseFloat(a.price) * qty;
      if (amt > 0) lines.push({ label: `${a.name}${qty > 1 ? ` × ${qty}` : ""}`, amount: amt });
      addonsTotal += amt;
    });
    // A single-select group with a $0 default (e.g. "No Hotel") still gets a
    // line so the customer sees their hotel choice at checkout.
    matrix?.addon_groups.forEach((g) => {
      if (g.selection !== "single") return;
      const chosen = g.addons.find((a) => selected.has(a.code));
      if (chosen && parseFloat(chosen.price) === 0) lines.push({ label: chosen.name, amount: 0 });
    });
    const subtotal = baseTotal + addonsTotal;
    // Highest qualifying discount (non-stacking) — mirrors the backend.
    let bestPercent = 0, note = "";
    (matrix?.discount_rules ?? []).forEach((r) => {
      const req = r.required_addons;
      if (req.length && req.every((c) => selected.has(c)) && parseFloat(r.percent) > bestPercent) {
        bestPercent = parseFloat(r.percent); note = r.name;
      }
    });
    const discount = +(subtotal * (bestPercent / 100)).toFixed(2);
    const total = +(subtotal - discount).toFixed(2);
    const depositMin = parseFloat(matrix?.installments.deposit_minimum ?? "0");
    // Mirrors the server: per traveller = the minimum for each guest, each
    // capped at their share of the total; per booking = one capped minimum.
    const deposit =
      matrix?.installments.deposit_unit === "per_traveller"
        ? Math.min(depositMin, +(total / numGuests).toFixed(2)) * numGuests
        : Math.min(depositMin, total);
    const dueToday = plan === "installment" ? +deposit.toFixed(2) : total;
    return { currency, basePP, baseTotal, lines, subtotal, bestPercent, note, discount, total, deposit: +deposit.toFixed(2), dueToday };
  }, [matrix, pkg, numGuests, selected, allAddons, plan]);

  const toggleSingle = (groupCodes: string[], code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      groupCodes.forEach((c) => next.delete(c));
      next.add(code);
      return next;
    });
  };
  const toggleMulti = (code: string) => {
    setSelected((prev) => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; });
  };

  const requiredAccepted = policies.every((doc) => accepted[doc.type]);
  const contactValid = form.firstName.trim() && form.lastName.trim() && EMAIL_RE.test(form.email);
  const canPay = !!contactValid && requiredAccepted && payPhase === null;
  const dueNow =
    plan === "installment" && parseFloat(initialExtra) > pricing.deposit
      ? Math.min(parseFloat(initialExtra), pricing.total)
      : pricing.dueToday;

  if (!packageId) return <Center>No experience selected.</Center>;
  if (isLoading || !matrix) return <Center><Spinner /></Center>;
  if (matrix.pricing_model !== "core_plus_addons") return <Center>This tour uses a different booking flow.</Center>;

  const installmentsEnabled = matrix.installments.enabled;

  const handlePay = async () => {
    if (!canPay) return;
    setError(null); setPayPhase("creating");
    try {
      const booking = await configurableCheckout({
        package_id: packageId,
        num_guests: numGuests,
        selected_addon_codes: Array.from(selected),
        payment_plan: plan,
        first_name: form.firstName, last_name: form.lastName, email: form.email,
        phone: form.phone || undefined, country: form.country || undefined,
        special_requests: form.specialRequests || undefined,
        accepted_policies: allPolicies.filter((d) => accepted[d.type]).map((d) => d.type),
        expected_total: pricing.total.toFixed(2),
      }).unwrap();

      savePendingBooking({
        bookingId: booking.id, reference: booking.reference, email: form.email,
        packageTitle: pkg?.title ?? "your experience", amountDueToday: booking.amount_due_today,
        currency: booking.currency, expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      });

      const customInitial = plan === "installment" && parseFloat(initialExtra) > pricing.deposit
        ? Math.min(parseFloat(initialExtra), pricing.total).toFixed(2)
        : null;
      const payment = await initializePayment({
        booking_id: booking.id,
        ...(customInitial
          ? { intent: "custom" as const, amount: customInitial }
          : { intent: plan === "installment" ? ("deposit" as const) : ("balance" as const) }),
        channel: "any", // Paystack's popup collects the method, network and number
      }).unwrap();
      setPayPhase("redirecting");
      await routeAfterInitialize(payment, (ref) => router.push(`/payment/callback?reference=${ref}`));
    } catch (err: unknown) {
      setPayPhase(null);
      const e = err as { status?: number; data?: { detail?: string } };
      setError(e.data?.detail ?? "Something went wrong. You have not been charged — please try again.");
    }
  };

  return (
    <main className="w-full px-4 md:px-10 mt-24 py-8 max-w-6xl mx-auto pb-16">
      <h1 className="text-2xl font-bold font-raleway text-text-primary mb-1">{pkg?.title ?? "Build your experience"}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans mb-8">
        Your Core Tour is included. Add a hotel and experiences to personalise it — discounts apply automatically.
      </p>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="flex flex-col gap-8">
          {/* Guests */}
          <section>
            <h2 className="text-lg font-bold font-raleway text-text-primary mb-3">Guests</h2>
            <div className="inline-flex items-center gap-4 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
              <button onClick={() => setNumGuests((n) => Math.max(1, n - 1))} className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none">−</button>
              <span className="w-8 text-center font-bold">{numGuests}</span>
              <button onClick={() => setNumGuests((n) => n + 1)} className="w-8 h-8 rounded-full border border-gray-300 text-lg leading-none">+</button>
            </div>
          </section>

          {/* Core */}
          <section className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold font-raleway text-text-primary">Core Tour <span className="text-xs text-primary">· included</span></p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{money(pricing.currency, pricing.basePP)} / person</p>
              </div>
              <span className="text-sm font-semibold">{money(pricing.currency, pricing.baseTotal)}</span>
            </div>
          </section>

          {/* Groups */}
          {matrix.addon_groups.map((g) => {
            const groupCodes = g.addons.map((a) => a.code);
            return (
              <section key={g.id}>
                <h2 className="text-lg font-bold font-raleway text-text-primary mb-3">
                  {g.name}{g.selection === "single" ? " · pick one" : " · pick any"}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {g.addons.map((a) => {
                    const isSel = selected.has(a.code);
                    const price = parseFloat(a.price);
                    return (
                      <label key={a.code} className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${isSel ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700"}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type={g.selection === "single" ? "radio" : "checkbox"}
                            name={g.selection === "single" ? `group-${g.id}` : undefined}
                            checked={isSel}
                            onChange={() => g.selection === "single" ? toggleSingle(groupCodes, a.code) : toggleMulti(a.code)}
                            className="accent-primary w-4 h-4"
                          />
                          <div>
                            <p className="text-sm font-semibold font-open-sans text-text-primary">{a.name}</p>
                            {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                          </div>
                        </div>
                        <span className="text-sm font-semibold shrink-0">
                          {price === 0 ? "Free" : `${money(pricing.currency, price)}${a.unit === "per_person" ? " /person" : ""}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold font-raleway text-text-primary mb-3">Your details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="fn" label="First name" required value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Field id="ln" label="Last name" required value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              <Field id="em" label="Email" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field id="ph" label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field id="co" label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-open-sans">
              We use these details to manage your booking and payments. See how in our{" "}
              <Link href="/privacy-policy" className="text-primary underline">Privacy Policy</Link>.
            </p>
          </section>

          {/* Policies — the cancellation schedule and the full policy text
              are shown HERE, before payment, and acceptance is required. */}
          {(policies.length > 0 || (pkg?.refund_tiers?.length ?? 0) > 0) && (
            <section>
              <h2 className="text-lg font-bold font-raleway text-text-primary mb-3">Booking terms</h2>
              {(pkg?.refund_tiers?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold font-open-sans text-text-primary mb-2">Cancellation &amp; refunds</p>
                  <RefundTiersTable tiers={pkg!.refund_tiers} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {policies.map((doc) => (
                  <label key={doc.type} className="flex items-start gap-2.5 text-sm font-open-sans text-gray-700 dark:text-gray-300">
                    <input type="checkbox" checked={!!accepted[doc.type]} onChange={(e) => setAccepted({ ...accepted, [doc.type]: e.target.checked })} className="accent-primary w-4 h-4 mt-0.5" />
                    <span>
                      {doc.type === "terms"
                        ? "I have read and agree to the "
                        : doc.type === "privacy"
                        ? "I have read the "
                        : "I accept the "}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setOpenPolicy(doc); }}
                        className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80"
                      >
                        {doc.title}
                      </button>
                      <span className="text-xs text-gray-400"> v{doc.version}</span>
                      {doc.type === "terms" && (
                        <span>, including the installment deadlines and the cancellation and refund policy. I confirm the traveller information is accurate and that I am authorised to book for the travellers listed.</span>
                      )}
                      {doc.type === "privacy" && <span>, which explains how my booking information is used.</span>}
                    </span>
                  </label>
                ))}
              </div>

              {optionalPolicies.length > 0 && (
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">Optional — your booking is unaffected either way.</p>
                  {optionalPolicies.map((doc) => (
                    <label key={doc.type} className="flex items-start gap-2.5 text-sm font-open-sans text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={!!accepted[doc.type]} onChange={(e) => setAccepted({ ...accepted, [doc.type]: e.target.checked })} className="accent-primary w-4 h-4 mt-0.5" />
                      <span>
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setOpenPolicy(doc); }}
                          className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80"
                        >
                          {doc.title}
                        </button>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Payment method + plan */}
          <section>
            <h2 className="text-lg font-bold font-raleway text-text-primary mb-3">How would you like to pay?</h2>
            {installmentsEnabled && (
              <div className="flex gap-3 mb-4">
                {(["full", "installment"] as PaymentPlan[]).map((p) => (
                  <button key={p} onClick={() => setPlan(p)} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold ${plan === p ? "border-primary bg-primary/5 text-primary" : "border-gray-200 dark:border-gray-700"}`}>
                    {p === "full" ? "Pay in full" : `Pay initial ${money(pricing.currency, pricing.deposit)}`}
                  </button>
                ))}
              </div>
            )}
            {installmentsEnabled && plan === "installment" && (
              <div className="mb-3">
                <label className="block text-xs font-semibold font-open-sans text-text-primary mb-1.5">
                  Pay more now? <span className="text-gray-400 font-normal">(optional — minimum {money(pricing.currency, pricing.deposit)}, up to the total)</span>
                </label>
                <input
                  type="number" min={pricing.deposit} max={pricing.total} step="0.01"
                  value={initialExtra} onChange={(e) => setInitialExtra(e.target.value)}
                  placeholder={money(pricing.currency, pricing.deposit)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary outline-none focus:border-primary bg-white dark:bg-gray-900"
                />
              </div>
            )}
            {matrix.notices?.fees && (
              <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans mb-2">{matrix.notices.fees}</p>
            )}
            {installmentsEnabled && matrix.installments.final_payment_deadline && (
              <p className="text-xs text-gray-600 dark:text-gray-300 font-open-sans mb-2">
                Balance due in full by{" "}
                <span className="font-semibold text-text-primary">
                  {new Date(matrix.installments.final_payment_deadline + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>{" "}
                (23:59 Accra time). Extra payments any time before then don&apos;t change this date —
                see the{" "}
                <Link href="/installment-policy" className="text-primary underline">Installment Policy</Link>.
              </p>
            )}
            {!installmentsEnabled && matrix.installments.deposit_minimum && (
              <p className="text-xs text-amber-700 dark:text-amber-500 font-open-sans mb-2">
                The final payment deadline has passed — bookings are now payable in full.
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">
              You&apos;ll choose Card or Mobile Money (network and number) in Paystack&apos;s secure popup.
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24 h-fit">
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <h3 className="font-bold font-raleway text-text-primary mb-4">Order summary</h3>
            <div className="flex flex-col gap-2 text-sm font-open-sans">
              <Row label={`Core Tour × ${numGuests}`} value={money(pricing.currency, pricing.baseTotal)} />
              {pricing.lines.map((l, i) => <Row key={i} label={l.label} value={money(pricing.currency, l.amount)} />)}
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <Row label="Subtotal" value={money(pricing.currency, pricing.subtotal)} muted />
              {pricing.discount > 0 && (
                <Row label={`${pricing.note} (${pricing.bestPercent}%)`} value={`− ${money(pricing.currency, pricing.discount)}`} green />
              )}
              <div className="flex justify-between font-bold text-base text-text-primary pt-1">
                <span>Total</span><span>{money(pricing.currency, pricing.total)}</span>
              </div>
              {plan === "installment" && (
                <>
                  <Row label="Due today" value={money(pricing.currency, dueNow)} />
                  <Row label="Balance after this payment" value={money(pricing.currency, Math.max(0, pricing.total - dueNow))} muted />
                </>
              )}
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

            <button
              onClick={handlePay}
              disabled={!canPay}
              className="mt-5 w-full bg-primary text-white py-3.5 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {payPhase && <Spinner className="w-4 h-4 text-white" />}
              {payPhase ? "Securing…" : `Pay ${money(pricing.currency, dueNow)}`}
            </button>
            <p className="mt-2 text-[11px] text-center text-gray-500">Secured by Paystack · charged in GHS at the live rate</p>
          </div>
        </aside>
      </div>

      <PolicyModal doc={openPolicy} onClose={() => setOpenPolicy(null)} />
    </main>
  );
}

function Row({ label, value, muted, green }: { label: string; value: string; muted?: boolean; green?: boolean }) {
  return (
    <div className={`flex justify-between ${green ? "text-green-700 dark:text-green-400" : muted ? "text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
      <span className="pr-2">{label}</span><span className="shrink-0">{value}</span>
    </div>
  );
}

function Field({ id, label, value, onChange, required, type = "text" }: {
  id: string; label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold font-open-sans text-text-primary mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input id={id} type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="w-full px-4 mt-24 py-20 flex items-center justify-center min-h-[40vh] text-sm text-gray-600 dark:text-gray-300">{children}</main>;
}

export default function ExperiencePage() {
  return <Suspense fallback={<Center><Spinner /></Center>}><ExperienceContent /></Suspense>;
}
