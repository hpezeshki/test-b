import type { NextConfig } from 'next';

/**
 * Static export configuration — the whole prototype is pre-rendered HTML/JS/CSS.
 * No server, no middleware, no route handlers → $0 hosting on Netlify / Cloudflare Pages.
 * trailingSlash is off so hosts with clean URLs serve /pricing → pricing.html directly.
 */
const config: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
