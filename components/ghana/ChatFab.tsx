"use client";

import { useSiteContact } from "@/lib/content/useSiteContact";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FAQS } from "@/lib/content/site";
import { useAskAssistantMutation, useCreateLeadMutation } from "@/lib/api/bookingsApi";
import logo from "../../assets/logo/logodark.png";

// Starter questions; the answers come live from the assistant.
const QUICK = [0, 1, 6, 4].map((i) => FAQS[i].q);
// The API accepts up to 30 turns; older ones drop off the front.
const MAX_TURNS = 30;

type Turn = { role: "user" | "assistant"; content: string };

export default function ChatFab() {
  const contact = useSiteContact();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [askAssistant, { isLoading: thinking }] = useAskAssistantMutation();
  const endRef = useRef<HTMLDivElement>(null);
  const [handoff, setHandoff] = useState<null | "form" | "sending" | "sent" | string>(null);
  const [msg, setMsg] = useState({ name: "", email: "", message: "", consent: false });
  const [createLead] = useCreateLeadMutation();

  // Braces: newer browsers return a Promise from scrollIntoView, and an effect may only return a cleanup.
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [turns, thinking]);

  // Staff tools and booking/checkout flows have their own fixed bottom bars.
  if (/^\/(staff|tour|book|booking|checkout|experience|payment|claim)(\/|$)/.test(pathname)) return null;

  const ask = async (text: string) => {
    const question = text.trim();
    if (!question || thinking) return;
    const next: Turn[] = [...turns, { role: "user" as const, content: question }].slice(-MAX_TURNS);
    while (next[0]?.role !== "user") next.shift();
    setTurns(next);
    setDraft("");
    try {
      const res = await askAssistant({ messages: next }).unwrap();
      setTurns([...next, { role: "assistant", content: res.reply }]);
      if (res.handoff && handoff === null) {
        setMsg((m) => ({ ...m, message: m.message || question }));
        setHandoff("form");
      }
    } catch {
      setTurns([...next, { role: "assistant", content: "Sorry, I can't answer right now. You can send the team a message below." }]);
    }
  };

  const sendToTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandoff("sending");
    // The chat so far goes along so the team doesn't ask the guest to repeat themselves.
    const transcript = turns.map((t) => `${t.role === "user" ? "Guest" : "Assistant"}: ${t.content}`).join("\n");
    const message = transcript ? `${msg.message}\n\n--- Chat ---\n${transcript}` : msg.message;
    try {
      await createLead({ name: msg.name, email: msg.email, message, source: "chat", marketing_consent: msg.consent }).unwrap();
      setHandoff("sent");
    } catch (err) {
      setHandoff((err as { data?: { detail?: string } }).data?.detail ?? "We couldn't send that. Please try WhatsApp instead.");
    }
  };
  // Opens WhatsApp (app or web) to the team with the guest's last question typed in.
  const lastQuestion = [...turns].reverse().find((t) => t.role === "user")?.content;
  const waText = `Hi Azura, I have a question about the Ghana trip.${lastQuestion ? `\n\n${lastQuestion}` : ""}`;
  const whatsappHref = contact.whatsappHref.startsWith("https://wa.me/")
    ? `${contact.whatsappHref}?text=${encodeURIComponent(waText)}` : contact.whatsappHref;
  // Messaging the team replaces the chatbot with the full form.
  const teamView = handoff !== null;
  const field = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:border-primary";

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Help"
          className="content-in fixed right-4 md:right-6 bottom-24 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
        >
          <div className="bg-[#060504] text-white px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Image src={logo} alt="Azura Travels" className="h-11 w-[76px] shrink-0 object-contain" />
              <div className="min-w-0">
                <p className="font-raleway font-bold">{teamView ? "Message the team" : "Azura Assistant"}</p>
                <p className="text-xs text-gray-300">{teamView ? "A person replies by email in staffed hours" : "Quick answers any time · team replies in staffed hours"}</p>
              </div>
            </div>
            <button type="button" aria-label="Close help" onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors">×</button>
          </div>
          {!teamView && (<>
          <div className="p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-950 max-h-[50vh] overflow-y-auto">
            <p className="self-start max-w-[85%] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-text-primary">
              Akwaaba! Ask me about dates, prices and stays for December in Ghana and the Michael Blackson Ghana Experience in January.
            </p>
            {turns.map((t, i) => (
              <p
                key={i}
                className={t.role === "user"
                  ? "content-in self-end max-w-[85%] bg-primary text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm whitespace-pre-line"
                  : "content-in self-start max-w-[85%] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-text-primary whitespace-pre-line"}
              >
                {t.content}
              </p>
            ))}
            {thinking && (
              <p role="status" className="self-start bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                Typing…
              </p>
            )}
            {turns.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button key={q} type="button" onClick={() => ask(q)} className="text-xs font-semibold font-montserrat text-[#6B4E1A] bg-[#FAF5EB] hover:bg-[#F3E7CF] rounded-full px-3 py-2 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); ask(draft); }}
            className="px-4 pt-3 flex gap-2 border-t border-gray-100 dark:border-gray-800"
          >
            <input
              aria-label="Ask a question"
              placeholder="Ask about dates, prices, stays…"
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={field}
            />
            <button type="submit" disabled={thinking || !draft.trim()} className="shrink-0 rounded-xl bg-primary text-white px-4 font-montserrat font-semibold text-sm disabled:opacity-50">
              Send
            </button>
          </form>
          </>)}
          <div className="p-4 flex flex-col gap-2 max-h-[70vh] overflow-y-auto">
            {teamView && handoff !== "sent" && (
              <button type="button" onClick={() => setHandoff(null)} className="self-start text-xs font-semibold text-[#8A6420] dark:text-primary">
                ← Back to chat
              </button>
            )}
            {handoff === "sent" ? (
              <>
                <p role="status" className="text-sm text-center text-green-700 dark:text-green-400">Sent. Our team will reply to {msg.email}.</p>
                <button type="button" onClick={() => { setHandoff(null); setMsg((m) => ({ ...m, message: "" })); }} className="text-xs font-semibold text-[#8A6420] dark:text-primary">
                  Back to chat
                </button>
              </>
            ) : handoff === null ? (
              <button type="button" onClick={() => setHandoff("form")} className="rounded-xl border border-gray-200 dark:border-gray-700 py-3 font-montserrat font-semibold text-sm text-text-primary">
                Send a message to the team
              </button>
            ) : (
              <form onSubmit={sendToTeam} className="flex flex-col gap-2">
                <input required aria-label="Your name" placeholder="Your name" value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} className={field} />
                <input required type="email" aria-label="Your email" placeholder="Email" value={msg.email} onChange={(e) => setMsg({ ...msg, email: e.target.value })} className={field} />
                <textarea required aria-label="Your message" placeholder="How can we help?" rows={5} value={msg.message} onChange={(e) => setMsg({ ...msg, message: e.target.value })} className={field} />
                <label className="flex gap-2 items-start text-xs text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={msg.consent} onChange={(e) => setMsg({ ...msg, consent: e.target.checked })} className="mt-0.5 accent-primary" />
                  Optional. Send me offers and updates by email.
                </label>
                {handoff !== "form" && handoff !== "sending" && <p role="alert" className="text-xs text-red-700 dark:text-red-400">{handoff}</p>}
                <button type="submit" disabled={handoff === "sending"} className="rounded-xl bg-primary text-white py-2.5 font-montserrat font-semibold text-sm disabled:opacity-50">
                  {handoff === "sending" ? "Sending…" : "Send"}
                </button>
              </form>
            )}
            {/* Shown once the team's number is set in Admin → Settings (no dead link before then). */}
            {whatsappHref.startsWith("https://wa.me/") && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-center bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm rounded-xl py-3 hover:brightness-95 transition">
                Talk to a person on WhatsApp
              </a>
            )}
            <p className="text-[11px] text-center text-gray-600 dark:text-gray-400">
              Our team replies during {contact.staffedHours}. <Link href="/faqs" className="text-primary font-semibold">All FAQs</Link>
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
