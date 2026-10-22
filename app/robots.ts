import type { MetadataRoute } from "next";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://azuratravels.live").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  // Staging and previews stay out of search entirely.
  if (!/^https:\/\/(www\.)?azuratravels\.live$/.test(SITE)) return { rules: { userAgent: "*", disallow: "/" } };
  // Checkout, booking and account pages are personal: keep them out of search.
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/payment", "/booking", "/pay", "/dashboard", "/claim", "/unsubscribe"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
