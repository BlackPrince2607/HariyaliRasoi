import type { NextConfig } from "next";

// Allow HMR, fonts, and dev assets when opening http://192.168.x.x:3000 on phone/LAN.
// Wildcards use the same matcher as CSRF origin checks (dot-separated segments).
const allowedDevOrigins = [
  "192.168.*.*",
  "10.*.*.*",
  "172.16.*.*",
  "172.17.*.*",
  "172.18.*.*",
  "172.19.*.*",
  "172.20.*.*",
  "192.168.29.195",
  ...(process.env.ALLOWED_DEV_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

const nextConfig: NextConfig = {
  // Required for Render/Docker standalone image
  output: "standalone",
  allowedDevOrigins,
  // /api/* is proxied at runtime by app/api/[...path]/route.ts
  // (build-time rewrites baked localhost and broke the menu on Render)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "media-assets.swiggy.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
