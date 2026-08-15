"use client";

/**
 * Option-based checkout for the flagship tour: /book?package=<id>
 *
 * Three steps on this page, confirmation on its own routes:
 *   1. Build your trip — hotel × occupancy, visa toggle, payment plan
 *   2. Your details    — contact info + policy acceptances
 *   3. Review & pay    — read-only recap → secure Paystack handoff
 *   (4. Confirmation   — /payment/callback → /payment/success)
 *
 * Every number on this page comes from GET /packages/<id>/pricing/ — the
 * frontend performs lookups, never money math. Totals are re-validated
 * server-side at checkout (409 → explicit re-confirm modal). Payment methods
 * (card / mobile money) are chosen on Paystack's hosted checkout — this page
 * never touches payment credentials.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetCurrentPoliciesQuery,
  useGetPackageDetailQuery,
  useGetPackagePricingQuery,
  type PolicyDoc,
  type PricingMatrix,
} from "@/lib/api/packagesApi";
import {
  useCheckoutMutation,
  useInitializePaymentMutation,
  type PaymentPlan,
} from "@/lib/api/bookingsApi";
import Countdown from "@/components/booking/Countdown";
import CheckoutProgress from "@/components/checkout/CheckoutProgress";
import {
  CheckoutSummaryCard,
  CheckoutSummaryCollapsible,
  summarize,
} from "@/components/checkout/CheckoutSummary";
import PayHandoffOverlay from "@/components/checkout/PayHandoffOverlay";
import Spinner from "@/components/ui/Spinner";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BedIcon,
  CheckIcon,
  CreditCardIcon,
  FileTextIcon,
  InfoIcon,
  LockIcon,
  PencilIcon,
  PlaneIcon,
  ShieldIcon,
  SmartphoneIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "@/components/ui/icons";
import { fmtMoney, fmtDate } from "@/lib/format";
import { savePendingBooking } from "@/lib/pendingBooking";
import { routeAfterInitialize } from "@/lib/payments/paystack";
import PaymentMethodPicker, {
  DEFAULT_PAYMENT_METHOD,
  paymentMethodDisabledReason,
  type PaymentMethodState,
} from "@/components/payments/PaymentMethodPicker";

type MatrixOption = PricingMatrix["options"][number];

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldErrors(form: ContactForm): Partial<Record<keyof ContactForm, string>> {
  const errors: Partial<Record<keyof ContactForm, string>> = {};
  if (!form.firstName.trim()) errors.firstName = "Please enter your first name.";
  if (!form.lastName.trim()) errors.lastName = "Please enter your last name.";
  if (!form.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(form.email)) errors.email = "That email address doesn't look right.";
  return errors;
}

// ── Form field ───────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, onBlur, error, required, type = "text",
  placeholder, autoComplete, inputMode, hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold font-open-sans text-text-primary mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full border rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 bg-white dark:bg-gray-900 outline-none transition-colors focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/40"
            : "border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/10"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-open-sans mt-1.5">
          <AlertTriangleIcon size={11} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-gray-400 dark:text-gray-500 font-open-sans mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Step 1: Build your trip ──────────────────────────────────────────────────

function StepBuildTrip({
  matrix, optionId, setOptionId, visa, setVisa, plan, setPlan, onExpire,
}: {
  matrix: PricingMatrix;
  optionId: string | null;
  setOptionId: (id: string) => void;
  visa: boolean;
  setVisa: (v: boolean) => void;
  plan: PaymentPlan;
  setPlan: (p: PaymentPlan) => void;
  onExpire: () => void;
}) {
  const currency = matrix.currency;
  const grouped = useMemo(() => {
    const hotels = new Map<string, MatrixOption[]>();
    for (const option of matrix.options) {
      const list = hotels.get(option.hotel_name) ?? [];
      list.push(option);
      hotels.set(option.hotel_name, list);
    }
    return [...hotels.entries()];
  }, [matrix.options]);

  return (
    <div>
      {matrix.early_bird.active && matrix.early_bird.deadline && (
        <div className="mb-7 bg-primary/[.06] border border-primary/25 rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-sm font-open-sans text-text-primary flex-1">
            <span className="font-bold">Early Bird pricing is live</span> — book now and your
            discounted price is locked in for 24 hours.
          </p>
          <p className="text-sm font-bold font-raleway text-primary shrink-0">
            Ends in{" "}
            <Countdown deadline={matrix.early_bird.deadline} serverNow={matrix.server_now} onExpire={onExpire} />
          </p>
        </div>
      )}

      <h2 className="flex items-center gap-2.5 text-lg font-bold font-raleway text-text-primary mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <BedIcon size={16} />
        </span>
        Choose your hotel &amp; room
      </h2>
      <div className="flex flex-col gap-6 mb-9" role="radiogroup" aria-label="Hotel and room options">
        {grouped.map(([hotel, options]) => (
          <div key={hotel}>
            <p className="text-sm font-bold font-raleway text-text-primary mb-3 flex items-center gap-1.5">
              {hotel}
              <span className="inline-flex items-center gap-px text-primary">
                {Array.from({ length: options[0]?.star_rating ?? 0 }, (_, i) => (
                  <StarIcon key={i} size={11} />
                ))}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option) => {
                const selected = optionId === option.id;
                return (
                  <button
                    key={option.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setOptionId(option.id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-white dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold font-open-sans text-text-primary">
                        {option.occupancy_display}
                      </span>
                      <span
                        aria-hidden
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selected ? "border-primary bg-primary text-white" : "border-gray-300 dark:border-gray-600 text-transparent"
                        }`}
                      >
                        <CheckIcon size={10} />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold font-raleway text-text-primary">
                        {fmtMoney(option.effective_price_per_person, currency)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">/person</span>
                    </div>
                    {option.early_bird_applied && (
                      <p className="text-xs font-open-sans mt-1">
                        <span className="line-through text-gray-400">
                          {fmtMoney(option.standard_price_per_person, currency)}
                        </span>{" "}
                        <span className="text-green-700 dark:text-green-400 font-semibold">
                          save {fmtMoney(option.saving_total, currency)}
                        </span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-1">
                      {option.guests_per_booking} guest{option.guests_per_booking > 1 ? "s" : ""} ·{" "}
                      {fmtMoney(option.effective_total, currency)} total
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {matrix.visa.enabled && (
        <>
          <h2 className="flex items-center gap-2.5 text-lg font-bold font-raleway text-text-primary mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PlaneIcon size={16} />
            </span>
            Visa service
          </h2>
          <label className="flex items-start gap-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-2 cursor-pointer hover:border-primary/50 transition-colors">
            <input
              type="checkbox"
              checked={visa}
              onChange={(e) => setVisa(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#bd8f3a]"
            />
            <span className="flex-1">
              <span className="text-sm font-semibold font-open-sans text-text-primary block">
                Add Visa on Arrival
                {matrix.visa.fee_per_guest && ` — ${fmtMoney(matrix.visa.fee_per_guest, currency)} per guest`}
              </span>
              {matrix.visa.info && (
                <span className="text-xs text-gray-500 dark:text-gray-400 font-open-sans block mt-1 whitespace-pre-line">
                  {matrix.visa.info}
                </span>
              )}
              <span className="text-xs text-amber-700 dark:text-amber-500 font-open-sans block mt-1 font-semibold">
                Visa fees are non-refundable once processed.
              </span>
            </span>
          </label>
        </>
      )}

      {matrix.installments.enabled && (
        <>
          <h2 className="flex items-center gap-2.5 text-lg font-bold font-raleway text-text-primary mt-9 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <CreditCardIcon size={16} />
            </span>
            How would you like to pay?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Payment plan">
            {([
              {
                key: "full" as const,
                title: "Pay in full",
                body: "One payment today. Done and dusted.",
              },
              {
                key: "installment" as const,
                title: `Secure with a deposit${matrix.installments.deposit_minimum ? ` — ${fmtMoney(matrix.installments.deposit_minimum, currency)}` : ""}`,
                body: `Confirmed once the deposit is received. Top up any time${matrix.installments.final_payment_deadline ? `; balance due by ${fmtDate(matrix.installments.final_payment_deadline)}` : ""}.`,
              },
            ]).map(({ key, title, body }) => (
              <button
                key={key}
                role="radio"
                aria-checked={plan === key}
                onClick={() => setPlan(key)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  plan === key ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                }`}
              >
                <p className="text-sm font-bold font-open-sans text-text-primary mb-1">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-open-sans">{body}</p>
              </button>
            ))}
          </div>
          {plan === "installment" && (
            <p className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-3 leading-relaxed">
              <InfoIcon size={12} className="mt-0.5 shrink-0" />
              Bookings not fully paid by the deadline may be cancelled and deposits forfeited under
              the cancellation policy — see the Installment Payment Policy at the next step.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── Step 2: Details + policies ───────────────────────────────────────────────

function StepDetails({
  form, setForm, policies, accepted, setAccepted, touched, setTouched, showAllErrors,
}: {
  form: ContactForm;
  setForm: (f: ContactForm) => void;
  policies: PolicyDoc[];
  accepted: Record<string, boolean>;
  setAccepted: (a: Record<string, boolean>) => void;
  touched: Record<string, boolean>;
  setTouched: (t: Record<string, boolean>) => void;
  showAllErrors: boolean;
}) {
  const [openPolicy, setOpenPolicy] = useState<PolicyDoc | null>(null);
  const errors = fieldErrors(form);
  const update = (key: keyof ContactForm, value: string) => setForm({ ...form, [key]: value });
  const touch = (key: string) => setTouched({ ...touched, [key]: true });
  const errorFor = (key: keyof ContactForm) =>
    showAllErrors || touched[key] ? (errors[key] ?? null) : null;

  return (
    <div>
      <h2 className="flex items-center gap-2.5 text-lg font-bold font-raleway text-text-primary mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <UserIcon size={16} />
        </span>
        Personal information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 mb-9">
        <Field
          id="firstName" label="First name" required value={form.firstName}
          onChange={(v) => update("firstName", v)} onBlur={() => touch("firstName")}
          error={errorFor("firstName")} placeholder="Ama" autoComplete="given-name"
        />
        <Field
          id="lastName" label="Last name" required value={form.lastName}
          onChange={(v) => update("lastName", v)} onBlur={() => touch("lastName")}
          error={errorFor("lastName")} placeholder="Mensah" autoComplete="family-name"
        />
        <Field
          id="email" label="Email address" required type="email" inputMode="email" value={form.email}
          onChange={(v) => update("email", v)} onBlur={() => touch("email")}
          error={errorFor("email")} placeholder="you@example.com" autoComplete="email"
          hint="Your booking confirmation and receipts go here."
        />
        <Field
          id="phone" label="Phone number" type="tel" inputMode="tel" value={form.phone}
          onChange={(v) => update("phone", v)}
          placeholder="+233 20 000 0000" autoComplete="tel"
        />
      </div>

      <h2 className="flex items-center gap-2.5 text-lg font-bold font-raleway text-text-primary mb-5">
        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <UsersIcon size={16} />
        </span>
        Traveller information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 mb-9">
        <Field
          id="country" label="Country of residence" value={form.country}
          onChange={(v) => update("country", v)} placeholder="Ghana" autoComplete="country-name"
        />
        <div className="md:col-span-2">
          <label htmlFor="specialRequests" className="block text-sm font-semibold font-open-sans text-text-primary mb-1.5">
            Special requests
          </label>
          <textarea
            id="specialRequests"
            rows={3}
            value={form.specialRequests}
            onChange={(e) => update("specialRequests", e.target.value)}
            placeholder="Dietary requirements, accessibility needs…"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 bg-white dark:bg-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors resize-none"
          />
        </div>
      </div>

      {policies.length > 0 && (
        <>
          <h2 className="flex items-center gap-2.5 text-lg font-bold font-raleway text-text-primary mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FileTextIcon size={16} />
            </span>
            Policies
          </h2>
          <div className="flex flex-col gap-3 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            {policies.map((doc) => (
              <label key={doc.type} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!accepted[doc.type]}
                  onChange={(e) => setAccepted({ ...accepted, [doc.type]: e.target.checked })}
                  className="mt-0.5 w-4 h-4 accent-[#bd8f3a]"
                />
                <span className="text-sm font-open-sans text-gray-700 dark:text-gray-300">
                  I accept the{" "}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setOpenPolicy(doc); }}
                    className="text-primary font-semibold hover:underline"
                  >
                    {doc.title}
                  </button>{" "}
                  <span className="text-xs text-gray-400">(v{doc.version})</span>
                </span>
              </label>
            ))}
            {showAllErrors && !policies.every((doc) => accepted[doc.type]) && (
              <p role="alert" className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-open-sans">
                <AlertTriangleIcon size={11} />
                Please accept all policies to continue.
              </p>
            )}
          </div>
        </>
      )}

      {openPolicy && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpenPolicy(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={openPolicy.title}
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 sm:p-8 content-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold font-raleway text-text-primary">
                {openPolicy.title} <span className="text-xs text-gray-400 font-open-sans">v{openPolicy.version}</span>
              </h3>
              <button onClick={() => setOpenPolicy(null)} aria-label="Close" className="text-gray-400 hover:text-text-primary p-1 -m-1">
                <XIcon size={16} />
              </button>
            </div>
            <div className="text-sm font-open-sans text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {openPolicy.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Review & pay ─────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm font-open-sans">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="font-semibold text-text-primary text-right">{value}</span>
    </div>
  );
}

function ReviewSection({
  title, icon, onEdit, children,
}: {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold font-raleway text-text-primary">
          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{icon}</span>
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-semibold font-open-sans text-primary hover:underline"
        >
          <PencilIcon size={11} />
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function StepReview({
  matrix, option, visa, plan, form, error, goTo, payMethod, setPayMethod,
}: {
  matrix: PricingMatrix;
  option: MatrixOption;
  visa: boolean;
  plan: PaymentPlan;
  form: ContactForm;
  error: string | null;
  goTo: (step: number) => void;
  payMethod: PaymentMethodState;
  setPayMethod: (m: PaymentMethodState) => void;
}) {
  const currency = matrix.currency;
  const { total, dueToday } = summarize(matrix, option, visa, plan);

  return (
    <div>
      <h2 className="text-lg font-bold font-raleway text-text-primary mb-1.5">Review your booking</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-open-sans mb-6">
        A quick check before payment — nothing is charged yet.
      </p>

      <div className="flex flex-col gap-4">
        <ReviewSection title="Your trip" icon={<BedIcon size={14} />} onEdit={() => goTo(1)}>
          <ReviewRow label="Hotel" value={`${option.hotel_name} (${option.star_rating}-star)`} />
          <ReviewRow label="Room" value={option.occupancy_display} />
          <ReviewRow label="Guests" value={String(option.guests_per_booking)} />
          {matrix.visa.enabled && <ReviewRow label="Visa on Arrival" value={visa ? "Added" : "Not added"} />}
        </ReviewSection>

        <ReviewSection title="Lead guest" icon={<UserIcon size={14} />} onEdit={() => goTo(2)}>
          <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`.trim()} />
          <ReviewRow label="Email" value={form.email} />
          {form.phone && <ReviewRow label="Phone" value={form.phone} />}
          {form.country && <ReviewRow label="Country" value={form.country} />}
        </ReviewSection>

        <ReviewSection title="Payment" icon={<CreditCardIcon size={14} />} onEdit={() => goTo(1)}>
          <ReviewRow
            label="Plan"
            value={plan === "installment" ? "Deposit now, balance later" : "Pay in full"}
          />
          <ReviewRow label="Total" value={fmtMoney(total, currency)} />
          <ReviewRow label="Due today" value={fmtMoney(dueToday, currency)} />
          {matrix.charge.exchange_rate && matrix.charge.currency !== currency && (
            <p className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-open-sans mt-1">
              <InfoIcon size={12} className="mt-0.5 shrink-0" />
              Paystack Ghana charges in {matrix.charge.currency}. Today that&apos;s about{" "}
              {fmtMoney(dueToday * parseFloat(matrix.charge.exchange_rate), matrix.charge.currency)} —
              the exact amount is shown before you confirm.
            </p>
          )}
        </ReviewSection>

        {/* Payment method — chosen HERE: Mobile Money pushes the approve-prompt
            straight to the phone (no redirect); card opens Paystack's secure
            popup with a hosted-page fallback. */}
        <section className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 bg-gray-50/60 dark:bg-gray-800/40">
          <h3 className="text-sm font-bold font-raleway text-text-primary mb-3">How would you like to pay?</h3>
          <PaymentMethodPicker value={payMethod} onChange={setPayMethod} />
          <p className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 font-open-sans leading-relaxed mt-4">
            <ShieldIcon size={13} className="mt-0.5 shrink-0 text-primary" />
            Payments are processed by Paystack&apos;s encrypted gateway.
            We never see or store your card or mobile money details.
          </p>
        </section>
      </div>

      {error && (
        <div role="alert" className="mt-5 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5 content-in">
          <AlertTriangleIcon size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm font-open-sans text-red-700 dark:text-red-300">
            <p className="font-semibold mb-0.5">We couldn&apos;t start your payment</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Price-changed modal (early bird expired mid-checkout / 409) ──────────────

function PriceChangedModal({
  message, newTotal, currency, onConfirm,
}: {
  message: string;
  newTotal: string | null;
  currency: string;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div role="alertdialog" aria-modal="true" className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-8 text-center content-in">
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <InfoIcon size={24} />
        </div>
        <h3 className="text-lg font-bold font-raleway text-text-primary mb-2">Pricing has updated</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans mb-2">{message}</p>
        {newTotal && (
          <p className="text-base font-bold font-raleway text-primary mb-4">
            New total: {fmtMoney(newTotal, currency)}
          </p>
        )}
        <button
          onClick={onConfirm}
          className="w-full bg-primary text-white py-3 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors"
        >
          Review updated pricing
        </button>
      </div>
    </div>
  );
}

// ── Skeleton while pricing loads ─────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-6xl mx-auto animate-pulse" aria-busy>
      <div className="h-7 w-72 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
      <div className="h-4 w-44 bg-gray-100 dark:bg-gray-800 rounded mb-8" />
      <div className="h-6 w-80 bg-gray-100 dark:bg-gray-800 rounded mb-10" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="flex flex-col gap-4">
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        </div>
        <div className="hidden lg:block h-80 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    </main>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function BookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = searchParams.get("package") ?? "";

  const { data: pkg } = useGetPackageDetailQuery(packageId, { skip: !packageId });
  const {
    data: matrix, isLoading, isError, refetch,
  } = useGetPackagePricingQuery(packageId, { skip: !packageId });
  const { data: policies = [] } = useGetCurrentPoliciesQuery();

  const [step, setStep] = useState(1);
  const [optionId, setOptionId] = useState<string | null>(searchParams.get("option"));
  const [visa, setVisa] = useState(false);
  const [plan, setPlan] = useState<PaymentPlan>("full");
  const [form, setForm] = useState<ContactForm>({
    firstName: "", lastName: "", email: "", phone: "", country: "", specialRequests: "",
  });
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payPhase, setPayPhase] = useState<"creating" | "redirecting" | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethodState>(DEFAULT_PAYMENT_METHOD);
  const [priceChanged, setPriceChanged] = useState<{ message: string; total: string | null } | null>(null);

  const [checkout] = useCheckoutMutation();
  const [initializePayment] = useInitializePaymentMutation();
  const isPaying = payPhase !== null;

  // Refetch pricing when the tab wakes up — countdown + prices stay honest
  // after laptop sleep.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") refetch(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  const handleEarlyBirdExpiry = useCallback(() => {
    refetch();
    setPriceChanged({
      message: "The Early Bird offer has ended while you were on this page. Standard pricing now applies.",
      total: null,
    });
  }, [refetch]);

  const option = useMemo(
    () => matrix?.options.find((candidate) => candidate.id === optionId) ?? null,
    [matrix, optionId],
  );

  const goTo = useCallback((n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!packageId) {
    return (
      <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-700 dark:text-gray-300 font-open-sans text-sm">
          No tour selected.{" "}
          <button onClick={() => router.push("/destinations")} className="text-primary underline">Browse tours</button>
        </p>
      </main>
    );
  }

  if (isLoading || !matrix) {
    if (isError) {
      return (
        <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
          <p className="text-gray-700 dark:text-gray-300 font-open-sans text-sm">
            Failed to load pricing.{" "}
            <button onClick={() => refetch()} className="text-primary underline">Retry</button>
          </p>
        </main>
      );
    }
    return <CheckoutSkeleton />;
  }

  const requiredAccepted = policies.every((doc) => accepted[doc.type]);
  const detailsValid = Object.keys(fieldErrors(form)).length === 0 && requiredAccepted;
  const { dueToday } = summarize(matrix, option, visa, plan);

  // ── Step CTA ──
  const ctaLabel =
    step === 1
      ? "Continue to your details"
      : step === 2
        ? "Review your booking"
        : `Pay ${option ? fmtMoney(dueToday, matrix.currency) : ""} securely`;
  const payMethodProblem = paymentMethodDisabledReason(payMethod);
  const ctaDisabled =
    isPaying ||
    (step === 1 && !option) ||
    (step === 3 && (!detailsValid || !!payMethodProblem));
  const ctaHint =
    step === 1 && !option
      ? "Select a room to continue"
      : step === 3 && payMethodProblem
        ? payMethodProblem
        : null;

  const handleCta = async () => {
    if (isPaying) return;
    if (step === 1) {
      if (option) goTo(2);
      return;
    }
    if (step === 2) {
      if (!detailsValid) {
        setShowAllErrors(true);
        return;
      }
      setShowAllErrors(false);
      goTo(3);
      return;
    }
    // Step 3 — create booking + hand off to Paystack.
    if (!option || !detailsValid) return;
    setError(null);
    setPayPhase("creating");

    const visaTotal =
      visa && matrix.visa.fee_per_guest
        ? parseFloat(matrix.visa.fee_per_guest) * option.guests_per_booking
        : 0;
    const expectedTotal = (parseFloat(option.effective_total) + visaTotal).toFixed(2);

    try {
      const booking = await checkout({
        option_id: option.id,
        visa,
        payment_plan: plan,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        country: form.country || undefined,
        special_requests: form.specialRequests || undefined,
        accepted_policies: policies.filter((doc) => accepted[doc.type]).map((doc) => doc.type),
        expected_total: expectedTotal,
      }).unwrap();

      savePendingBooking({
        bookingId: booking.id,
        reference: booking.reference,
        email: form.email,
        packageTitle: pkg?.title ?? "your tour",
        amountDueToday: booking.amount_due_today,
        currency: booking.currency,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      const payment = await initializePayment({
        booking_id: booking.id,
        intent: plan === "installment" ? "deposit" : "balance",
        channel: payMethod.channel,
        ...(payMethod.channel === "momo"
          ? { momo_phone: payMethod.momoPhone, momo_provider: payMethod.momoProvider || undefined }
          : {}),
      }).unwrap();
      setPayPhase("redirecting");
      // MoMo: the approve-prompt is already on their phone → straight to the
      // polling page. Card: Paystack's popup opens here (hosted fallback).
      await routeAfterInitialize(payment, (reference) =>
        router.push(`/payment/callback?reference=${reference}`),
      );
    } catch (err: unknown) {
      setPayPhase(null);
      const e = err as { status?: number; data?: { detail?: string; quote?: { total?: string } } };
      if (e.status === 409) {
        refetch();
        setPriceChanged({
          message: e.data?.detail ?? "The price has changed since this page was loaded.",
          total: e.data?.quote?.total ?? null,
        });
        return;
      }
      setError(e.data?.detail ?? "Something went wrong on our side. You have not been charged — please try again.");
    }
  };

  const ctaButton = (
    <button
      onClick={handleCta}
      disabled={ctaDisabled}
      aria-label={ctaLabel}
      className="w-full bg-primary text-white py-3.5 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {isPaying && <Spinner className="w-4 h-4 text-white" />}
      {step === 3 && !isPaying && <LockIcon size={14} />}
      {ctaHint ?? ctaLabel}
    </button>
  );

  return (
    <main className="w-full px-4 md:px-10 mt-24 py-8 max-w-6xl mx-auto pb-28 lg:pb-10">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/tour/${packageId}`)}
          className="flex items-center gap-1.5 text-sm font-semibold font-open-sans text-gray-500 dark:text-gray-400 hover:text-text-primary transition-colors mb-3"
        >
          <ArrowLeftIcon size={14} />
          Back to tour
        </button>
        <h1 className="text-2xl md:text-[28px] font-bold font-raleway text-text-primary">
          {pkg?.title ?? "Book your trip"}
        </h1>
      </div>

      <div className="mb-8">
        <CheckoutProgress current={step} onStepClick={goTo} />
      </div>

      {/* Mobile summary */}
      <div className="lg:hidden mb-6">
        <CheckoutSummaryCollapsible pkg={pkg} matrix={matrix} option={option} visa={visa} plan={plan} />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 xl:gap-14 lg:items-start">
        {/* Steps — keyed so each transition is a calm fade */}
        <div key={step} className="content-in">
          {step === 1 && (
            <StepBuildTrip
              matrix={matrix}
              optionId={optionId}
              setOptionId={setOptionId}
              visa={visa}
              setVisa={setVisa}
              plan={plan}
              setPlan={setPlan}
              onExpire={handleEarlyBirdExpiry}
            />
          )}
          {step === 2 && (
            <StepDetails
              form={form}
              setForm={setForm}
              policies={policies}
              accepted={accepted}
              setAccepted={setAccepted}
              touched={touched}
              setTouched={setTouched}
              showAllErrors={showAllErrors}
            />
          )}
          {step === 3 && option && (
            <StepReview
              matrix={matrix}
              option={option}
              visa={visa}
              plan={plan}
              form={form}
              error={error}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
              goTo={goTo}
            />
          )}

          {step > 1 && (
            <button
              onClick={() => goTo(step - 1)}
              className="mt-6 text-sm font-semibold font-open-sans text-gray-500 dark:text-gray-400 hover:text-text-primary transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftIcon size={14} />
              Back to {step === 2 ? "trip options" : "your details"}
            </button>
          )}
        </div>

        {/* Desktop summary */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <CheckoutSummaryCard
            pkg={pkg}
            matrix={matrix}
            option={option}
            visa={visa}
            plan={plan}
            cta={ctaButton}
          />
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          {option && (
            <div className="shrink-0">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-open-sans leading-tight">Due today</p>
              <p className="text-[15px] font-bold font-raleway text-text-primary leading-tight">
                {fmtMoney(dueToday, matrix.currency)}
              </p>
            </div>
          )}
          <div className="flex-1">{ctaButton}</div>
        </div>
      </div>

      {isPaying && <PayHandoffOverlay phase={payPhase!} />}

      {priceChanged && (
        <PriceChangedModal
          message={priceChanged.message}
          newTotal={priceChanged.total}
          currency={matrix.currency}
          onConfirm={() => { setPriceChanged(null); goTo(1); }}
        />
      )}
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <BookContent />
    </Suspense>
  );
}
