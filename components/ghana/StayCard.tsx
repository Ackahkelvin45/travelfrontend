import Link from "next/link";
import type { ComponentMatrix } from "@/lib/api/packagesApi";
import { fmtMoney } from "@/lib/format";
import Reveal from "@/components/ui/Reveal";
import { BlackStar } from "./Decor";

type StayType = ComponentMatrix["stay_types"][number];

function StayIcon({ airbnb }: { airbnb: boolean }) {
  return (
    <svg aria-hidden="true" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="relative">
      {airbnb ? (
        <path d="M3 10.5 12 3l9 7.5M5 9v12h14V9M10 21v-6h4v6" />
      ) : (
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
      )}
    </svg>
  );
}

const chip = "inline-flex items-center gap-1.5 bg-[#FAF5EB] dark:bg-gray-800 text-[#6B4E1A] dark:text-[#C9A96E] text-xs font-semibold px-3 py-1.5 rounded-full";
const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
);

/**
 * One stay type from the live price list (prices and totals come from the API,
 * never computed here). Summary (home): the whole card links to `href`.
 * Detailed (Stays page): photo gallery, room details and status, with the
 * arrow as the Book button, shown only when the room can be booked.
 */
export default function StayCard({ s, currency, href, detailed = false, delay = 0 }: {
  s: StayType; currency: string; href: string; detailed?: boolean; delay?: number;
}) {
  const airbnb = s.kind === "airbnb";
  const awaiting = !s.on_sale;
  const soldOut = s.on_sale && s.units_available === 0;
  const bookable = !awaiting && !soldOut;
  const note = s.note || (detailed && !airbnb ? "Breakfast to be confirmed" : "");
  const photos = detailed ? s.images ?? [] : (s.images ?? []).slice(0, 1);
  const hasDetails = s.bedding || s.breakfast || s.location || s.amenities?.length;

  const body = (
    <>
      <div className="relative h-48 overflow-hidden">
        {photos.length > 1 ? (
          <div className="h-full flex overflow-x-auto snap-x snap-mandatory" tabIndex={0} aria-label={`${s.name} photos, scroll for more`}>
            {photos.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded media served by the API
              <img key={img.url} src={img.url} alt={img.alt || s.name} loading="lazy" className="h-full w-full shrink-0 snap-center object-cover" />
            ))}
          </div>
        ) : photos.length === 1 ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded media served by the API
          <img src={photos[0].url} alt={photos[0].alt || s.name} loading="lazy" className="img-zoom h-full w-full object-cover" />
        ) : (
          // No property photo yet: a branded panel, never a stand-in photo
          // that would suggest the unit looks like something it doesn't.
          <div className="h-full w-full bg-gradient-to-br from-[#2A1F0E] via-[#14100A] to-[#060504] flex items-center justify-center">
            <BlackStar size={140} className="absolute -right-6 -bottom-8 opacity-25" />
            <StayIcon airbnb={airbnb} />
          </div>
        )}
        <span className="absolute top-4 left-4 bg-white/95 text-[#6B4E1A] font-montserrat text-[0.6875rem] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
          {airbnb ? "Airbnb" : "Hotel"}
        </span>
        {(awaiting || soldOut) && (
          <span className="absolute top-4 right-4 bg-amber-100 text-amber-900 text-[0.6875rem] font-bold px-3 py-1.5 rounded-full shadow-sm">
            {awaiting ? "Awaiting confirmation" : "Sold out"}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col gap-4 flex-1">
        <h3 className="font-raleway font-bold text-xl text-text-primary leading-snug">{s.name}</h3>
        <div className="flex flex-wrap gap-2">
          <span className={chip}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg>
            {airbnb ? `Up to ${s.capacity} guests` : s.min_occupancy >= 2 ? `${s.capacity} guests sharing` : "Per room"}
          </span>
          <span className={chip}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            {s.nights} nights
          </span>
          {bookable && s.units_total > 0 && (
            <span className={chip}>{s.units_available} of {s.units_total} {airbnb ? "units" : "rooms"} left</span>
          )}
          {note && <span className={chip}>{note}</span>}
        </div>
        {detailed && (hasDetails ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm text-gray-700 dark:text-gray-300">
            {s.bedding && <><dt className="font-semibold text-text-primary">Bedding</dt><dd>{s.bedding}</dd></>}
            {s.breakfast && <><dt className="font-semibold text-text-primary">Breakfast</dt><dd>{s.breakfast}</dd></>}
            {s.location && <><dt className="font-semibold text-text-primary">Location</dt><dd>{s.location}</dd></>}
            {!!s.amenities?.length && <><dt className="font-semibold text-text-primary">Amenities</dt><dd>{s.amenities.join(" · ")}</dd></>}
          </dl>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300">Room details and photos are being confirmed with the property.</p>
        ))}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="font-montserrat text-2xl text-text-primary">{fmtMoney(s.price_per_night, currency)}</strong> / night
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {fmtMoney(s.unit_total, currency)} for the {s.nights}-night stay, per {airbnb ? "unit" : "room"}
            </p>
          </div>
          {detailed ? (
            bookable && (
              <Link href={href} aria-label={`Book ${s.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-transform hover:translate-x-1">
                <Arrow />
              </Link>
            )
          ) : (
            <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-transform group-hover:translate-x-1">
              <Arrow />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const shell = "group card-lift h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-md ring-1 ring-black/5 dark:ring-white/10";
  return (
    <Reveal delay={delay} className="h-full">
      {detailed ? <div className={shell}>{body}</div> : <Link href={href} className={shell}>{body}</Link>}
    </Reveal>
  );
}
