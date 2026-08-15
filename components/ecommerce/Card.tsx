import { type StaticImageData } from "next/image";
import Link from "next/link";
interface CardProps {
 id?: string | number;
 image: string | StaticImageData;
 location: string;
 title: string;
 rating: number;
 reviews: number;
 days: number;
 price: number;
 currency: string;
}

function imgUrl(image: string | StaticImageData): string {
 return typeof image === "string" ? image : image.src;
}

export default function Card({ id, image, location, title, rating, reviews, days, price, currency }: CardProps) {
 return (
 <div className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md flex flex-col min-w-72 max-w-72 shrink-0 card-lift">
 {/* Image */}
 <div className="relative overflow-hidden rounded-t-2xl">
 <img
 src={imgUrl(image)}
 alt={title}
 className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
 />
 <button className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:scale-105 transition-transform">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bd8f3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
 </svg>
 </button>
 </div>

 {/* Content */}
 <div className="p-4 flex flex-col gap-2 flex-1">
 <p className="text-xs text-gray-700 dark:text-gray-300 font-open-sans">{location}</p>
 <Link href={`/tour/${id ?? title.toLowerCase().replace(/\s+/g, "-")}`} className="text-base font-bold font-raleway text-text-primary leading-snug line-clamp-2 hover:text-primary transition-colors">
 {title}
 </Link>
 <div className="flex items-center justify-center gap-1">
 {Array.from({ length: 5 }, (_, i) => {
 const fill = Math.min(1, Math.max(0, rating - i));
 const pct = Math.round(fill * 100);
 const id = `star-${i}`;
 return (
 <svg key={i} width="14" height="14" viewBox="0 0 24 24">
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
 <span className="text-xs text-gray-700 dark:text-gray-300 font-open-sans ml-1">{rating} ({reviews})</span>
 </div>
 <hr className="border-gray-100 dark:border-gray-800 " />
 <div className="flex justify-between items-center text-sm font-open-sans text-gray-700 dark:text-gray-300 ">
 <span>{days} days</span>
 <span>
 From{" "}
 <strong className="text-text-primary font-montserrat">
 {currency} {price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
 </strong>
 </span>
 </div>
 </div>
 </div>
 );
}
