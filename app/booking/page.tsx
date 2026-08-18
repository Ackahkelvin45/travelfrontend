"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetPackageDetailQuery } from "@/lib/api/packagesApi";
import {
 useCreateBookingMutation,
 useInitializePaymentMutation,
 type PriceTier,
} from "@/lib/api/bookingsApi";

const STEPS = [
 { id: 1, label: "Booking Details" },
 { id: 2, label: "Your Details" },
];


function fmt(amount: number, currency: string) {
 return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// -- Stepper ------------------------------------------------------------------

function Stepper({ current }: { current: number }) {
 return (
 <div className="flex items-center justify-center mb-12">
 {STEPS.map((step, idx) => {
 const done = current > step.id;
 const active = current === step.id;
 return (
 <div key={step.id} className="flex items-center">
 <div className="flex flex-col items-center gap-2">
 <div
 className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-raleway transition-colors ${
 done || active
 ? "bg-primary text-white"
 : "bg-white border-2 border-gray-300 dark:text-gray-300"
 }`}
 >
 {step.id}
 </div>
 <span
 className={`text-xs font-open-sans font-semibold ${
 done || active ? "text-primary" : "text-gray-700"
 }`}
 >
 {step.label}
 </span>
 </div>
 {idx < STEPS.length - 1 && (
 <div
 className={`w-40 h-0.5 mb-5 mx-2 transition-colors ${
 current > step.id ? "bg-primary" : "bg-gray-200"
 }`}
 />
 )}
 </div>
 );
 })}
 </div>
 );
}

// -- Order Summary -------------------------------------------------------------

interface SummaryProps {
  imageUrl: string;
  title: string;
  tiers: { tier: PriceTier; label: string; price: number }[];
  counts: number[];
  currency: string;
  availableFrom?: string;
  availableTo?: string;
  onNext: () => void;
  nextLabel: string;
  isLoading?: boolean;
}

function fmtDate(iso: string) {
  if (!iso) return "Not selected";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function OrderSummary({
  imageUrl,
  title,
  tiers,
  counts,
  currency,
  availableFrom,
  availableTo,
  onNext,
  nextLabel,
  isLoading,
}: SummaryProps) {
  const lineItems = tiers.filter((_, i) => counts[i] > 0);
  const total = tiers.reduce((sum, t, i) => sum + t.price * counts[i], 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 w-full">
      <p className="text-lg font-bold font-raleway text-text-primary mb-5">Your Booking Overview</p>

      <div className="flex gap-4 mb-6">
        <img src={imageUrl} alt={title} className="w-20 h-16 rounded-xl object-cover shrink-0" />
        <p className="text-sm font-bold font-raleway text-text-primary leading-snug">{title}</p>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {lineItems.length > 0 ? (
          lineItems.map((t, _) => {
            const i = tiers.findIndex((x) => x.tier === t.tier);
            return (
              <div key={t.tier} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold font-raleway text-text-primary shrink-0">
                    {counts[i]}
                  </span>
                  <span className="text-sm font-open-sans text-gray-700">
                    {t.label}{" "}
                    <span className="text-gray-700">({fmt(t.price, currency)}/person)</span>
                  </span>
                </div>
                <span className="text-sm font-semibold font-open-sans text-text-primary shrink-0">
                  {fmt(t.price * counts[i], currency)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 font-open-sans">No tickets selected yet.</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-50">
        <span className="text-sm font-open-sans text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-700">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Validity
        </span>
        <span className="text-sm font-semibold font-open-sans text-text-primary">
          {availableFrom && availableTo 
            ? `${fmtDate(availableFrom)} - ${fmtDate(availableTo)}`
            : availableFrom ? fmtDate(availableFrom) : "N/A"}
        </span>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center mb-5">
        <span className="text-base font-bold font-raleway text-text-primary">Total Price</span>
        <span className="text-xl font-bold font-raleway text-primary">{fmt(total, currency)}</span>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full bg-primary text-white py-3.5 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {nextLabel}
      </button>
    </div>
  );
}

interface Step1Props {
  tiers: { tier: PriceTier; label: string; price: number }[];
  counts: number[];
  adjust: (i: number, delta: number) => void;
  travelDate: string;
  setTravelDate: (date: string) => void;
  availableFrom?: string;
  availableTo?: string;
  currency: string;
  imageUrl: string;
  title: string;
  onNext: () => void;
  departures?: { date: string; is_full: boolean; seats_left: number | null }[];
  isDayTour?: boolean;
}

// --- Step 1 - Booking Details ---
function StepBookingDetails({
  tiers,
  counts,
  adjust,
  travelDate,
  setTravelDate,
  availableFrom,
  availableTo,
  currency,
  imageUrl,
  title,
  onNext,
  departures = [],
  isDayTour = false,
}: Step1Props) {
  const hasTickets = counts.some((c) => c > 0);
  const isValid = hasTickets && travelDate;
  const bookableDepartures = departures.filter((d) => !d.is_full);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Left */}
      <div className="flex-1">
        <h2 className="text-xl font-bold font-raleway text-text-primary mb-6">
          {isDayTour ? "Pick a departure date" : "When are you traveling?"}
        </h2>

        {isDayTour ? (
          <div className="mb-8">
            <label htmlFor="departure" className="block text-sm font-semibold font-open-sans text-text-primary mb-3">
              Departure date <span className="text-red-500">*</span>
            </label>
            {bookableDepartures.length > 0 ? (
              <select
                id="departure"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-text-primary font-open-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a date…</option>
                {bookableDepartures.map((d) => (
                  <option key={d.date} value={d.date}>
                    {fmtDate(d.date)}
                    {d.seats_left !== null && d.seats_left <= 5 ? `  (${d.seats_left} left)` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 font-open-sans p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                No upcoming departures for this tour right now. Please check back soon.
              </p>
            )}
          </div>
        ) : (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
          <label className="block text-sm font-semibold font-open-sans text-text-primary mb-3">
            Available Dates
          </label>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold font-raleway text-text-primary">
                {availableFrom && availableTo 
                  ? `${fmtDate(availableFrom)} - ${fmtDate(availableTo)}`
                  : availableFrom ? fmtDate(availableFrom) : "Dates not specified"}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                Your tour is valid for the period above.
              </p>
            </div>
          </div>
        </div>
        )}

        <h2 className="text-xl font-bold font-raleway text-text-primary mb-6">
          Select your ticket type
        </h2>

        {/* One tier per booking: the backend prices every guest at a single
            tier, so mixed-tier selections would misstate the total. */}
        <div className="flex flex-col gap-3">
          {tiers.map(({ tier, label, price }, i) => {
            const selected = counts[i] > 0;
            const qty = counts[i];
            return (
              <div
                key={tier}
                className={`flex items-center justify-between gap-2 rounded-2xl border-2 p-4 transition-colors cursor-pointer ${
                  selected ? "border-primary bg-primary/5" : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                }`}
                onClick={() => { if (!selected) adjust(i, 1); }}
              >
                <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300 leading-snug">
                  {label}{" "}
                  <span className="font-semibold text-text-primary">{fmt(price, currency)}</span>
                  <span className="text-gray-500"> /person</span>
                </p>
                {selected && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); adjust(i, -1); }}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors text-base leading-none"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-open-sans font-semibold text-text-primary">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); adjust(i, 1); }}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors text-base leading-none"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-80 shrink-0">
        <OrderSummary
          imageUrl={imageUrl}
          title={title}
          tiers={tiers}
          counts={counts}
          currency={currency}
          availableFrom={availableFrom}
          availableTo={availableTo}
          onNext={() => { if (hasTickets) onNext(); }}
          nextLabel={!hasTickets ? "Select tickets" : "Next"}
        />
      </div>
    </div>
  );
}

// -- Step 2 - Your Details -----------------------------------------------------

interface ContactForm {
 firstName: string;
 lastName: string;
 email: string;
 phone: string;
 country: string;
 specialRequests: string;
}

interface Step2Props {
  form: ContactForm;
  setForm: (f: ContactForm) => void;
  tiers: { tier: PriceTier; label: string; price: number }[];
  counts: number[];
  currency: string;
  imageUrl: string;
  title: string;
  travelDate: string;
  availableFrom?: string;
  availableTo?: string;
  onNext: () => void;
  onBack: () => void;
  isPaying: boolean;
  error: string | null;
}

function StepYourDetails({
  form,
  setForm,
  tiers,
  counts,
  currency,
  imageUrl,
  title,
  travelDate,
  availableFrom,
  availableTo,
  onNext,
  onBack,
  isPaying,
  error,
}: Step2Props) {
 const update = (key: keyof ContactForm, value: string) => setForm({ ...form, [key]: value });

 const canPay =
 form.firstName.trim() &&
 form.lastName.trim() &&
 form.email.trim() &&
 /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

 return (
 <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
 {/* Left */}
 <div className="flex-1">
 <h2 className="text-xl font-bold font-raleway text-text-primary mb-8">
 Who shall we send these tickets to?
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
 <div>
 <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">
 First Name <span className="text-red-400">*</span>
 </label>
 <input
 type="text"
 placeholder="Enter your first name"
 value={form.firstName}
 onChange={(e) => update("firstName", e.target.value)}
 className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">
 Last Name <span className="text-red-400">*</span>
 </label>
 <input
 type="text"
 placeholder="Enter your last name"
 value={form.lastName}
 onChange={(e) => update("lastName", e.target.value)}
 className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">
 Email Address <span className="text-red-400">*</span>
 </label>
 <input
 type="email"
 placeholder="Enter your email address"
 value={form.email}
 onChange={(e) => update("email", e.target.value)}
 className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">
 Telephone Number
 </label>
 <input
 type="tel"
 placeholder="Enter your telephone number"
 value={form.phone}
 onChange={(e) => update("phone", e.target.value)}
 className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
 />
 </div>
 <div>
 <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">
 Country
 </label>
 <input
 type="text"
 placeholder="Enter your country"
 value={form.country}
 onChange={(e) => update("country", e.target.value)}
 className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors"
 />
 </div>
 <div className="col-span-1 md:col-span-2">
 <label className="block text-sm font-semibold font-open-sans text-text-primary mb-2">
 Special Requests
 </label>
 <textarea
 placeholder="Any dietary requirements, accessibility needs, or other requests..."
 value={form.specialRequests}
 onChange={(e) => update("specialRequests", e.target.value)}
 rows={3}
 className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-open-sans text-text-primary placeholder-gray-300 dark:placeholder-gray-500 outline-none focus:border-primary transition-colors resize-none"
 />
 </div>
 </div>

 {error && (
 <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-open-sans text-red-600">
 {error}
 </div>
 )}

 <button
 onClick={onBack}
 className="mt-8 text-sm font-semibold font-open-sans text-gray-700 dark:text-gray-300 hover:text-text-primary transition-colors flex items-center gap-1.5"
 >
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M19 12H5M12 5l-7 7 7 7" />
 </svg>
 Back to Booking Details
 </button>
 </div>

  {/* Right */}
  <div className="w-full lg:w-80 shrink-0">
    <OrderSummary
      imageUrl={imageUrl}
      title={title}
      tiers={tiers}
      counts={counts}
      currency={currency}
      availableFrom={availableFrom}
      availableTo={availableTo}
      onNext={() => { if (canPay) onNext(); }}
      nextLabel={isPaying ? "Processing…" : "Confirm & Pay"}
      isLoading={isPaying}
    />
  </div>
</div>
 );
}

// -- Main content --------------------------------------------------------------

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=400&q=80";

function BookingContent() {
 const searchParams = useSearchParams();
 const router = useRouter();

 const packageId = searchParams.get("id") ?? "";

 const { data: pkg, isLoading, isError } = useGetPackageDetailQuery(packageId, { skip: !packageId });

 const [step, setStep] = useState(1);
  const [counts, setCounts] = useState<number[]>(() => {
    const raw = (["shared", "private", "vip"] as PriceTier[]).map((tier) =>
      Math.max(0, parseInt(searchParams.get(tier) ?? "0", 10))
    );
    // Single-tier invariant (the backend prices all guests at one tier):
    // keep only the tier with the highest requested count.
    const dominant = raw.reduce((maxI, c, i) => (c > raw[maxI] ? i : maxI), 0);
    return raw.map((c, i) => (i === dominant ? c : 0));
  });
  const [travelDate, setTravelDate] = useState(() => searchParams.get("date") ?? "");
  const [form, setForm] = useState<ContactForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    specialRequests: "",
  });
  const [payError, setPayError] = useState<string | null>(null);

 const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
 const [initializePayment, { isLoading: isInitializing }] = useInitializePaymentMutation();
 const isPaying = isCreating || isInitializing;

 if (!packageId) {
 return (
 <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
 <p className="text-gray-700 dark:text-gray-300 font-open-sans text-sm">
 No package selected.{" "}
 <button onClick={() => router.push("/destinations")} className="text-primary underline">
 Browse tours
 </button>
 </p>
 </main>
 );
 }

 if (isLoading) {
 return (
 <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
 <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
 </svg>
 </main>
 );
 }

 if (isError || !pkg) {
 return (
 <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
 <p className="text-gray-700 dark:text-gray-300 font-open-sans text-sm">
 Failed to load package.{" "}
 <button onClick={() => router.back()} className="text-primary underline">Go back</button>
 </p>
 </main>
 );
 }

 // Day tours are a single flat per-person price; multi-tier packages keep
 // their tiers. Drop any tier the package doesn't price (null → NaN).
 const tiers: { tier: PriceTier; label: string; price: number }[] = [
 { tier: "shared" as PriceTier, label: pkg.is_day_tour ? "Per person" : "Shared / Group", price: parseFloat(pkg.price_shared) },
 { tier: "private" as PriceTier, label: "Private", price: parseFloat(pkg.price_private) },
 { tier: "vip" as PriceTier, label: "VIP", price: parseFloat(pkg.price_vip) },
 ].filter((t) => Number.isFinite(t.price) && t.price > 0);

 // Single-tier invariant: adjusting a tier zeroes the others.
 const adjust = (i: number, delta: number) => {
 setCounts((prev) => prev.map((c, idx) => (idx === i ? Math.max(0, c + delta) : 0)));
 };

 const coverImage = pkg.images.find((img) => img.is_cover)?.image ?? pkg.images[0]?.image ?? FALLBACK_IMAGE;

 const handleConfirmPay = async () => {
 setPayError(null);
 // Use the tier with the highest count; fall back to first non-zero
 const dominantIdx = counts.reduce((maxI, c, i) => (c > counts[maxI] ? i : maxI), 0);
 const bookingTier = tiers[dominantIdx].tier;
 const totalGuests = counts.reduce((s, c) => s + c, 0);

 try {
      const booking = await createBooking({
        package_id: pkg.id,
        price_tier: bookingTier,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        country: form.country || undefined,
        num_guests: Math.max(1, totalGuests),
        travel_date: travelDate,
        special_requests: form.specialRequests || undefined,
      }).unwrap();

 const payment = await initializePayment({ booking_id: booking.id }).unwrap();
 const { routeAfterInitialize } = await import("@/lib/payments/paystack");
 await routeAfterInitialize(payment, (reference) => {
 window.location.href = `/payment/callback?reference=${reference}`;
 });
 } catch (err: unknown) {
 const msg =
 typeof err === "object" && err !== null && "detail" in err
 ? String((err as { detail: string }).detail)
 : "Payment initialization failed. Please try again.";
 setPayError(msg);
 }
 };

 return (
 <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto">
 <Stepper current={step} />

      {step === 1 && (
        <StepBookingDetails
          tiers={tiers}
          counts={counts}
          adjust={adjust}
          travelDate={travelDate}
          setTravelDate={setTravelDate}
          availableFrom={searchParams.get("date") || pkg.available_from}
          availableTo={searchParams.get("dateTo") || pkg.available_to}
          currency={pkg.currency}
          imageUrl={coverImage}
          title={pkg.title}
          onNext={() => setStep(2)}
          departures={pkg.departures}
          isDayTour={pkg.is_day_tour}
        />
      )}

      {step === 2 && (
        <StepYourDetails
          form={form}
          setForm={setForm}
          tiers={tiers}
          counts={counts}
          currency={pkg.currency}
          imageUrl={coverImage}
          title={pkg.title}
          travelDate={travelDate}
          availableFrom={searchParams.get("date") || pkg.available_from}
          availableTo={searchParams.get("dateTo") || pkg.available_to}
          onNext={handleConfirmPay}
          onBack={() => setStep(1)}
          isPaying={isPaying}
          error={payError}
        />
      )}
 </main>
 );
}

// -- Page ----------------------------------------------------------------------

export default function BookingPage() {
 return (
 <Suspense
 fallback={
 <main className="w-full px-4 md:px-10 mt-24 py-10 max-w-5xl mx-auto flex items-center justify-center min-h-[40vh]">
 <svg className="animate-spin w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
 </svg>
 </main>
 }
 >
 <BookingContent />
 </Suspense>
 );
}
