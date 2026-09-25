// Copies self-hosted font files from npm packages into /public/fonts.
// Run once after `npm install` (files are committed, so this is optional).
import { copyFileSync, mkdirSync } from 'node:fs';
const out = new URL('../public/fonts/', import.meta.url);
mkdirSync(out, { recursive: true });
const files = [
  ['node_modules/vazirmatn/fonts/webfonts/Vazirmatn[wght].woff2', 'Vazirmatn[wght].woff2'],
  ...[400, 500, 600].flatMap((w) => [
    [`node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-normal.woff2`, `CormorantGaramond-${w}.woff2`],
    [`node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-${w}-italic.woff2`, `CormorantGaramond-${w}-italic.woff2`],
  ]),
];
for (const [src, dest] of files) copyFileSync(new URL('../' + src, import.meta.url), new URL(dest, out));
console.log(`copied ${files.length} font files`);
