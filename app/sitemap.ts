import type { MetadataRoute } from "next";

/** Ghana-only public pages (Change Request v4 §1: inactive countries stay out). */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://azuratravels.live").replace(/\/$/, "");
const PAGES = [
  "/", "/december-in-ghana", "/ghana-experience-2027", "/stays", "/experiences", "/faqs", "/about", "/donate",
  "/blog", "/gallery", "/terms-and-conditions", "/refund-policy", "/installment-policy", "/privacy-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE}${path}`, changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 }));
}
