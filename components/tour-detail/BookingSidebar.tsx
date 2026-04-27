"use client";
import { useState } from "react";

interface TicketType {
  label: string;
  subLabel?: string;
  price: number;
}

interface AddOn {
  label: string;
  price: number;
}

interface BookingSidebarProps {
  basePrice: number;
  priceLabel?: string;
  ticketTypes: TicketType[];
  addOns?: AddOn[];
}

export default function BookingSidebar({ basePrice, priceLabel, ticketTypes, addOns }: BookingSidebarProps) {
  const [counts, setCounts] = useState<number[]>(ticketTypes.map(() => 0));
  const [selectedAddOns, setSelectedAddOns] = useState<boolean[]>((addOns ?? []).map(() => false));

  const ticketsTotal = counts.reduce((sum, count, i) => sum + count * ticketTypes[i].price, 0);
  const addOnsTotal = (addOns ?? []).reduce((sum, addon, i) => sum + (selectedAddOns[i] ? addon.price : 0), 0);
  const total = basePrice + ticketsTotal + addOnsTotal;

  const adjust = (i: number, delta: number) => {
    setCounts((prev) => prev.map((c, idx) => idx === i ? Math.max(0, c + delta) : c));
  };

  const toggleAddOn = (i: number) => {
    setSelectedAddOns((prev) => prev.map((v, idx) => idx === i ? !v : v));
  };

  return (
    <div className="bg-white w-[350px] rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-24">
      <p className="text-xs text-gray-400 font-open-sans mb-1">From</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold font-raleway text-primary">${basePrice.toLocaleString()}</span>
      </div>
      {priceLabel && <p className="text-xs text-gray-400 font-open-sans mb-4">{priceLabel}</p>}

      <div className="border-t border-gray-100 pt-4 mb-4">
        <p className="text-sm font-semibold font-raleway text-text-primary mb-3">Tickets</p>
        <div className="flex flex-col gap-3">
          {ticketTypes.map((ticket, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-open-sans text-text-primary">{ticket.label}</p>
                {ticket.subLabel && <p className="text-xs text-gray-400 font-open-sans">{ticket.subLabel}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjust(i, -1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors text-lg leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-open-sans font-semibold">{counts[i]}</span>
                <button
                  onClick={() => adjust(i, 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {addOns && addOns.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <p className="text-sm font-semibold font-raleway text-text-primary mb-3">Add Extra</p>
          <div className="flex flex-col gap-2">
            {addOns.map((addon, i) => (
              <label key={i} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAddOns[i]}
                    onChange={() => toggleAddOn(i)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-open-sans text-gray-600">{addon.label}</span>
                </div>
                <span className="text-sm font-semibold font-open-sans text-text-primary">${addon.price}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-4 mb-5 flex justify-between items-center">
        <span className="text-sm font-semibold font-raleway text-text-primary">Total</span>
        <span className="text-lg font-bold font-raleway text-text-primary">
          ${total.toFixed(2)}
        </span>
      </div>

      <button className="w-full bg-primary text-white py-3 rounded-xl font-semibold font-raleway text-sm hover:bg-primary/90 transition-colors">
        Book Now
      </button>
    </div>
  );
}
