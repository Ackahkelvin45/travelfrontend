"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetBookingByReferenceQuery } from "@/lib/api/bookingsApi";
import Link from "next/link";

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

export default function BookingConfirmedPage() {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();

  const { data: booking, isLoading, isError } = useGetBookingByReferenceQuery(reference, {
    skip: !reference,
  });

  if (isLoading) {
    return (
      <main className="w-full px-10 mt-24 py-10 flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </main>
    );
  }

  if (isError || !booking) {
    return (
      <main className="w-full px-10 mt-24 py-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-700 font-open-sans text-sm mb-4">
            Could not load your booking details.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-primary font-semibold font-open-sans text-sm underline"
          >
            Return home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-10 mt-24 py-10 max-w-2xl mx-auto">
      {/* Success header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold font-raleway text-text-primary mb-2 text-center">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 font-open-sans text-sm text-center max-w-sm">
          Your booking has been confirmed and a receipt has been sent to{" "}
          <span className="font-semibold text-text-primary">{booking.email}</span>.
        </p>
      </div>

      {/* Booking details card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        {/* Card header */}
        <div className="bg-primary/5 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm font-semibold font-open-sans text-gray-500">Booking Reference</p>
          <p className="text-base font-bold font-raleway text-primary tracking-wide">
            {booking.reference}
          </p>
        </div>

        {/* Card body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          <DetailRow label="Package" value={booking.package_title} bold />
          <DetailRow
            label="Travel Date"
            value={formatDate(booking.travel_date)}
          />
          <DetailRow
            label="Guests"
            value={`${booking.num_guests} ${booking.num_guests === 1 ? "guest" : "guests"}`}
          />
          <DetailRow
            label="Name"
            value={`${booking.first_name} ${booking.last_name}`}
          />
          <DetailRow label="Email" value={booking.email} />

          <div className="border-t border-gray-100 pt-5 flex justify-between items-center">
            <span className="text-base font-bold font-raleway text-text-primary">Total Paid</span>
            <span className="text-xl font-bold font-raleway text-primary">
              {fmt(booking.total_amount, booking.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-3 mb-8">
        <StatusBadge
          label="Booking Status"
          value={booking.status}
          colorMap={{ confirmed: "green", pending: "yellow", cancelled: "red", completed: "blue" }}
        />
        <StatusBadge
          label="Payment Status"
          value={booking.payment_status}
          colorMap={{ success: "green", pending: "yellow", failed: "red", abandoned: "gray" }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/destinations"
          className="flex-1 bg-primary text-white py-3.5 rounded-full font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors text-center"
        >
          Browse More Tours
        </Link>
        <Link
          href="/"
          className="flex-1 border border-gray-200 text-text-primary py-3.5 rounded-full font-semibold font-open-sans text-sm hover:border-gray-300 transition-colors text-center"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-open-sans text-gray-700 shrink-0">{label}</span>
      <span className={`text-sm font-open-sans text-right ${bold ? "font-bold text-text-primary" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}

type Color = "green" | "yellow" | "red" | "blue" | "gray";

const COLOR_CLASSES: Record<Color, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-700",
};

function StatusBadge({
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
    <div className="flex-1 border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-open-sans text-gray-700 mb-1.5">{label}</p>
      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-open-sans capitalize ${COLOR_CLASSES[color]}`}
      >
        {value}
      </span>
    </div>
  );
}
