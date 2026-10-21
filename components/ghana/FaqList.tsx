"use client";

import { useState } from "react";
import { FAQS } from "@/lib/content/site";

const TOPICS = ["All", ...Array.from(new Set(FAQS.map((f) => f.topic)))];

export default function FaqList() {
  const [topic, setTopic] = useState("All");
  const [open, setOpen] = useState<string | null>(FAQS[0].q);
  const list = FAQS.filter((f) => topic === "All" || f.topic === topic);

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Question topics" className="flex flex-wrap gap-2 mb-3">
        {TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={topic === t}
            onClick={() => setTopic(t)}
            className={`font-montserrat text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
              topic === t ? "bg-[#060504] text-white border-[#060504] dark:bg-white dark:text-black dark:border-white" : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      {list.map((f) => {
        const isOpen = open === f.q;
        const id = `faq-${FAQS.indexOf(f)}`;
        return (
          <div key={f.q} className={`content-in rounded-2xl border bg-white dark:bg-gray-900 transition-all ${isOpen ? "border-[#E5D3B0] shadow-md" : "border-gray-100 dark:border-gray-800"}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : f.q)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-5"
              >
                <span className="flex flex-col gap-1">
                  <span className="font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#8A6420] dark:text-[#C9A96E]">{f.topic}</span>
                  <span className="font-raleway font-bold text-base text-text-primary">{f.q}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${isOpen ? "rotate-45 bg-primary text-white" : "bg-[#FAF5EB] text-[#8A6420]"}`}
                >
                  +
                </span>
              </button>
            </h3>
            <div id={id} className={`acc-body ${isOpen ? "acc-open" : ""}`}>
              <div>
                <p className="px-5 md:px-6 pb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
