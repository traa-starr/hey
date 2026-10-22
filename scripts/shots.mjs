// Screenshots of every screen at 390px, light and dark, for checking against docs/DESIGN.md.
// usage: node scripts/shots.mjs [baseUrl] [outDir]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:4173/hey/";
const out = process.argv[3] ?? "scripts/out";
mkdirSync(out, { recursive: true });

const SEED = {
  welcomed: true, name: "sam", tried: {},
  collected: {
    "my-words": [
      { id: "a1", text: "hey sam, you've handled hard weeks before.", from: "talk to you", at: new Date(Date.now() - 9 * 864e5).toISOString(), before: 5, after: 3 },
      { id: "a2", text: "i'm tired, and i still showed up today.", from: "and", at: new Date(Date.now() - 16 * 864e5).toISOString(), before: 4, after: 2 },
      { id: "a3", text: "i haven't found my thing yet, for now.", from: "for now", at: new Date(Date.now() - 30 * 864e5).toISOString() }
    ],
    "what-i-like": [{ id: "b1", text: "i'd pick sunrise.", from: "today", at: new Date(Date.now() - 4 * 864e5).toISOString() }],
    "what-i-think": [{ id: "c1", text: "i think a little mess is cozy because it feels lived in.", from: "i think... because...", at: new Date(Date.now() - 12 * 864e5).toISOString() }]
  }
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const scheme of (process.env.SCHEMES ?? "light,dark").split(",")) {
  const reduced = scheme === "reduced";
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    colorScheme: reduced ? "light" : scheme, reducedMotion: reduced ? "reduce" : "no-preference"
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(scheme, "pageerror", e.message));
  page.on("console", (m) => m.type() === "error" && console.log(scheme, "console", m.text()));
  const shot = async (name) => {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${scheme}-${name}.png` });
  };

  // a brand new person: the welcome
  await page.goto(base);
  await page.waitForSelector(".huge");
  await shot("01-welcome");
  await page.getByRole("button", { name: "hi", exact: true }).click();
  await shot("02-welcome-inner");
  await page.getByRole("button", { name: "go on", exact: true }).click();
  await page.getByRole("button", { name: "i'd like that", exact: true }).click();
  await page.getByRole("button", { name: "tell me more", exact: true }).click();
  await shot("03-welcome-you");

  // someone coming back with a book
  await page.evaluate((seed) => { localStorage.setItem("heyyou.v1", JSON.stringify(seed)); indexedDB.deleteDatabase("heyyou"); }, SEED);
  await page.goto(base);
  await page.reload();
  await page.waitForSelector(".greet");
  await shot("10-today");
  await page.getByRole("link", { name: /did your inner voice/ }).click();
  await page.getByRole("button", { name: "i always mess things up.", exact: true }).click();
  await shot("11-catch");
  await page.getByRole("button", { name: "next", exact: true }).click();
  await page.locator("#loudness").fill("5");
  await shot("12-loud");
  await page.getByRole("button", { name: "next", exact: true }).click();
  await shot("13-calm");
  await page.getByRole("button", { name: "keep going", exact: true }).click();
  await shot("14-way");
  await page.getByRole("button", { name: /^and/ }).click();
  await page.getByRole("button", { name: "i'm still learning.", exact: true }).click();
  await shot("15-write");
  await page.getByRole("button", { name: "this is mine", exact: true }).click();
  await page.locator("#loudness").fill("2");
  await shot("16-again");
  await page.getByRole("button", { name: "next", exact: true }).click();
  await shot("17-kept");
  await page.getByRole("button", { name: "keep it in my book", exact: true }).click();
  await page.getByRole("button", { name: "see your book", exact: true }).click();
  await shot("20-book");
  await page.getByRole("tab", { name: "about you", exact: true }).click();
  await shot("21-book-about");
  await page.locator(".settings").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await shot("22-settings");
  await page.goto(`${base}#/explore`);
  await shot("30-explore");
  await page.goto(`${base}#/way/friend-test`);
  await shot("31-way");
  await page.goto(`${base}#/set/desires/want-words`);
  await page.getByRole("button", { name: "okay", exact: true }).click();
  await page.getByRole("button", { name: "show me", exact: true }).click();
  await page.getByRole("button", { name: "i'm craving noodles.", exact: true }).click();
  await shot("32-set-tryon");
  await page.goto(`${base}#/set/opinions/i-think-because`);
  await page.reload();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /okay|go on|next/ }).first().click().catch(() => {});
  await shot("33-set-build");
  await ctx.close();
}
await browser.close();
console.log("shots in", out);
