// Screenshots of every screen at 390px, for checking against docs/DESIGN.md.
// usage: node scripts/shots.mjs [baseUrl] [outDir]   (SCHEMES=light,dark,reduced)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:4173/hey/";
const out = process.argv[3] ?? "scripts/out";
mkdirSync(out, { recursive: true });

const day = (n) => new Date(Date.now() - n * 864e5).toISOString();
const SEED = {
  welcomed: true, name: "sam", tried: {},
  collected: {
    "my-words": [
      { id: "a1", text: "hey sam, you've handled hard weeks before.", from: "talk to you", at: day(9), before: 5, after: 3 },
      { id: "a2", text: "i'm tired, and i still showed up today.", from: "and", at: day(16), before: 4, after: 2 }
    ],
    "what-i-like": [{ id: "b1", text: "i'd pick sunrise.", from: "today", at: day(4) }],
    "what-i-think": [{ id: "c1", text: "i think a little mess is cozy because it feels lived in.", from: "i think... because...", at: day(12) }]
  }
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const scheme of (process.env.SCHEMES ?? "light,dark").split(",")) {
  const reduced = scheme === "reduced";
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: reduced ? "light" : scheme, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(scheme, "pageerror", e.message));
  page.on("console", (m) => m.type() === "error" && console.log(scheme, "console", m.text()));
  const shot = async (name, wait = 700) => { await page.waitForTimeout(wait); await page.screenshot({ path: `${out}/${scheme}-${name}.png` }); };
  const tap = (name) => page.getByRole("button", { name, exact: true }).first().click();

  // a brand new person: the welcome as a chat with sol
  await page.goto(base);
  await page.waitForSelector(".chat");
  await shot("01-welcome");
  for (let i = 0; i < 4; i++) await tap("continue");
  await shot("02-welcome-promises");

  // someone coming back with a book and some history
  await page.evaluate((seed) => { localStorage.setItem("heyyou.v1", JSON.stringify(seed)); indexedDB.deleteDatabase("heyyou"); }, SEED);
  await page.goto(base); await page.reload();
  await page.waitForSelector(".sky");
  await shot("10-home");

  await page.goto(`${base}#/check`);
  await tap("start");
  await shot("11-check");
  const answers = ["that's me", "sometimes", "not really"];
  for (let i = 0; i < 20; i++) { await tap(answers[i % 3 === 2 ? 0 : i % 3]); await page.waitForTimeout(80); }
  await shot("12-map", 1500);

  await page.goto(`${base}#/catch`);
  await shot("13-catch");
  await page.locator(".habit-pick").first().click();
  await tap("work");
  await page.locator("#loudness").fill("4");
  await tap("catch it");
  await shot("14-caught");

  await page.goto(`${base}#/checkin`);
  await page.locator("#loudness").fill("2");
  await shot("15-checkin");
  await tap("that's it");

  await page.goto(`${base}#/learn`);
  await shot("20-learn");
  await page.goto(`${base}#/path/habits`);
  await shot("21-path");
  await page.goto(`${base}#/lesson/inner-voice/a-thought-not-a-fact`);
  for (let i = 0; i < 5; i++) await tap("continue");
  await shot("22-lesson");
  await tap("a bit lighter");
  await tap("continue"); await tap("continue");
  await shot("23-lesson-write");
  await page.goto(`${base}#/lesson/habit%3Amind`);
  for (let i = 0; i < 5; i++) await tap("continue");
  await page.getByRole("button", { name: "often" }).click();
  for (let i = 0; i < 4; i++) await tap("continue");
  await page.locator(".option").first().click();
  await shot("24-lesson-spot");

  await page.goto(`${base}#/practice`);
  await shot("30-practice");
  await page.goto(`${base}#/answer`);
  await shot("31-answer");
  await page.goto(`${base}#/breathe`);
  await tap("start");
  await shot("32-breathe", 2500);

  await page.goto(`${base}#/you`);
  await shot("40-you", 1500);
  await page.evaluate(() => window.scrollTo(0, 900));
  await shot("41-you-more");
  await page.goto(`${base}#/habit/mind`);
  await shot("42-habit");
  await page.goto(`${base}#/book`);
  await shot("43-book");
  await page.goto(`${base}#/settings`);
  await shot("44-settings");
  await ctx.close();
}
await browser.close();
console.log("shots in", out);
