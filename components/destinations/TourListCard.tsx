import Link from "next/link";
import type { StaticImageData } from "next/image";

function imgUrl(image: string | StaticImageData): string {
  return typeof image === "string" ? image : image.src;
}

interface TourListCardProps {
  id: string | number;
  image: string | StaticImageData;
  badge?: string;
  badgeVariant?: "discount" | "featured";
  location: string;
  title: string;
  rating: number;
  reviews: number;
  description: string;
  tags?: string[];
  duration: string;
  priceShared: number;
  pricePrivate: number;
  priceVip: number;
  currency: string;
}

function Stars({ rating, cardId }: { rating: number; cardId: string | number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        const pct = Math.round(fill * 100);
        const id = `star-${cardId}-${i}`;
        return (
          <svg key={i} width="13" height="13" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={id}>
                <stop offset={`${pct}%`} stopColor="#bd8f3a" />
                <stop offset={`${pct}%`} stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#${id})`}
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function TourListCard({
  id, image, badge, badgeVariant = "discount",
  location, title, rating, reviews, description, tags,
  duration, priceShared, pricePrivate, priceVip, currency,
}: TourListCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-full sm:w-56 md:w-64 h-48 sm:h-52 shrink-0">
        <img src={imgUrl(image)} alt={title} className="w-full h-full object-cover" />
        {badge && (
          <span
            className={`absolute top-3 left-3 text-xs font-bold font-open-sans px-2.5 py-1 rounded-full ${
              badgeVariant === "discount"
                ? "bg-primary text-white"
                : "bg-gray-800/80 text-white"
            }`}
          >
            {badge}
          </span>
        )}
        <button className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row flex-1 p-4 gap-4">
        <div className="flex flex-col flex-1 gap-1.5">
          <p className="text-xs text-gray-400 font-open-sans">{location}</p>
          <Link href={`/tour/${id}`} className="text-base font-bold font-raleway text-text-primary leading-snug hover:text-primary transition-colors line-clamp-2">
            {title}
          </Link>
          <div className="flex items-center gap-1.5">
            <Stars rating={rating} cardId={id} />
            <span className="text-xs text-gray-400 font-open-sans">{rating.toFixed(1)} ({reviews})</span>
          </div>
          <p className="text-xs text-gray-500 font-open-sans leading-relaxed line-clamp-2">{description}</p>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {tags.map((tag) => (
                <span key={tag} className="text-xs font-open-sans text-primary border border-primary/40 px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 min-w-28">
          <p className="text-xs text-gray-400 font-open-sans">{duration}</p>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-xs font-open-sans text-gray-400">Starting from</p>
              <p className="text-lg font-bold font-raleway text-primary">
                {currency} {priceShared.toLocaleString()}
              </p>
            </div>
            <Link
              href={`/tour/${id}`}
              className="mt-1 px-4 py-2 border border-primary text-primary text-xs font-semibold font-open-sans rounded-xl hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
