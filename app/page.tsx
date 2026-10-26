import { getFlagship, getFlagshipFacts, getSiteContact } from "@/lib/content/server";
import type { FlagshipFacts } from "@/lib/content/flagship";
import Image from "next/image";
import Link from "next/link";
import ghana from "../assets/images/ghana.png";
import wave from "../assets/images/image.png";
import crownForest from "../assets/images/hero.png";
import accraNight from "../assets/images/services/osu.png";
import guests from "../assets/images/trending/1.png";
import boats from "../assets/images/trending/2.png";
import botiFalls from "../assets/images/places/boti-falls.jpg";
import capeCoast from "../assets/images/places/cape-coast-castle.jpg";
import Reveal from "../components/ui/Reveal";
import SeasonPackages from "../components/home/SeasonPackages";
import SectionHeading from "../components/ghana/SectionHeading";
import StayCard from "../components/ghana/StayCard";
import LeadForm from "../components/ghana/LeadForm";
import { Accent, Eyebrow } from "../components/ghana/Decor";

// Highlights of the 6–11 January programme (Change Request v4 §3).
const PLACES = [
  { img: accraNight, alt: "Accra skyline at night", when: "Sun 10 Jan", name: "Accra City Tour", note: "National Museum, Kwame Nkrumah Mausoleum and Arts Centre, with lunch and the farewell dinner included", span: "md:col-span-7 md:row-span-2", big: true },
  { img: capeCoast, alt: "Cape Coast Castle's white walls and courtyard", when: "Thu 7 Jan", name: "Cape Coast", note: "Castle, Academy and Lemon Beach", span: "md:col-span-5" },
  { img: crownForest, alt: "Crown Forest lodge at sunset", when: "Thu 7 Jan", name: "Crown Forest", note: "One night included, with activities and breakfast", span: "md:col-span-5" },
  { img: boats, alt: "Guests on pedal boats", when: "Fri 8 Jan", name: "Forest Activities", note: "Crown Forest activities and breakfast, then back to Accra", span: "md:col-span-6" },
  { img: botiFalls, alt: "Boti Falls pouring over a forested cliff", when: "Sat 9 Jan", name: "Boti Falls", note: "Group excursion, optional waterfall massage", span: "md:col-span-6", green: true },
];

const NIGHTS = ["zero", "one", "two", "three", "four", "five", "six", "seven"];
const steps = (f: FlagshipFacts) => [
  { n: "1", img: guests, tag: f.corePrice ? `${f.corePrice} per traveller` : "One Core ticket each", title: "Who's Travelling", text: "Single, Couple or Group. Every guest holds one Core ticket, with the Crown Forest night included." },
  { n: "2", img: accraNight, tag: "Priced per unit", title: "Where You Stay", text: [
      f.airbnbFrom && `A ${NIGHTS[f.airbnbFrom.nights] ?? f.airbnbFrom.nights}-night Airbnb from ${f.airbnbFrom.price}`,
      f.hotelFrom && `${NIGHTS[f.hotelFrom.nights] ?? f.hotelFrom.nights} nights at Four Points from ${f.hotelFrom.price}`,
    ].filter(Boolean).join(" or ").replace(/^./, (c) => c.toUpperCase()).concat(f.airbnbFrom || f.hotelFrom ? ", charged once per unit. Or arrange your own." : "An Airbnb or Four Points, charged once per unit. Or arrange your own.") },
  { n: "3", img: boats, tag: "Guest by guest", title: "What You Add", text: "ENZO VIP, a waterfall massage and airport transfers, chosen guest by guest. The farewell dinner is already included." },
];

const WHY = [
  { title: "Stays You Choose", text: "Airbnb units or Four Points rooms, priced once per unit, never per head.", d: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" },
  { title: "Contact Within 24 Hours", text: "Our team contacts the lead guest within 24 hours of confirmed payment. Groups of 10 or more get a named coordinator.", d: "M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z" },
  { title: "Clear Pricing", text: "See every ticket, room and experience, what is due now and the balance, before you pay.", d: "M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8.5 14 7 22l5-3 5 3-1.5-8" },
];

/** The placeholder mark for a stay without photos: a house for an Airbnb, a
 *  building for the hotel, in the brand gold. */
export default async function Home() {
  const [contact, facts, { matrix }] = await Promise.all([getSiteContact(), getFlagshipFacts(), getFlagship()]);
  // Live stays only: no prices are shown unless they come from the price list.
  const stays = (matrix?.stay_types ?? []).filter((s) => s.on_sale && !s.stay_only).slice(0, 3);
  return (
    <div className="flex w-full bg-background flex-col overflow-hidden">
      {/* Hero */}
      <section className="w-full px-4 md:px-10 pt-24 md:pt-28 relative">
        <div className="relative overflow-hidden rounded-2xl min-h-[640px] md:min-h-[700px]">
          <Image src={ghana} alt="Black Star Gate, Independence Square, Accra" fill priority sizes="100vw" className="object-cover hero-zoom" style={{ objectPosition: "center 30%" }} />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-2 min-h-[640px] md:min-h-[700px] flex flex-col items-center justify-center text-center text-white px-4 py-16">
            <Reveal delay={100}><Eyebrow light>Akwaaba · Welcome to Ghana</Eyebrow></Reveal>
            <Reveal delay={220}>
              <h1 className="mt-3 font-raleway font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
                Experience December<br /><Accent>in Ghana.</Accent>
              </h1>
            </Reveal>
            <Reveal delay={300}><Image src={wave} alt="" className="w-28 md:w-44 h-auto mt-4" /></Reveal>
            <Reveal delay={360}>
              <p className="mt-8 md:mt-10 font-open-sans text-base md:text-lg max-w-2xl leading-relaxed text-white/90">
                Ghana experiences from Azura Travels, featuring the {facts.name}, {facts.dates}.
              </p>
            </Reveal>
            <Reveal delay={440}>
              <Link href="/december-in-ghana" className="inline-block mt-8 md:mt-10 bg-primary text-white font-montserrat font-semibold px-7 py-3.5 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">
                Experience December in Ghana
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Your Ghana */}
      <section className="w-full px-4 md:px-10 lg:px-20 pt-16 md:pt-24 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 lg:items-end mb-8">
          <Reveal className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3"><span aria-hidden="true" className="kente w-12 h-2 rounded-sm" /><Eyebrow>Your Ghana</Eyebrow></div>
            <h2 className="font-raleway font-bold text-3xl md:text-4xl text-text-primary leading-tight">
              From Accra <span className="text-[#8A6420] dark:text-[#C9A96E]"><Accent>to the forest and the coast.</Accent></span>
            </h2>
          </Reveal>
          <Reveal delay={100} className="flex-1">
            <p className="font-open-sans text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Akwaaba. The {facts.name} takes you from Accra to Cape Coast, the Michael Blackson Academy, Crown Forest and Boti Falls.
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
          intro="Three choices, one clear price. Every guest's share is shown."
          action={<Link href="/ghana-experience-2027/build" className="self-start sm:self-auto bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">Build your trip</Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps(facts).map((s, i) => (
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
      {stays.length > 0 && (
      <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Stays in Accra"
          title="Airbnb First, Four Points if You Prefer a Hotel"
          action={<Link href="/stays" className="self-start sm:self-auto border border-text-primary text-text-primary px-6 py-2.5 rounded-xl text-sm font-semibold font-montserrat hover:bg-text-primary hover:text-background transition-colors">Compare stays</Link>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stays.map((s, i) => (
            <StayCard key={s.code} s={s} currency={matrix!.currency} href="/stays" delay={i * 80} />
          ))}
        </div>
      </section>
      )}

      {/* Why */}
      <section className="w-full px-4 md:px-10 lg:px-20 py-12 md:py-16">
        <Reveal><h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">Why Choose AzuraTravel?</h2></Reveal>
        <Reveal delay={80}>
          <p className="mt-4 font-open-sans text-base text-text-primary max-w-4xl leading-relaxed">
            Azura Travels is a Ghana experiences company, from December in Ghana to the Michael Blackson Ghana Experience in January.
          </p>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
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
              Quick answers on prices, dates and stays are always available. Anything else goes to our team during {contact.staffedHours}.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/faqs" className="bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">Read the FAQs</Link>
              {contact.whatsappDigits && <a href={contact.whatsappHref} className="bg-[#25D366] text-[#06290F] font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:brightness-95 transition">WhatsApp {contact.whatsapp}</a>}
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
