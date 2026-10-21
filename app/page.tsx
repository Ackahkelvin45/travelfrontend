import { getSiteContact } from "@/lib/content/server";
import Image from "next/image";
import Link from "next/link";
import ghana from "../assets/images/ghana.png";
import wave from "../assets/images/image.png";
import crownForest from "../assets/images/hero.png";
import accraNight from "../assets/images/services/osu.png";
import guests from "../assets/images/trending/1.png";
import boats from "../assets/images/trending/2.png";
import Reveal from "../components/ui/Reveal";
import FlagshipBar from "../components/home/FlagshipBar";
import SeasonPackages from "../components/home/SeasonPackages";
import SectionHeading from "../components/ghana/SectionHeading";
import LeadForm from "../components/ghana/LeadForm";
import { Accent, BlackStar, Eyebrow, HeroCurve } from "../components/ghana/Decor";
import { STAYS, TRIP } from "@/lib/content/site";

const PLACES = [
  { img: accraNight, alt: "Accra skyline at night", when: "December", name: "Accra After Dark", note: "Detty December nights, concerts and homecomings", span: "md:col-span-7 md:row-span-2", big: true },
  { img: crownForest, alt: "Crown Forest lodge at sunset", when: "Thu 7 Jan", name: "Crown Forest", note: "One night included, with activities and breakfast", span: "md:col-span-5" },
  { img: boats, alt: "Guests on pedal boats", when: "Fri 8 Jan", name: "Forest Activities", note: "Crown Forest activities and breakfast, then back to Accra", span: "md:col-span-5" },
  { img: null, alt: "", when: "Thu 7 Jan", name: "Cape Coast", note: "Castle, Academy and Lemon Beach · photo to supply", span: "md:col-span-6" },
  { img: null, alt: "", when: "Sat 9 Jan", name: "Aburi & Oboadaka Falls", note: "Waterfalls, Aburi and Peduase · photo to supply", span: "md:col-span-6", green: true },
];

const STEPS = [
  { n: "1", img: guests, tag: `$${TRIP.corePrice} per traveller`, title: "Who's Travelling", text: "Single, Couple or Group. Every guest holds one Core ticket, with the Crown Forest night included." },
  { n: "2", img: accraNight, tag: "Save 3–5%", title: "Where You Stay", text: "Airbnb from $220 or Four Points from $330 a night, for four Accra nights. Or arrange your own." },
  { n: "3", img: boats, tag: "Save 5% on all three", title: "What You Add", text: "ENZO VIP, Waterfall Massage and the farewell dinner, chosen guest by guest." },
];

const WHY = [
  { title: "Cultural Authenticity", text: "Cape Coast, Aburi and Accra with people who know them, not surface-level tourism.", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" },
  { title: "Stays You Choose", text: "Airbnb units or Four Points rooms, priced once per unit, never per head.", d: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" },
  { title: "A Coordinator for Every Booking", text: "A named coordinator contacts you within 24 hours of payment to confirm every detail.", d: "M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" },
  { title: "Clear Pricing", text: "See every ticket, room, experience and saving before you pay. No hidden extras.", d: "M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8.5 14 7 22l5-3 5 3-1.5-8" },
];

export default async function Home() {
  const contact = await getSiteContact();
  return (
    <div className="flex w-full bg-background flex-col overflow-hidden">
      {/* Hero */}
      <section className="w-full px-4 md:px-10 pt-24 md:pt-28 relative">
        <div className="relative overflow-hidden rounded-t-xl min-h-[600px] md:min-h-[640px]">
          <Image src={ghana} alt="Black Star Gate, Independence Square, Accra" fill priority sizes="100vw" className="object-cover hero-zoom" style={{ objectPosition: "center 30%" }} />
          <div className="absolute inset-0 bg-black/45" />
          <HeroCurve />
          <div className="relative z-2 min-h-[600px] md:min-h-[640px] flex flex-col items-center justify-center text-center text-white px-4 pt-10 pb-40">
            <Reveal><BlackStar size={44} spin className="mb-3" /></Reveal>
            <Reveal delay={100}><Eyebrow light>Akwaaba · Welcome to Ghana</Eyebrow></Reveal>
            <Reveal delay={220}>
              <h1 className="mt-3 font-raleway font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
                Experience December<br /><Accent>in Ghana.</Accent>
              </h1>
            </Reveal>
            <Reveal delay={300}><Image src={wave} alt="" className="w-28 md:w-44 h-auto mt-4" /></Reveal>
            <Reveal delay={360}>
              <p className="mt-4 font-open-sans text-base md:text-lg max-w-2xl leading-relaxed text-white/90">
                Festive travel across Accra, then the {TRIP.name} as our flagship January extension, {TRIP.dates}.
              </p>
            </Reveal>
            <Reveal delay={440}>
              <Link href="/december-in-ghana" className="inline-block mt-6 bg-primary text-white font-montserrat font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">
                Experience December in Ghana
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="relative z-10 -mt-16 md:-mt-20 max-w-4xl mx-auto">
          <Reveal variant="scale" delay={500}><FlagshipBar /></Reveal>
        </div>
      </section>

      {/* Your Ghana */}
      <section className="w-full px-4 md:px-10 lg:px-20 pt-16 md:pt-24 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 lg:items-end mb-8">
          <Reveal className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3"><span aria-hidden="true" className="kente w-12 h-2 rounded-sm" /><Eyebrow>Your Ghana</Eyebrow></div>
            <h2 className="font-raleway font-bold text-3xl md:text-4xl text-text-primary leading-tight">
              From Accra&apos;s December nights <span className="text-[#8A6420] dark:text-[#C9A96E]"><Accent>to the forest and the coast.</Accent></span>
            </h2>
          </Reveal>
          <Reveal delay={100} className="flex-1">
            <p className="font-open-sans text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Akwaaba. December is when Ghana comes alive: homecomings, concerts, beach days and late nights in Accra. Our flagship trip then takes you to Cape Coast, Crown Forest and the Aburi hills.
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[220px] md:auto-rows-[240px] gap-4">
          {PLACES.map((p, i) => (
            <Reveal key={p.name} delay={i * 70} className={`card-lift relative rounded-2xl overflow-hidden ${p.span} ${p.green ? "bg-[#173F2C]" : "bg-[#060504]"}`}>
              {p.img ? (
                <>
                  <Image src={p.img} alt={p.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="img-zoom object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                </>
              ) : (
                <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-20">
                  <defs><pattern id={`adinkra-${i}`} width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="#BD8F3A" strokeWidth="2" /><circle cx="20" cy="20" r="4" fill="#BD8F3A" /></pattern></defs>
                  <rect width="100%" height="100%" fill={`url(#adinkra-${i})`} />
                </svg>
              )}
              <div className="absolute left-5 right-5 bottom-5 text-white flex flex-col gap-1">
                <span className="font-montserrat text-[11px] font-bold uppercase tracking-[0.2em] text-[#E9D3A3]">{p.when}</span>
                <span className={`font-raleway font-bold ${p.big ? "text-2xl md:text-3xl" : "text-xl"}`}>{p.name}</span>
                <span className="text-sm text-gray-200">{p.note}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <SeasonPackages />

      {/* How booking works */}
      <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <SectionHeading
          eyebrow="How booking works"
          title={<>Your Trip, <Accent>Your Way</Accent></>}
          intro="Three choices, one clear price. Savings apply automatically."
          action={<Link href="/ghana-experience-2027" className="self-start sm:self-auto bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">Build your trip</Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <Link href="/ghana-experience-2027" className="card-lift relative block h-[440px] md:h-[480px] rounded-2xl overflow-hidden bg-[#060504] text-white">
                <Image src={s.img} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="img-zoom object-cover" />
                <span className="absolute top-5 right-5 bg-primary font-montserrat text-xs font-bold px-3 py-1.5 rounded-full">{s.tag}</span>
                <div className="absolute inset-x-3.5 bottom-3.5 bg-black/70 backdrop-blur-md rounded-xl p-5 flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <em className="font-cormorant italic font-semibold text-5xl leading-[0.8] text-[#C9A96E]">{s.n}</em>
                    <span className="font-raleway font-bold text-xl">{s.title}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">{s.text}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stays */}
      <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Stays in Accra"
          title="Airbnb First, Four Points if You Prefer a Hotel"
          action={<Link href="/stays" className="self-start sm:self-auto border border-text-primary text-text-primary px-6 py-2.5 rounded-xl text-sm font-semibold font-montserrat hover:bg-text-primary hover:text-background transition-colors">Compare stays</Link>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STAYS.slice(0, 3).map((s, i) => (
            <Reveal key={s.key} delay={i * 70}>
              <Link href="/stays" className="card-lift flex flex-col gap-2 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 h-full">
                <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#8A6420] dark:text-[#C9A96E]">{s.tier}</span>
                <span className="font-raleway font-bold text-lg text-text-primary">{s.name}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{s.guests} · {s.note}</span>
                <span className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300">
                  <strong className="font-montserrat text-xl text-text-primary">USD {s.price}</strong> per night
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <Reveal><h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">Why Choose AzuraTravel?</h2></Reveal>
        <Reveal delay={80}>
          <p className="mt-4 font-open-sans text-base text-text-primary max-w-4xl leading-relaxed">
            At the heart of Azuratravels lies a commitment to extraordinary experiences that celebrate Ghana&apos;s culture, lifestyle and heritage, from Detty December in Accra to the forests and coast beyond.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 80} className="flex flex-col gap-4">
              <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BD8F3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={w.d} /></svg>
              <span className="font-raleway font-bold text-text-primary">{w.title}</span>
              <p className="font-open-sans text-text-primary leading-relaxed">{w.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Questions + lead capture */}
      <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <Reveal className="border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-8 md:p-12 flex flex-col gap-4">
            <Eyebrow>Questions before you book</Eyebrow>
            <h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary leading-snug">Ask our assistant any time, or message a real person</h2>
            <p className="font-open-sans text-gray-700 dark:text-gray-300 leading-relaxed">
              Quick answers on prices, dates and stays are always available. Anything else goes to our team, who reply within one business hour during {contact.staffedHours} and within 24 hours otherwise.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/faqs" className="bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">Read the FAQs</Link>
              <a href={contact.whatsappHref} className="bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:brightness-95 transition">WhatsApp {contact.whatsapp}</a>
            </div>
          </div>
          <div className="flex-1 bg-[#FAF5EB] dark:bg-gray-900 p-8 md:p-12">
            <LeadForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
