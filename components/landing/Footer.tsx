"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import footerBg from "../../assets/images/bgfooter.png";
import footerBgDark from "../../assets/images/bgfooterdark.png";
import logofull from "../../assets/logo/logofull.png";
import logofulldark from "../../assets/logo/logofulldark.png";
import { useSubscribeNewsletterMutation } from "@/lib/api/newsletterApi";
import { CONTACT, whatsappHref } from "@/lib/content/site";

const TRAVEL = [
  { href: "/december-in-ghana", label: "December in Ghana" },
  { href: "/ghana-experience-2027", label: "Ghana Experience 2027" },
  { href: "/experiences", label: "All Experiences" },
  { href: "/stays", label: "Stays" },
  { href: "/dashboard", label: "My Bookings" },
];
const SUPPORT = [
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Travel Guides" },
  { href: "/gallery", label: "Gallery" },
];
// All four customer policies stay linked from every page (policy requirement).
const POLICIES = [
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/installment-policy", label: "Installment Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!consent) {
      setMessage({ text: "Please tick the box to agree to receive updates.", type: "error" });
      return;
    }
    try {
      await subscribe({ email }).unwrap();
      setMessage({ text: "Medaase! You're on the list.", type: "success" });
      setEmail("");
      setConsent(false);
    } catch (err: unknown) {
      const data = (err as { data?: { email?: string[]; message?: string } })?.data;
      setMessage({ text: data?.email?.[0] || data?.message || "Something went wrong. Please try again.", type: "error" });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  // Checkout has its own focused header (canvas: CheckoutDetails / CheckoutPayment).
  if (pathname.startsWith("/checkout")) return null;

  return (
    <footer className="relative w-full font-open-sans mt-16 md:mt-24 overflow-hidden">
      <div aria-hidden="true" className="kente h-2.5 relative z-10" />
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden" style={{ backgroundImage: `url(${footerBg.src})` }} />
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block" style={{ backgroundImage: `url(${footerBgDark.src})` }} />

      <div className="relative z-10">
        <div className="px-4 md:px-10 lg:px-20 py-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <Image src={logofull} alt="Azura Travels" className="w-48 h-auto dark:hidden" />
          <Image src={logofulldark} alt="Azura Travels" className="w-48 h-auto hidden dark:block" />
          <a href={whatsappHref} className="inline-flex items-center gap-2 bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm px-4 py-2.5 rounded-xl hover:brightness-95 transition">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20l1.3-5.1A8.4 8.4 0 1 1 21 11.5z" /></svg>
            WhatsApp {CONTACT.whatsapp}
          </a>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mx-4 md:mx-10 lg:mx-20" />

        <div className="px-4 md:px-10 lg:px-20 py-10 md:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.6fr] gap-10 lg:gap-12">
          <div className="flex flex-col gap-3 text-sm text-text-primary leading-relaxed">
            <h3 className="text-lg font-bold font-raleway">Contact</h3>
            <p>{CONTACT.legal}</p>
            <p>{CONTACT.phone}</p>
            <p>{CONTACT.email}</p>
            <p className="text-gray-700 dark:text-gray-300">Trip emergency line: {CONTACT.emergency}</p>
            <p className="text-gray-700 dark:text-gray-300">Staffed hours: {CONTACT.staffedHours}</p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold font-raleway text-text-primary mb-1">Travel</h3>
            {TRAVEL.map((l) => (
              <Link key={l.href} href={l.href} className="text-text-primary text-sm hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-bold font-raleway text-text-primary mb-1">Support</h3>
            {SUPPORT.map((l) => (
              <Link key={l.href} href={l.href} className="text-text-primary text-sm hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h3 className="text-lg font-bold font-raleway text-text-primary">December in Ghana Updates</h3>
            <p className="text-text-primary text-sm leading-relaxed">Dates, availability and offers, straight to your inbox.</p>
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden pr-1 bg-white dark:bg-gray-900 focus-within:border-primary transition-colors">
              <label htmlFor="footer-email" className="sr-only">Email address</label>
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 min-w-0 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none bg-transparent"
              />
              <button type="submit" disabled={isLoading} className="bg-primary text-white text-sm font-semibold font-montserrat px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50">
                {isLoading ? "…" : "Send"}
              </button>
            </div>
            <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-relaxed cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#BD8F3A]" />
              I agree to receive updates by email. Unsubscribe any time.
            </label>
            {message && (
              <p role="status" className={`text-xs font-medium ${message.type === "success" ? "text-green-700 dark:text-green-400" : "text-red-600"}`}>{message.text}</p>
            )}
          </form>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mx-4 md:mx-10 lg:mx-20" />
        <div className="px-4 md:px-10 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 dark:text-gray-300 text-xs">
            © {new Date().getFullYear()} Azura Travels. Prices in USD. <em className="font-cormorant text-sm text-[#8A6420] dark:text-[#C9A96E]">Medaase</em> for travelling with us.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {POLICIES.map((l) => (
              <Link key={l.href} href={l.href} className="text-gray-700 dark:text-gray-300 text-xs hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
