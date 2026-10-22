"use client";

import { useSiteContact } from "@/lib/content/useSiteContact";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FAQS } from "@/lib/content/site";
import { useAskAssistantMutation, useCreateLeadMutation } from "@/lib/api/bookingsApi";
import logo from "../../assets/logo/logodark.png";
import { BlackStar } from "./Decor";

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
  const field = "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-text-primary placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";
  const assistantBubble = "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed text-text-primary whitespace-pre-line";

  return (
    <>
      <div
        role="dialog"
        aria-label="Azura Assistant"
        aria-hidden={!open}
        inert={!open}
        data-open={open}
        className="chat-panel fixed right-4 md:right-6 bottom-24 z-50 w-[calc(100vw-2rem)] max-w-[380px] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-[0_24px_60px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/5 dark:ring-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-[#060504] text-white px-4 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-[#C9A96E]/40">
              <Image src={logo} alt="" className="h-7 w-auto object-contain" />
              <span aria-hidden="true" className="chat-online absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#060504]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-raleway font-bold leading-tight">{teamView ? "Message the team" : "Azura Assistant"}</p>
              <p className="mt-0.5 text-xs text-gray-300 truncate">
                {teamView ? "A person replies by email in staffed hours" : "Online · answers in seconds"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close help"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 transition-all duration-300"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {!teamView && (<>
        {/* Conversation */}
        <div className="px-4 py-4 flex flex-col gap-3 bg-[#FBF8F2] dark:bg-gray-950 h-[min(52vh,420px)] overflow-y-auto overscroll-contain" aria-live="polite">
          <div className="msg-in-left flex items-end gap-2">
            <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#060504]"><BlackStar size={16} /></span>
            <p className={`max-w-[82%] ${assistantBubble}`}>
              Akwaaba! 👋 Ask me about dates, prices and stays for December in Ghana and the Michael Blackson Ghana Experience in January.
            </p>
          </div>
          {turns.map((t, i) =>
            t.role === "user" ? (
              <p key={i} className="msg-in-right self-end max-w-[82%] bg-primary text-white shadow-sm rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line">
                {t.content}
              </p>
            ) : (
              <div key={i} className="msg-in-left flex items-end gap-2">
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#060504]"><BlackStar size={16} /></span>
                <p className={`max-w-[82%] ${assistantBubble}`}>{t.content}</p>
              </div>
            ),
          )}
          {thinking && (
            <div className="msg-in-left flex items-end gap-2">
              <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#060504]"><BlackStar size={16} /></span>
              <span role="status" aria-label="The assistant is typing" className="inline-flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl rounded-bl-md px-4 py-3.5">
                <span className="typing-dot h-2 w-2 rounded-full bg-[#BD8F3A]" />
                <span className="typing-dot h-2 w-2 rounded-full bg-[#BD8F3A]" />
                <span className="typing-dot h-2 w-2 rounded-full bg-[#BD8F3A]" />
              </span>
            </div>
          )}
          {turns.length === 0 && (
            <div className="mt-1 flex flex-col gap-2">
              <p className="pl-9 text-[0.6875rem] font-montserrat font-bold uppercase tracking-wider text-[#8A6420] dark:text-[#C9A96E]">Popular questions</p>
              <div className="pl-9 flex flex-wrap gap-2">
                {QUICK.map((q, i) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => ask(q)}
                    style={{ "--chip-delay": `${150 + i * 70}ms` } as React.CSSProperties}
                    className="chat-chip text-left text-xs font-semibold font-montserrat text-[#6B4E1A] dark:text-[#E9D3A3] bg-white dark:bg-gray-900 border border-[#E9D3A3] dark:border-[#6B4E1A] hover:border-primary hover:-translate-y-0.5 hover:shadow-sm rounded-full px-3 py-2 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(draft); }}
          className="px-3 py-3 border-t border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 pl-4 pr-1.5 py-1.5 ring-1 ring-transparent focus-within:ring-primary/50 focus-within:bg-white dark:focus-within:bg-gray-900 transition">
            <input
              aria-label="Ask a question"
              placeholder="Ask about dates, prices, stays…"
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={thinking || !draft.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white transition-all hover:brightness-95 enabled:hover:scale-105 disabled:opacity-40"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </form>
        </>)}

        {/* The team */}
        <div className={`px-4 pb-4 flex flex-col gap-2 overflow-y-auto ${teamView ? "pt-4 max-h-[70vh]" : ""}`}>
          {teamView && handoff !== "sent" && (
            <button type="button" onClick={() => setHandoff(null)} className="self-start text-xs font-semibold text-[#8A6420] dark:text-primary hover:-translate-x-0.5 transition-transform">
              ← Back to chat
            </button>
          )}
          {handoff === "sent" ? (
            <div className="msg-in-left flex flex-col items-center gap-2 py-4 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <p role="status" className="text-sm text-text-primary">Sent. Our team will reply to {msg.email}.</p>
              <button type="button" onClick={() => { setHandoff(null); setMsg((m) => ({ ...m, message: "" })); }} className="text-xs font-semibold text-[#8A6420] dark:text-primary">
                Back to chat
              </button>
            </div>
          ) : handoff === null ? (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setHandoff("form")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 font-montserrat font-semibold text-xs text-text-primary hover:border-primary hover:-translate-y-0.5 transition-all">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4zM22 6l-10 7L2 6" /></svg>
                Email the team
              </button>
              {whatsappHref.startsWith("https://wa.me/") ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-xs rounded-xl py-2.5 hover:brightness-95 hover:-translate-y-0.5 transition-all">
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.1.3.6 1.1 1.4 1.8 1 .9 1.8 1.1 2.1 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z" /></svg>
                  WhatsApp
                </a>
              ) : (
                <Link href="/faqs" className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 font-montserrat font-semibold text-xs text-text-primary hover:border-primary transition-all">
                  All FAQs
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={sendToTeam} className="msg-in-left flex flex-col gap-2">
              <input required aria-label="Your name" placeholder="Your name" value={msg.name} onChange={(e) => setMsg({ ...msg, name: e.target.value })} className={field} />
              <input required type="email" aria-label="Your email" placeholder="Email" value={msg.email} onChange={(e) => setMsg({ ...msg, email: e.target.value })} className={field} />
              <textarea required aria-label="Your message" placeholder="How can we help?" rows={5} value={msg.message} onChange={(e) => setMsg({ ...msg, message: e.target.value })} className={field} />
              <label className="flex gap-2 items-start text-xs text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={msg.consent} onChange={(e) => setMsg({ ...msg, consent: e.target.checked })} className="mt-0.5 accent-primary" />
                Optional. Send me offers and updates by email.
              </label>
              {handoff !== "form" && handoff !== "sending" && <p role="alert" className="text-xs text-red-700 dark:text-red-400">{handoff}</p>}
              <button type="submit" disabled={handoff === "sending"} className="rounded-xl bg-primary text-white py-2.5 font-montserrat font-semibold text-sm hover:brightness-95 disabled:opacity-50 transition">
                {handoff === "sending" ? "Sending…" : "Send"}
              </button>
              {whatsappHref.startsWith("https://wa.me/") && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="text-center bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm rounded-xl py-2.5 hover:brightness-95 transition">
                  Talk to a person on WhatsApp
                </a>
              )}
            </form>
          )}
          <p className="text-[11px] text-center text-gray-600 dark:text-gray-400">
            Our team replies during {contact.staffedHours}.{whatsappHref.startsWith("https://wa.me/") && <> <Link href="/faqs" className="text-primary font-semibold">All FAQs</Link></>}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label={open ? "Close help" : "Open help"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${open ? "" : "fab-pulse"} fixed right-4 md:right-6 bottom-6 z-50 w-14 h-14 rounded-full bg-primary text-white grid place-items-center shadow-lg hover:scale-105 active:scale-95 transition-transform`}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`col-start-1 row-start-1 transition-all duration-300 ${open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={`col-start-1 row-start-1 transition-all duration-300 ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </>
  );
}
