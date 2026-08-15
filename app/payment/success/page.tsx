"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetBookingByReferenceQuery } from "@/lib/api/bookingsApi";
import Link from "next/link";
import { CheckIcon, MailIcon, PrinterIcon } from "@/components/ui/icons";

function fmt(amount: string, currency: string) {
 return `${currency} ${parseFloat(amount).toLocaleString("en-US", {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 })}`;
}

function formatDate(iso: string) {
 return new Date(iso).toLocaleDateString("en-US", {
 weekday: "long",
 year: "numeric",
 month: "long",
 day: "numeric",
 });
}

function SuccessContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const reference = searchParams.get("reference") ?? "";

 const { data: booking, isLoading, isError } = useGetBookingByReferenceQuery(
 reference,
 { skip: !reference }
 );

 if (!reference) {
 return (
 <div className="text-center flex flex-col items-center gap-4">
 <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm">
 No booking reference found.
 </p>
 <button
 onClick={() => router.push("/destinations")}
 className="text-primary font-semibold font-open-sans text-sm underline"
 >
 Browse tours
 </button>
 </div>
 );
 }

 if (isLoading) {
 return (
 <div className="flex flex-col items-center gap-4">
 <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
 </svg>
 <p className="text-text-primary font-semibold font-raleway text-base">
 Loading your booking…
 </p>
 </div>
 );
 }

 if (isError || !booking) {
 return (
 <div className="text-center flex flex-col items-center gap-4">
 <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm">
 Could not load your booking details.
 </p>
 <button
 onClick={() => router.push("/")}
 className="text-primary font-semibold font-open-sans text-sm underline"
 >
 Return home
 </button>
 </div>
 );
 }

 return (
 <div className="w-full max-w-xl mx-auto content-in">
 {/* Animated check */}
 <div className="flex flex-col items-center mb-10">
 <div className="relative w-24 h-24 mb-6" aria-hidden>
 <span className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-40" />
 <div className="relative w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
 <CheckIcon size={44} />
 </div>
 </div>

 <h1 className="text-3xl font-bold font-raleway text-text-primary mb-2 text-center">
 {parseFloat(booking.balance) > 0 ? "Deposit received — you're booked!" : "Booking confirmed"}
 </h1>
 <p className="text-gray-500 dark:text-gray-400 font-open-sans text-sm text-center max-w-sm leading-relaxed">
 Your booking is confirmed. A confirmation email with your booking details has been sent to{" "}
 <span className="font-semibold text-text-primary">{booking.email}</span>.
 </p>
 </div>

 {/* Email notice banner */}
 <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 mb-6">
 <MailIcon size={18} className="shrink-0 mt-0.5 text-primary" />
 <p className="text-sm font-open-sans text-gray-700 dark:text-gray-300 ">
 A receipt and trip details have been sent to{" "}
 <span className="font-semibold text-text-primary">{booking.email}</span>.
 Check your spam folder if you don&apos;t see it within a few minutes.
 </p>
 </div>

 {/* Booking summary card */}
 <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
 {/* Card header */}
 <div className="bg-primary/5 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
 <p className="text-sm font-semibold font-open-sans text-gray-500 dark:text-gray-400 ">
 Booking Reference
 </p>
 <p className="text-base font-bold font-raleway text-primary tracking-wide">
 {booking.reference}
 </p>
 </div>

 {/* Card body */}
 <div className="px-6 py-6 flex flex-col gap-5">
 <Row label="Package" value={booking.package_title} bold />
 <Row label="Travel Date" value={formatDate(booking.travel_date)} />
 <Row
 label="Guests"
 value={`${booking.num_guests} ${booking.num_guests === 1 ? "guest" : "guests"}`}
 />
 <Row label="Name" value={`${booking.first_name} ${booking.last_name}`} />
 <Row label="Email" value={booking.email} />

 <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex flex-col gap-2.5">
 <div className="flex justify-between items-center">
 <span className="text-sm font-open-sans text-gray-700 dark:text-gray-300">Total booking amount</span>
 <span className="text-sm font-semibold font-open-sans text-text-primary">
 {fmt(booking.total_amount, booking.currency)}
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-base font-bold font-raleway text-text-primary">Paid to date</span>
 <span className="text-xl font-bold font-raleway text-primary">
 {fmt(booking.amount_paid, booking.currency)}
 </span>
 </div>
 {parseFloat(booking.balance) > 0 && (
 <div className="flex justify-between items-center">
 <span className="text-sm font-open-sans text-gray-700 dark:text-gray-300">Remaining balance</span>
 <span className="text-sm font-bold font-open-sans text-amber-700 dark:text-amber-500">
 {fmt(booking.balance, booking.currency)}
 </span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Status badges */}
 <div className="flex gap-3 mb-8">
 <Badge label="Booking" value={booking.status} colorMap={{ confirmed: "green", pending: "yellow", cancelled: "red", completed: "blue" }} />
 <Badge label="Payment" value={booking.payment_status ?? "pending"} colorMap={{ success: "green", pending: "yellow", failed: "red", abandoned: "gray" }} />
 </div>

 {/* Actions */}
 <div className="flex flex-col sm:flex-row gap-3 print:hidden">
 {parseFloat(booking.balance) > 0 ? (
 <Link
 href={`/booking/${booking.reference}/pay`}
 className="flex-1 bg-primary text-white py-3.5 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 transition-colors text-center"
 >
 Make another payment
 </Link>
 ) : (
 <Link
 href="/dashboard"
 className="flex-1 bg-primary text-white py-3.5 rounded-full font-bold font-open-sans text-sm hover:bg-primary/90 transition-colors text-center"
 >
 View my booking
 </Link>
 )}
 <button
 onClick={() => window.print()}
 className="flex-1 border border-gray-200 dark:border-gray-700 text-text-primary py-3.5 rounded-full font-semibold font-open-sans text-sm hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
 >
 <PrinterIcon size={15} />
 Print receipt
 </button>
 <Link
 href="/destinations"
 className="flex-1 border border-gray-200 dark:border-gray-700 text-text-primary py-3.5 rounded-full font-semibold font-open-sans text-sm hover:border-gray-300 transition-colors text-center"
 >
 Back to tours
 </Link>
 </div>
 </div>
 );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
 return (
 <div className="flex items-start justify-between gap-4">
 <span className="text-sm font-open-sans text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
 <span className={`text-sm font-open-sans text-right ${bold ? "font-bold text-text-primary" : "text-text-primary"}`}>
 {value}
 </span>
 </div>
 );
}

type Color = "green" | "yellow" | "red" | "blue" | "gray";

const COLOR_CLASSES: Record<Color, string> = {
 green: "bg-green-100 text-green-700 ",
 yellow: "bg-yellow-100 text-yellow-700 ",
 red: "bg-red-100 text-red-700 ",
 blue: "bg-blue-100 text-blue-700 ",
 gray: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 ",
};

function Badge({
 label,
 value,
 colorMap,
}: {
 label: string;
 value: string;
 colorMap: Record<string, Color>;
}) {
 const color = colorMap[value] ?? "gray";
 return (
 <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
 <p className="text-xs font-open-sans text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
 <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-open-sans capitalize ${COLOR_CLASSES[color]}`}>
 {value}
 </span>
 </div>
 );
}

export default function PaymentSuccessPage() {
 return (
 <main className="w-full px-4 md:px-10 mt-24 py-14 flex items-start justify-center min-h-[80vh]">
 <Suspense
 fallback={
 <div className="flex flex-col items-center gap-4">
 <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
 </svg>
 <p className="text-text-primary font-semibold font-raleway text-base">Loading…</p>
 </div>
 }
 >
 <SuccessContent />
 </Suspense>
 </main>
 );
}
