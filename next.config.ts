import type { NextConfig } from "next";

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
  ];
 },
};

export default nextConfig;
