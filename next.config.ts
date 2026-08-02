import type { NextConfig } from "next";

// Turbopack is the default in Next.js 16 and cannot be toggled from this file
// (`turbo: false` was removed). It is disabled for the dev server via
// `next dev --webpack` in package.json because the native Turbopack binary
// panics on Windows (see %TEMP%\next-panic-*.log), which deletes the filesystem
// cache and forces slow cold recompiles on every start.
const nextConfig: NextConfig = {};

export default nextConfig;