import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 devIndicators: false,
 images: { unoptimized: true },
 output: "standalone",
};

export default nextConfig;
