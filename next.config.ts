import type { NextConfig } from "next";

// Configure static HTML/CSS/JS export. After `npm run build` the static bundle
// will be emitted into the `out` directory (no Node.js server required).
const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Disable image optimization for static export (no server runtime)
    unoptimized: true,
  },
};

export default nextConfig;
