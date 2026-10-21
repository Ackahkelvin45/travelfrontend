import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import accraNight from "../../assets/images/services/osu.png";
import crownForest from "../../assets/images/hero.png";
import PageHero from "@/components/ghana/PageHero";
import SectionHeading from "@/components/ghana/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { Accent, BlackStar, Eyebrow } from "@/components/ghana/Decor";
import { STAYS } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Stays in Accra · Airbnb & Four Points | Azura Travels",
  description: "Airbnb units and Four Points rooms for the four Accra nights of the Ghana Experience 2027, priced per unit per night.",
};

const NOTES = [
  { title: "Arriving early or staying on?", text: "Extra nights, including a Tuesday arrival, are booked separately once rates are confirmed." },
  { title: "Moving between stays", text: "Property continuity, baggage handling and check-in for the split stay: [TO BE CONFIRMED]." },
  { title: "Every guest holds Core", text: "Each person in a room needs a Core ticket. Rooms are not sold on their own." },
];

function StayCard({ i }: { i: number }) {
  const s = STAYS[i];
  const tbc = s.status === "tbc";
  return (
    <Reveal delay={(i % 2) * 90} className="h-full">
      <div className={`card-lift h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-md ${tbc ? "opacity-90" : ""}`}>
        <div className="h-56 bg-[#FAF5EB] dark:bg-gray-800 flex flex-col items-center justify-center gap-2 text-[#8A6420]">
          <BlackStar size={36} />
          <span className="text-xs font-semibold">Approved photos to supply</span>
        </div>
        <div className="p-6 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#8A6420] dark:text-[#C9A96E]">{s.tier}</span>
            {tbc && <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">Awaiting confirmation</span>}
          </div>
          <h3 className="font-raleway font-bold text-xl text-text-primary">{s.name}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#FAF5EB] text-[#6B4E1A] text-xs px-3 py-1.5 rounded-full">{s.guests}</span>
            <span className="bg-[#FAF5EB] text-[#6B4E1A] text-xs px-3 py-1.5 rounded-full">{s.note}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">Location, amenities and bedding: [TO BE SUPPLIED]</p>
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="font-montserrat text-xl text-text-primary">USD {s.price}</strong> / night · USD {(s.price * 4).toLocaleString("en-US")} for 4 nights
            </span>
            {!tbc && (
              <Link href="/ghana-experience-2027" className="bg-primary text-white font-montserrat font-semibold text-sm px-4 py-2.5 rounded-xl hover:brightness-95 transition">Book</Link>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function StaysPage() {
  return (
    <main className="w-full bg-background">
      <PageHero
        image={accraNight}
        alt="Accra skyline at night"
        eyebrow="Accra · 6–11 January 2027"
        title={<>Where You&apos;ll <Accent>Stay</Accent></>}
        subtitle="Four Accra nights, split around the included Crown Forest night: 6 to 7 January, then 8 to 11 January. Each unit or room is priced once, not per person."
      />

      <section className="px-4 md:px-10 lg:px-20 pt-6 pb-10">
        <SectionHeading eyebrow="First choice" title="Airbnb" intro="3% off when booked with Core tickets. Airbnb meals are not included." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StayCard i={0} />
          <StayCard i={1} />
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-10">
        <SectionHeading eyebrow="Hotel" title="Four Points by Sheraton" intro="5% off when booked with Core tickets. Couple rooms open once the shared rate is confirmed." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StayCard i={2} />
          <StayCard i={3} />
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-10">
        <Reveal className="relative rounded-2xl overflow-hidden min-h-[340px] flex items-center">
          <Image src={crownForest} alt="Crown Forest lodge at sunset" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative p-8 md:p-12 max-w-xl text-white flex flex-col gap-3">
            <Eyebrow light>Thursday 7 January</Eyebrow>
            <h2 className="font-raleway font-bold text-3xl">Crown Forest Night, Included</h2>
            <p className="leading-relaxed text-white/90">Every Core ticket includes one night at Crown Forest with activities and breakfast. You don&apos;t pay Accra accommodation for this night.</p>
          </div>
        </Reveal>
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NOTES.map((n, i) => (
            <Reveal key={n.title} delay={i * 80} className="border-t-2 border-primary pt-5 flex flex-col gap-2">
              <span className="font-raleway font-bold text-text-primary">{n.title}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{n.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
