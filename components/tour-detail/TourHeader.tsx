"use client";

import { useState } from "react";
import {
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  ShareIcon,
  StarIcon,
  TagIcon,
} from "@/components/ui/icons";

interface TourHeaderProps {
  title: string;
  category?: string;
  destination?: string | null;
  durationLabel?: string;
  datesLabel?: string;
  rating?: number | null;
  reviewCount?: number;
  breadcrumb: { label: string; href: string }[];
}

/**
 * Page header: breadcrumb → title → one metadata row grouping rating,
 * category, location, duration and dates so the essentials read in a single
 * scan line under the title.
 */
export default function TourHeader({
  title,
  category,
  destination,
  durationLabel,
  datesLabel,
  rating,
  reviewCount = 0,
  breadcrumb,
}: TourHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const metaItemClass =
    "flex items-center gap-1.5 text-[13px] text-gray-600 dark:text-gray-300 font-open-sans";

  return (
    <header className="mb-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-open-sans mb-3">
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRightIcon size={12} className="text-gray-400" />}
            <a href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </a>
          </span>
        ))}
      </nav>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-[32px] font-bold font-raleway text-text-primary leading-tight">
          {title}
        </h1>
        <button
          onClick={handleShare}
          className="hidden sm:flex items-center gap-1.5 shrink-0 mt-1.5 text-sm text-gray-600 dark:text-gray-300 font-open-sans hover:text-primary transition-colors"
        >
          <ShareIcon size={15} />
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
        {rating != null && reviewCount > 0 && (
          <span className={metaItemClass}>
            <StarIcon size={14} className="text-primary" />
            <span className="font-semibold text-text-primary">{rating.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount} review{reviewCount !== 1 ? "s" : ""})</span>
          </span>
        )}
        {destination && (
          <span className={metaItemClass}>
            <MapPinIcon size={14} className="text-primary" />
            {destination}
          </span>
        )}
        {datesLabel && (
          <span className={metaItemClass}>
            <CalendarIcon size={14} className="text-primary" />
            {datesLabel}
          </span>
        )}
        {durationLabel && (
          <span className={metaItemClass}>
            <ClockIcon size={14} className="text-primary" />
            {durationLabel}
          </span>
        )}
        {category && (
          <span className={metaItemClass}>
            <TagIcon size={14} className="text-primary" />
            {category}
          </span>
        )}
      </div>
    </header>
  );
}
