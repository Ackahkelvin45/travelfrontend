import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import accraNight from "../../assets/images/services/osu.png";
import guests from "../../assets/images/trending/1.png";
import PageHero from "@/components/ghana/PageHero";
import SectionHeading from "@/components/ghana/SectionHeading";
import SeasonOfferings from "@/components/ghana/SeasonOfferings";
import LeadForm from "@/components/ghana/LeadForm";
import Reveal from "@/components/ui/Reveal";
import { Accent, Eyebrow } from "@/components/ghana/Decor";
import { TRIP } from "@/lib/content/site";
import { getFlagshipFacts } from "@/lib/content/server";

export const metadata: Metadata = {
  title: "Experience December in Ghana | Azura Travels",
  description: "Every Azura offering for December in Ghana, and the Michael Blackson Ghana Experience, 6–11 January 2027, in one place.",
};

export default async function DecemberInGhanaPage() {
  const facts = await getFlagshipFacts();
  return (
    <main className="w-full bg-background">
      <PageHero
        image={accraNight}
        alt="Accra skyline at night"
        eyebrow="December 2026 – January 2027"
        title={<>Experience December <Accent>in Ghana</Accent></>}
        subtitle="Every Azura offering for December in Ghana, and the Michael Blackson Ghana Experience in January, in one place."
      />

      <section className="px-4 md:px-10 lg:px-20 pt-6 pb-12">
        <SectionHeading eyebrow="On sale now" title="Our Offerings" />
        <SeasonOfferings />
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-12">
        <Reveal className="card-lift flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="relative lg:w-1/2 min-h-[300px] overflow-hidden">
            <Image src={guests} alt="Guests on the Ghana Experience" fill sizes="(max-width: 1024px) 100vw, 50vw" className="img-zoom object-cover" />
            <span className="absolute top-4 left-4 bg-primary text-white font-montserrat text-xs font-bold px-3 py-1.5 rounded-full">January extension</span>
          </div>
          <div className="lg:w-1/2 p-8 md:p-10 flex flex-col gap-4">
            <Eyebrow>{facts.dates}</Eyebrow>
            <h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">{facts.name}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              A welcome dinner with Michael, Cape Coast Castle and the Academy, a night at Crown Forest, Boti Falls, an Accra city tour and the farewell dinner.
            </p>
            <div className="flex flex-wrap gap-2">
              {[TRIP.nights, "Airbnb or Four Points", "Experiences per guest"].map((t) => (
                <span key={t} className="bg-[#FAF5EB] text-[#6B4E1A] text-sm px-3 py-1.5 rounded-full">{t}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-auto border-t border-gray-100 dark:border-gray-800">
              {facts.corePrice ? (
                <span className="text-sm text-gray-700 dark:text-gray-300">From <strong className="font-montserrat text-xl text-text-primary">{facts.corePrice}</strong> per traveller</span>
              ) : <span />}
              <Link href="/ghana-experience-2027" className="bg-primary text-white font-montserrat font-semibold text-sm px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:brightness-95 transition-all">View the trip</Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-12">
        <Reveal className="flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="flex-1 p-8 md:p-12 flex flex-col gap-4">
            <Eyebrow>Save your spot</Eyebrow>
            <h2 className="font-raleway font-bold text-2xl md:text-3xl text-text-primary">Not Ready to Book?</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Leave your email and we&apos;ll send dates and availability. We only message you if you agree, and you can opt out any time.
            </p>
          </div>
          <div className="flex-1 bg-[#FAF5EB] dark:bg-gray-900 p-8 md:p-12">
            <LeadForm title="Send me December details" cta="Send me details" />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
