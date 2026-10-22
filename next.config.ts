import type { NextConfig } from "next";

// Staff work in the Django admin, next to the API.
const ADMIN_URL = (process.env.NEXT_PUBLIC_API_URL || "https://azuratravelsbackend.cc/api/").replace(/api\/?$/, "admin/");

const nextConfig: NextConfig = {
 devIndicators: false,
 images: { unoptimized: true },
 output: "standalone",
 // Ghana-only site (Change Request v2): old multi-country listing URLs go to
 // the Ghana experiences page. Temporary until the client signs off the IA.
 async redirects() {
  return [
   { source: "/explore", destination: "/experiences", permanent: false },
   { source: "/destinations", destination: "/experiences", permanent: false },
   { source: "/destinations/:id", destination: "/experiences", permanent: false },
   // The old /staff portal was retired for the admin (Phase 6).
   { source: "/staff/:path*", destination: ADMIN_URL, permanent: false },
  ];
 },
};

export default nextConfig;
