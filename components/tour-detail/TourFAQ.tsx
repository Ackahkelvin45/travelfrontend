"use client";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface TourFAQProps {
  items: FAQItem[];
}

export default function TourFAQ({ items }: TourFAQProps) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-6 border-b border-gray-100">
      <h2 className="text-xl font-bold font-raleway text-text-primary mb-4">FAQ</h2>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold font-raleway text-text-primary pr-4">{item.question}</span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center transition-transform ${
                  open === i ? "rotate-45" : ""
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-500 font-open-sans leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
