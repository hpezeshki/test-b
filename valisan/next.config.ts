import type { NextConfig } from 'next';

/**
 * Static export configuration — the whole prototype is pre-rendered HTML/JS/CSS.
 * No server, no middleware, no route handlers → $0 hosting on Cloudflare Pages / GitHub Pages.
 */
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Only set for the GitHub Pages mirror (served from a repo sub-path). Empty on Cloudflare Pages.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
};

export default config;
