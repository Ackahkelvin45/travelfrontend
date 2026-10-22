import type { Metadata } from "next";
import { getFlagship, getSiteContact } from "@/lib/content/server";
import Link from "next/link";
import FaqList from "@/components/ghana/FaqList";
import Reveal from "@/components/ui/Reveal";
import { Accent, Eyebrow } from "@/components/ghana/Decor";


export const metadata: Metadata = {
  title: "FAQs · Ghana Experience 2027 | Azura Travels",
  description: "Dates, inclusions, stays, prices, payments and travel questions about December in Ghana and the Ghana Experience 2027.",
};

export default async function FaqsPage() {
  const [contact, { detail }] = await Promise.all([getSiteContact(), getFlagship()]);
  const faqs = detail?.faqs.length
    ? detail.faqs.map((f) => ({ topic: f.topic || "General", q: f.question, a: f.answer }))
    : undefined;
  return (
    <main className="w-full bg-background pt-28 md:pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-10 flex flex-col lg:flex-row gap-12 items-start">
        <aside className="lg:w-1/3 lg:sticky lg:top-28 flex flex-col gap-4">
          <Reveal><Eyebrow>Help Center</Eyebrow></Reveal>
          <Reveal delay={100}>
            <h1 className="font-raleway font-bold text-4xl md:text-5xl text-text-primary leading-tight">Frequently Asked <Accent>Questions</Accent></h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Can&apos;t find your answer? Tap the chat button, or message the team{contact.whatsappDigits ? " on WhatsApp" : ""} during {contact.staffedHours}.
            </p>
          </Reveal>
          <Reveal delay={300} className="flex flex-col gap-2.5 pt-2">
            {contact.whatsappDigits && <a href={contact.whatsappHref} className="text-center bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm px-5 py-3 rounded-xl hover:brightness-95 transition">WhatsApp {contact.whatsapp}</a>}
            <Link href="/about#contact" className="text-center border border-text-primary text-text-primary font-montserrat font-semibold text-sm px-5 py-3 rounded-xl hover:bg-text-primary hover:text-background transition-colors">Contact us</Link>
          </Reveal>
        </aside>
        <div className="lg:w-2/3 w-full">
          <FaqList faqs={faqs} />
        </div>
      </div>
    </main>
  );
}
