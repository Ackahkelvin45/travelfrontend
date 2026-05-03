"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type PriceTier = "shared" | "private" | "vip";

interface TicketType {
 label: string;
 ageRange: string;
 price: number;
 tier: PriceTier;
}

interface AddOn {
 label: string;
 price: number;
 subLabel?: string;
}

interface BookingSidebarProps {
 packageId: string;
 basePrice: number;
 ticketTypes: TicketType[];
 addOns?: AddOn[];
 availableFrom?: string;
 availableTo?: string;
 currency: string;
}

function formatDate(iso: string) {
 return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "2-digit" });
}

export default function BookingSidebar({
 packageId,
 basePrice,
 ticketTypes,
 addOns,
 availableFrom,
 availableTo,
 currency,
}: BookingSidebarProps) {
 const router = useRouter();
 const [counts, setCounts] = useState<number[]>(ticketTypes.map(() => 0));
 const [selectedAddOns, setSelectedAddOns] = useState<boolean[]>((addOns ?? []).map(() => false));

 const ticketsTotal = counts.reduce((sum, count, i) => sum + count * ticketTypes[i].price, 0);
 const addOnsTotal = (addOns ?? []).reduce((sum, addon, i) => sum + (selectedAddOns[i] ? addon.price : 0), 0);
 const total = ticketsTotal + addOnsTotal;

 const adjust = (i: number, delta: number) => {
 setCounts((prev) => prev.map((c, idx) => (idx === i ? Math.max(0, c + delta) : c)));
 };

 const toggleAddOn = (i: number) => {
 setSelectedAddOns((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
 };

 const handleBookNow = () => {
 const hasSelection = counts.some((c) => c > 0);
 const params = new URLSearchParams({ id: packageId });
 ticketTypes.forEach((ticket, i) => {
 params.set(ticket.tier, hasSelection ? counts[i].toString() : i === 0 ? "1" : "0");
 });
 router.push(`/booking?${params.toString()}`);
 };

 return (
 <div className="bg-white w-90 rounded-2xl shadow-md border border-gray-100 p-6 sticky top-24">
 {/* Header */}
 <div className="flex items-baseline gap-2 mb-5">
 <span className="text-sm text-gray-700 font-open-sans">From</span>
 <span className="text-2xl font-bold font-raleway text-text-primary">
 {currency} {basePrice.toLocaleString()}
 </span>
 </div>

 {/* Date & Time */}
 <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
 <div className="flex items-center gap-3 p-3 border-b border-gray-200 ">
 <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
 <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
 <line x1="16" y1="2" x2="16" y2="6"/>
 <line x1="8" y1="2" x2="8" y2="6"/>
 <line x1="3" y1="10" x2="21" y2="10"/>
 </svg>
 </div>
 <div>
 <p className="text-sm font-semibold font-raleway text-text-primary leading-tight">From</p>
 <p className="text-xs text-gray-700 font-open-sans mt-0.5">
 {availableFrom && availableTo
 ? `${formatDate(availableFrom)} ~ ${formatDate(availableTo)}`
 : "Check availability"}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3 p-3">
 <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
 <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="12" cy="12" r="10"/>
 <polyline points="12 6 12 12 16 14"/>
 </svg>
 </div>
 <div>
 <p className="text-sm font-semibold font-raleway text-text-primary leading-tight">Time</p>
 <p className="text-xs text-gray-700 font-open-sans mt-0.5">Choose time</p>
 </div>
 </div>
 </div>

 {/* Tickets */}
 <div className="mb-6">
 <p className="text-base font-bold font-raleway text-text-primary mb-4">Tickets</p>
 <div className="flex flex-col gap-4">
 {ticketTypes.map((ticket, i) => (
 <div key={i} className="flex items-center justify-between gap-2">
 <p className="text-sm font-open-sans text-gray-700 leading-snug">
 {ticket.label}{" "}
 <span className="text-gray-700">({ticket.ageRange})</span>{" "}
 <span className="font-semibold text-text-primary">{currency} {ticket.price.toFixed(2)}</span>
 </p>
 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => adjust(i, -1)}
 className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-primary hover:text-primary transition-colors text-base leading-none"
 >
 −
 </button>
 <span className="w-5 text-center text-sm font-open-sans font-semibold text-text-primary">
 {counts[i]}
 </span>
 <button
 onClick={() => adjust(i, 1)}
 className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-primary hover:text-primary transition-colors text-base leading-none"
 >
 +
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Add Extra */}
 {addOns && addOns.length > 0 && (
 <div className="mb-6">
 <p className="text-base font-bold font-raleway text-text-primary mb-4">Add Extra</p>
 <div className="flex flex-col gap-4">
 {addOns.map((addon, i) => (
 <label key={i} className="flex items-start justify-between cursor-pointer gap-3">
 <div className="flex items-start gap-2.5">
 <input
 type="checkbox"
 checked={selectedAddOns[i]}
 onChange={() => toggleAddOn(i)}
 className="mt-0.5 w-4 h-4 cursor-pointer accent-primary shrink-0"
 />
 <div>
 <p className="text-sm font-open-sans text-gray-700 ">{addon.label}</p>
 {addon.subLabel && (
 <p className="text-xs text-gray-700 font-open-sans mt-0.5">{addon.subLabel}</p>
 )}
 </div>
 </div>
 <span className="text-sm font-semibold font-open-sans text-text-primary shrink-0">
 {currency} {addon.price}
 </span>
 </label>
 ))}
 </div>
 </div>
 )}

 {/* Total */}
 <div className="border-t border-gray-200 pt-4 mb-5 flex justify-between items-center">
 <span className="text-base font-bold font-raleway text-text-primary">Total:</span>
 <span className="text-xl font-bold font-raleway text-text-primary">
 {currency} {total.toFixed(2)}
 </span>
 </div>

 <button
 onClick={handleBookNow}
 className="block w-full bg-primary text-white py-3.5 rounded-2xl font-semibold font-open-sans text-sm hover:bg-primary/90 transition-colors text-center"
 >
 Book Now
 </button>
 </div>
 );
}
