// Renders the app icon (a lowercase serif "y" at dawn) to PNG sizes. usage: node scripts/icons.mjs
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const font = readFileSync("node_modules/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2").toString("base64");
const html = (size, pad) => `<html><body style="margin:0"><style>
@font-face { font-family: N; src: url(data:font/woff2;base64,${font}) format("woff2"); font-style: italic; }
div { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: radial-gradient(120% 90% at 70% 10%, #fde3d2, #f8d2c6 45%, #efc7cf);
  font-family: N; font-style: italic; color: #2b1d1a; font-size: ${size * pad}px; line-height: 1; font-variation-settings: "opsz" 72, "wght" 420; }
span { transform: translate(-2%, -8%); }
</style><div><span>y</span></div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const [name, size, pad] of [["icon-512.png", 512, 0.62], ["icon-192.png", 192, 0.62], ["apple-touch-icon.png", 180, 0.62]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html(size, pad));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/icons/${name}` });
}
await browser.close();
