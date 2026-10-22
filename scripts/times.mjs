// today at each time of day, light and dark. usage: node scripts/times.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:4173/hey/";
const out = process.argv[3] ?? "scripts/out";
const hours = { dawn: 7, day: 13, dusk: 19, night: 23 };
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const scheme of ["light", "dark"]) {
  for (const [name, h] of Object.entries(hours)) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme });
    const page = await ctx.newPage();
    await page.clock.install({ time: new Date(2026, 9, 22, h, 0) });
    await page.addInitScript(() => localStorage.setItem("heyyou.v1", JSON.stringify({ welcomed: true, name: "sam", collected: { "my-words": [{ id: "a", text: "hey sam, you've handled hard weeks before.", at: "2026-10-13T08:00:00.000Z", from: "talk to you" }] } })));
    await page.goto(base);
    await page.locator(".greet").waitFor();
    await page.clock.runFor(1500);
    await page.screenshot({ path: `${out}/time-${scheme}-${name}.png` });
    await ctx.close();
  }
}
await browser.close();
