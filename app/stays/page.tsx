import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import accraNight from "../../assets/images/services/osu.png";
import crownForest from "../../assets/images/hero.png";
import PageHero from "@/components/ghana/PageHero";
import SectionHeading from "@/components/ghana/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { Accent, BlackStar, Eyebrow } from "@/components/ghana/Decor";
import { STAYS, type Stay } from "@/lib/content/site";
import { getFlagship } from "@/lib/content/server";
import type { ComponentMatrix } from "@/lib/api/packagesApi";

type LiveStay = Stay & { soldOut?: boolean };

/** Live stay types from the price list; meal notes stay editorial. */
function fromMatrix(m: ComponentMatrix): LiveStay[] {
  return m.stay_types.map((t) => ({
    key: t.code,
    tier: t.kind === "airbnb" ? "Airbnb" : "Hotel",
    name: t.name,
    guests: t.capacity === 1 ? "1 guest, private room" : t.min_occupancy >= 2 ? `${t.capacity} guests sharing` : `Up to ${t.capacity} guests`,
    price: parseFloat(t.price_per_night),
    note: t.note || (t.kind === "hotel" ? "Breakfast to be confirmed" : ""),
    status: t.on_sale ? "live" : "tbc",
    soldOut: t.on_sale && t.units_available === 0,
    nights: t.nights,
    bedding: t.bedding, breakfast: t.breakfast, location: t.location, amenities: t.amenities, images: t.images,
  }));
}

export const metadata: Metadata = {
  title: "Stays in Accra · Airbnb & Four Points | Azura Travels",
  description: "Airbnb units for five nights and Four Points rooms for four nights during the Ghana Experience 2027, priced per unit, not per person.",
};

const NOTES = [
  { title: "Arriving early or staying on?", text: "Extra nights aren't part of this package. Ask our team about arriving early or staying on." },
  { title: "Four Points and the Crown Forest night", text: "Four Points is booked for 6 January and 8 to 10 January. Re-check-in and baggage handling around the Crown Forest night are still being confirmed with the hotel." },
  { title: "Every guest holds Core", text: "Each person in a room needs a Core ticket. Rooms are not sold on their own." },
];

function StayCard({ s, i, bookHref }: { s: LiveStay; i: number; bookHref: string }) {
  const nights = s.nights;
  const tbc = s.status === "tbc";
  return (
    <Reveal delay={(i % 2) * 90} className="h-full">
      <div className={`card-lift h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-md ${tbc ? "opacity-90" : ""}`}>
        {s.images?.length ? (
          <div className="h-56 flex overflow-x-auto snap-x snap-mandatory" tabIndex={0} aria-label={`${s.name} photos, scroll for more`}>
            {s.images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded media served by the API
              <img key={img.url} src={img.url} alt={img.alt} loading="lazy" className="h-56 w-full shrink-0 snap-center object-cover" />
            ))}
          </div>
        ) : (
          <div className="h-56 bg-[#FAF5EB] dark:bg-gray-800 flex flex-col items-center justify-center gap-2 text-[#8A6420]">
            <BlackStar size={36} />
            <span className="text-xs font-semibold">Photos coming soon</span>
          </div>
        )}
        <div className="p-6 flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#8A6420] dark:text-[#C9A96E]">{s.tier}</span>
            {tbc && <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full">Awaiting confirmation</span>}
            {s.soldOut && <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">Sold out</span>}
          </div>
          <h3 className="font-raleway font-bold text-xl text-text-primary">{s.name}</h3>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#FAF5EB] text-[#6B4E1A] text-xs px-3 py-1.5 rounded-full">{s.guests}</span>
            {s.note && <span className="bg-[#FAF5EB] text-[#6B4E1A] text-xs px-3 py-1.5 rounded-full">{s.note}</span>}
          </div>
          {s.bedding || s.breakfast || s.location || s.amenities?.length ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              {s.bedding && <><dt className="font-semibold text-text-primary">Bedding</dt><dd>{s.bedding}</dd></>}
              {s.breakfast && <><dt className="font-semibold text-text-primary">Breakfast</dt><dd>{s.breakfast}</dd></>}
              {s.location && <><dt className="font-semibold text-text-primary">Location</dt><dd>{s.location}</dd></>}
              {!!s.amenities?.length && <><dt className="font-semibold text-text-primary">Amenities</dt><dd>{s.amenities.join(" · ")}</dd></>}
            </dl>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">Room details and photos are being confirmed with the property.</p>
          )}
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="font-montserrat text-xl text-text-primary">USD {s.price}</strong> / night · USD {(s.price * nights).toLocaleString("en-US")} for {nights} nights
            </span>
            {!tbc && !s.soldOut && (
              <Link href={bookHref} className="bg-primary text-white font-montserrat font-semibold text-sm px-4 py-2.5 rounded-xl hover:brightness-95 transition">Book</Link>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default async function StaysPage() {
  const { detail, matrix } = await getFlagship();
  const stays: LiveStay[] = matrix ? fromMatrix(matrix) : STAYS;
  const bookHref = detail ? `/tour/${detail.id}/build` : "/ghana-experience-2027/build";
  const tier = (t: Stay["tier"]) => stays.filter((x) => x.tier === t);
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
          {tier("Airbnb").map((s, i) => <StayCard key={s.key} s={s} i={i} bookHref={bookHref} />)}
        </div>
      </section>

      <section className="px-4 md:px-10 lg:px-20 py-10">
        <SectionHeading eyebrow="Hotel" title="Four Points by Sheraton" intro="Four paid nights: 6 January and 8 to 10 January. Rates are provisional, and couple rooms open once the shared rate is confirmed." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tier("Hotel").map((s, i) => <StayCard key={s.key} s={s} i={i} bookHref={bookHref} />)}
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
