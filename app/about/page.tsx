import type { Metadata } from "next";
import { getSiteContact } from "@/lib/content/server";
import Link from "next/link";
import ghana from "../../assets/images/ghana.png";
import PageHero from "@/components/ghana/PageHero";
import SectionHeading from "@/components/ghana/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { Accent, Eyebrow } from "@/components/ghana/Decor";
import { EXCLUDED, INCLUDED } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "About Azura Travels · Contact & Policies",
  description: "Azura Travels was founded in Accra to share Ghana's culture, lifestyle and heritage. Contact details, support hours and policies.",
};

const VALUES = [
  { title: "Cultural Authenticity", text: "Every journey is grounded in Ghana's heritage. We go beyond surface-level tourism to create experiences that mean something." },
  { title: "Diaspora Bridge", text: "We help the global African diaspora reconnect with Ghana through meaningful, immersive homecoming experiences." },
  { title: "People First", text: "Local guides, a named coordinator for every booking and partner communities are at the heart of what we do." },
];


const POLICIES = [
  { href: "/terms-and-conditions", title: "Terms and Conditions", text: "The approved terms you accept at checkout. The version is recorded with your booking." },
  { href: "/refund-policy", title: "Cancellation & Refunds", text: "How cancellations, refunds and shared-room changes work." },
  { href: "/installment-policy", title: "Payments & Deposits", text: "Deposits, instalments and the final balance date. You always see what's due now." },
  { href: "/privacy-policy", title: "Privacy Notice", text: "We collect only what the trip needs. Marketing and photo consent are optional and separate." },
];

export default async function AboutPage() {
  const contact = await getSiteContact();
  const CONTACTS = [
  { label: "Email", value: contact.email, note: "Bookings, quotes and documents.", href: null },
  { label: "WhatsApp", value: contact.whatsapp, note: "Message a person during staffed hours.", href: contact.whatsappHref },
  { label: "Phone", value: contact.phone, note: "Include your country code when calling.", href: null },
  { label: "Trip emergency line", value: contact.emergency, note: "For guests on the trip, 6 to 11 January.", href: null },
];
  return (
    <main className="w-full bg-background">
      <PageHero
        image={ghana}
        alt="Black Star Gate, Accra"
        objectPosition="center 30%"
        eyebrow="About Azura Travels"
        title={<>Ghana, <Accent>curated for you.</Accent></>}
        subtitle="Founded in Accra to share the depth, vibrancy and living heritage of Ghana with travellers from around the world."
      />

      <section className="px-4 md:px-10 lg:px-20 pt-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <Reveal className="flex flex-col gap-4">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">Born in Accra</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Azura Travels was founded in Accra with a simple belief: Ghana&apos;s beauty, culture and spirit deserve to be experienced in full, not sampled from a distance.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            We are not a mass-market travel agency. We are curators, storytellers and connectors, from Detty December in Accra to Cape Coast, Crown Forest and the Aburi hills.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 80} className="card-lift border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900">
              <span className="font-raleway font-bold text-primary">{v.title}</span>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contact" className="px-4 md:px-10 lg:px-20 py-12 scroll-mt-28">
        <SectionHeading eyebrow="Contact" title="Talk to Us" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.label} delay={i * 70} className="card-lift border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 flex flex-col gap-2">
              <span className="font-raleway font-bold text-text-primary">{c.label}</span>
              {c.href ? <a href={c.href} className="font-semibold text-primary">{c.value}</a> : <span className="font-semibold text-text-primary">{c.value}</span>}
              <span className="text-sm text-gray-700 dark:text-gray-300">{c.note}</span>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-5 bg-[#FAF5EB] dark:bg-gray-900 rounded-2xl px-6 py-5 flex flex-wrap gap-x-10 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
          <span><strong className="text-text-primary">Staffed hours:</strong> {contact.staffedHours}</span>
          <span><strong className="text-text-primary">Reply time:</strong> within 1 business hour when staffed, within 24 hours otherwise</span>
          <span><strong className="text-text-primary">Operator:</strong> {contact.legal}</span>
        </Reveal>
      </section>

      <section id="policies" className="px-4 md:px-10 lg:px-20 py-12 scroll-mt-28">
        <SectionHeading eyebrow="Before you book" title="What's Included & Our Policies" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Reveal className="rounded-2xl border border-green-100 bg-green-50/60 dark:bg-green-950/20 dark:border-green-900 p-6">
            <h3 className="font-raleway font-bold text-lg text-text-primary mb-3">Included in Core</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">{INCLUDED.map((x) => <li key={x}>{x}</li>)}</ul>
          </Reveal>
          <Reveal delay={80} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">
            <h3 className="font-raleway font-bold text-lg text-text-primary mb-3">Not included</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">{EXCLUDED.map((x) => <li key={x}>{x}</li>)}</ul>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POLICIES.map((p, i) => (
            <Reveal key={p.href} delay={i * 70}>
              <Link href={p.href} className="card-lift group flex flex-col gap-2 h-full border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900">
                <span className="font-raleway font-bold text-text-primary group-hover:text-primary transition-colors">{p.title}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{p.text}</span>
                <span className="mt-auto pt-2 text-sm font-semibold text-primary">Read policy →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
