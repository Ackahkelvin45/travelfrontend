"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTACT, FAQS, whatsappHref } from "@/lib/content/site";

// ponytail: answers come from the static FAQ list; swap for the real
// assistant endpoint once it exists (Change Request: chatbot + human handoff).
const QUICK = [0, 1, 6, 4].map((i) => FAQS[i]);

export default function ChatFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);

  // Staff tools and booking/checkout flows have their own fixed bottom bars.
  if (/^\/(staff|tour|book|booking|experience|payment|claim)(\/|$)/.test(pathname)) return null;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Help"
          className="content-in fixed right-4 md:right-6 bottom-24 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="bg-[#060504] text-white px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-raleway font-bold">Azura Assistant</p>
              <p className="text-xs text-gray-300">Quick answers any time · team replies in staffed hours</p>
            </div>
            <button type="button" aria-label="Close help" onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors">×</button>
          </div>
          <div className="p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-950 max-h-[50vh] overflow-y-auto">
            <p className="self-start max-w-[85%] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-text-primary">
              Akwaaba! Ask me about dates, prices and stays for December in Ghana and the January flagship.
            </p>
            {answer !== null && (
              <>
                <p className="content-in self-end max-w-[85%] bg-primary text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm">{QUICK[answer].q}</p>
                <p className="content-in self-start max-w-[85%] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-text-primary">{QUICK[answer].a}</p>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              {QUICK.map((f, i) => (
                <button key={f.q} type="button" onClick={() => setAnswer(i)} className="text-xs font-semibold font-montserrat text-[#6B4E1A] bg-[#FAF5EB] hover:bg-[#F3E7CF] rounded-full px-3 py-2 transition-colors">
                  {f.q}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            <a href={whatsappHref} className="text-center bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm rounded-xl py-3 hover:brightness-95 transition">
              Talk to a person on WhatsApp
            </a>
            <p className="text-[11px] text-center text-gray-600 dark:text-gray-400">
              We reply within one business hour during {CONTACT.staffedHours}, otherwise within 24 hours. <Link href="/faqs" className="text-primary font-semibold">All FAQs</Link>
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close help" : "Open help"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fab-pulse fixed right-4 md:right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </button>
    </>
  );
}
