import Link from "next/link";
import type { Package } from "@/lib/api/packagesApi";
import { fmtDateRange, fmtMoney } from "@/lib/format";
import { FLAGSHIP_SLUG } from "@/lib/content/site";
import { BlackStar } from "./Decor";

/** Grid card for an API package. The flagship gets a gold badge. */
export default function PackageCard({ pkg }: { pkg: Package }) {
  const isFlagship = pkg.slug === FLAGSHIP_SLUG;
  const price = pkg.from_price ?? pkg.price_shared;
  const dates = pkg.available_from && pkg.available_to ? fmtDateRange(pkg.available_from, pkg.available_to) : null;
  return (
    <Link
      href={`/tour/${pkg.id}`}
      className="group card-lift bg-white dark:bg-gray-900 rounded-2xl shadow-md flex flex-col h-full overflow-hidden"
    >
      <div className="relative h-52 overflow-hidden bg-[#FAF5EB] dark:bg-gray-800">
        {pkg.cover_image?.image ? (
          // Backend media URL; next/image remote patterns are not configured for it.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pkg.cover_image.image} alt={pkg.title} className="img-zoom w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8A6420]">
            <BlackStar size={36} />
            <span className="text-xs font-semibold">Photo coming soon</span>
          </div>
        )}
        {isFlagship && (
          <span className="absolute top-3 left-3 bg-primary text-white font-montserrat text-[11px] font-bold px-2.5 py-1 rounded-full">Flagship</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-gray-700 dark:text-gray-300">{pkg.destination ?? "Ghana"}</p>
        <h3 className="font-raleway font-bold text-base text-text-primary leading-snug line-clamp-2 min-h-11 group-hover:text-primary transition-colors">{pkg.title}</h3>
        {dates && <p className="text-xs font-semibold text-[#8A6420] dark:text-[#C9A96E]">{dates}</p>}
        <hr className="border-gray-100 dark:border-gray-800 mt-auto" />
        <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300">
          <span>{pkg.duration_days} {pkg.duration_days === 1 ? "day" : "days"}</span>
          {price && (
            <span>From <strong className="text-text-primary font-montserrat">{fmtMoney(price, pkg.currency)}</strong></span>
          )}
        </div>
      </div>
    </Link>
  );
}
