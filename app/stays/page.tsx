import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import accraNight from "../../assets/images/services/osu.png";
import crownForest from "../../assets/images/hero.png";
import PageHero from "@/components/ghana/PageHero";
import SectionHeading from "@/components/ghana/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import StayCard from "@/components/ghana/StayCard";
import { Accent, Eyebrow } from "@/components/ghana/Decor";
import { getFlagship } from "@/lib/content/server";

export const metadata: Metadata = {
  title: "Stays in Accra · Airbnb & Four Points | Azura Travels",
  description: "Airbnb units for five nights and Four Points rooms for four nights during the Ghana Experience 2027, priced per unit, not per person.",
};

const NOTES = [
  { title: "Arriving early or staying on?", text: "Extra nights aren't part of this package. Ask our team about arriving early or staying on." },
  { title: "Four Points and the Crown Forest night", text: "Four Points is booked for 6 January and 8 to 10 January. Re-check-in and baggage handling around the Crown Forest night are still being confirmed with the hotel." },
  { title: "Just the Airbnb?", text: "Coming to Accra but not the event? Book an Airbnb on its own for the same dates. Four Points rooms come with the Ghana Experience." },
];

export default async function StaysPage() {
  const { detail, matrix } = await getFlagship();
  // Live price list only: if it can't be loaded, no prices are shown.
  const stays = matrix?.stay_types ?? [];
  const bookHref = detail ? `/tour/${detail.id}/build` : "/ghana-experience-2027/build";
  const cards = (kind: "airbnb" | "hotel") => stays.filter((x) => x.kind === kind).map((s, i) => (
    <StayCard key={s.code} s={s} currency={matrix!.currency} href={bookHref} detailed delay={(i % 2) * 90} />
  ));
  const unavailable = <p className="text-sm text-gray-700 dark:text-gray-300">Stays and rates are loading. Please refresh in a moment.</p>;
  return (
    <main className="w-full bg-background">
      <PageHero
        image={accraNight}
        alt="Accra skyline at night"
        eyebrow="Accra · 6–11 January 2027"
        title={<>Where You&apos;ll <Accent>Stay</Accent></>}
        subtitle="Airbnb is a five-night block, 6 to 11 January, kept for you on the Crown Forest night. Four Points is four nights around it. Each unit or room is priced once, not per person."
      />

      <section className="px-4 md:px-10 lg:px-20 pt-6 pb-10">
        <SectionHeading eyebrow="First choice" title="Airbnb" intro="Five nights, 6 to 11 January. The unit stays yours on the Crown Forest night for continuity and luggage." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stays.length ? cards("airbnb") : unavailable}
        </div>
        {stays.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary/5 px-6 py-5">
            <div className="flex flex-col gap-1">
              <span className="font-raleway font-bold text-text-primary">Not coming to the event?</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">Book an Airbnb on its own for 6 to 11 January, at the same nightly rate.</span>
            </div>
            <Link href={`${bookHref}?mode=stay`} className="rounded-xl bg-primary px-5 py-3 font-montserrat text-sm font-semibold text-white transition hover:brightness-95">Book a stay only</Link>
          </div>
        )}
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-10">
        <SectionHeading eyebrow="Hotel" title="Four Points by Sheraton" intro="Four paid nights: 6 January and 8 to 10 January. Rates are provisional, and couple rooms open once the shared rate is confirmed." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stays.length ? cards("hotel") : unavailable}
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
