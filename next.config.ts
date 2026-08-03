import type { NextConfig } from "next";

// Turbopack is the default bundler in Next.js 16 and is used for `next dev`
// (see package.json "dev" script). On this Windows machine the Turbopack dev
// incremental cache can occasionally corrupt (native panic -> missing .sst
// files), so the dev script wipes `.next` on every start to avoid stale/corrupt
// cache. If dev ever panics mid-session, run `npm run dev:webpack` as a stable
// fallback compiler (slower on-demand route compilation on first navigation).
const nextConfig: NextConfig = {};

export default nextConfig;