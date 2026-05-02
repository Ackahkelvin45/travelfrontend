import Link from "next/link";
import { type StaticImageData } from "next/image";
import nightlife from "../../assets/images/services/osu.png";
import culture from "../../assets/images/services/culture.png";
import food from "../../assets/images/services/food.jpeg";
import Image from "next/image";
import cooperate from "../../assets/images/cooperate.png";
import structure from "../../assets/images/structure.jpeg";

function imgUrl(image: string | StaticImageData): string {
  return typeof image === "string" ? image : image.src;
}

const services = [
  {
    label: "Luxury Travel Packages",
    description:
      "Curated multi-day itineraries with premium stays, seamless logistics, and full travel coordination.",
    image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80",
  },
  {
    label: "Nightlife & Entertainment",
    description:
      "VIP access to elite clubs, lounges, and exclusive events across major cities.",
    image: nightlife,
  },
  {
    label: "Cultural Immersion",
    description:
      "Heritage tours, storytelling, art, music, festivals, and community connection.",
    image: culture,
  },
  {
    label: "Culinary Experiences",
    description:
      "Fine dining reservations, food tours, and chef-led events celebrating local cuisine.",
    image: food,
  },
  {
    label: "Fashion & Lifestyle Access",
    description:
      "Exclusive access to local designers and fashion hubs, personalized styling and shopping experiences, and lifestyle events that celebrate African creativity and innovation.",
    image:structure,
  },
  {
    label: "Corporate & Group Experiences",
    description:
      "Tailored team retreats and executive travel programs, curated itineraries for corporate groups, and unique experiences designed to foster connection and collaboration.",
    image: cooperate,
  },
  
];

export default function OurServices() {
  const [s1, s2, s3, s4, s5, s6] = services;

  return (
    <section className="w-full px-4 md:px-10 lg:px-20 py-10 md:py-16 mt-20 md:mt-25 bg-[#fbfbfb]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold font-raleway text-text-primary">
            Our Services
          </h2>
          <p className="text-sm font-open-sans text-gray-600 mt-2">
            Azuratravels offers curated luxury across Africa — from seamless journeys and exclusive nightlife to cultural depth and exceptional dining.
          </p>
        </div>
        <Link
          href="/services"
          className="text-sm font-semibold font-montserrat text-text-primary underline underline-offset-2 hover:text-primary transition-colors"
        >
          See all
        </Link>
      </div>

      {/* Main grid — 4 cols × 2 rows (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 auto-rows-[250px] lg:auto-rows-auto lg:h-155">
        {/* Col 1, row 1 — Luxury Travel Packages */}
        <ServiceCard label={s1.label} image={s1.image} />

        {/* Col 2, rows 1–2 — Nightlife (featured tall) */}
        <div
          className="sm:row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ backgroundImage: `url(${imgUrl(s2.image)})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300" />
          <span className="absolute bottom-4 left-4 text-white text-lg font-semibold font-raleway drop-shadow">
            {s2.label}
          </span>
        </div>

        {/* Cols 3–4, row 1 — Cultural Immersion (wide) */}
        <div
          className="sm:col-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ backgroundImage: `url(${imgUrl(s3.image)})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300" />
          <span className="absolute bottom-4 left-4 text-white text-lg font-semibold font-raleway drop-shadow">
            {s3.label}
          </span>
        </div>

        {/* Col 1, row 2 — Culinary Experiences */}
        <ServiceCard label={s4.label} image={s4.image} />

        {/* Col 3, row 2 — Fashion & Lifestyle */}
        <ServiceCard label={s5.label} image={s5.image} />

        {/* Col 4, row 2 — Corporate & Group */}
        <ServiceCard label={s6.label} image={s6.image} />
      </div>

      {/* Full-width card — Bespoke Concierge Services */}
     
    </section>
  );
}

function ServiceCard({ label, image }: { label: string; image: string | StaticImageData }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{ backgroundImage: `url(${imgUrl(image)})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300" />
      <span className="absolute bottom-4 left-4 text-white text-base font-semibold font-raleway drop-shadow">
        {label}
      </span>
    </div>
  );
}
