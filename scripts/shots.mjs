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

// written straight into the app's database, as if kept over two months
async function fillBook() {
  const day = (n) => new Date(Date.now() - n * 864e5 - 3600e3).toISOString();
  const lines = ["hey sam, you're tired, and you still showed up.", "i notice the old rule again.", "for now, i think it's fine to rest.", "sam, you've done hard weeks before.", "what i know: i sent it, and that's enough.", "i'd pick the long walk home.", "i think small kindnesses count."];
  const ways = ["talk to you", "i notice", "for now", "the friend test", "and", "talk to you", "what i know"];
  const entries = Array.from({ length: 38 }, (_, i) => {
    const kind = i % 5 === 0 ? "keeper" : i % 3 === 0 ? "about" : "voice";
    const e = { id: `seed${i}`, kind, text: lines[i % lines.length], from: kind === "voice" ? ways[i % ways.length] : "a lesson", at: day(58 - i * 1.5) };
    if (kind === "voice" && i % 2) Object.assign(e, { before: 3 + (i % 3), after: Math.max(1, 3 + (i % 3) - 1 - (i % 2)) });
    if (i === 37) e.at = new Date().toISOString();
    return e;
  });
  const done = {};
  for (const k of ["inner-voice/everyone-has-one", "inner-voice/where-it-comes-from", "inner-voice/a-thought-not-a-fact", "habit:mind", "habit:rules", "habit:compare", "talk-to-you/the-you-trick", "talk-to-you/the-friend-test", "what-you-like/small-wants"]) done[k] = day(10);
  const logs = ["label", "forecast", "mind"].map((h, i) => ({ id: `m${i}`, type: "moment", at: day(i + 2), habit: h, where: "work", loud: 3 }));
  await new Promise((resolve, reject) => {
    const open = indexedDB.open("heyyou");
    open.onsuccess = () => {
      const tx = open.result.transaction(["entries", "kv", "logs"], "readwrite");
      for (const e of entries) tx.objectStore("entries").put(e);
      for (const l of logs) tx.objectStore("logs").put(l);
      tx.objectStore("kv").put({ key: "done", value: done });
      tx.oncomplete = resolve; tx.onerror = reject;
    };
    open.onerror = reject;
  });
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const scheme of (process.env.SCHEMES ?? "light,dark").split(",")) {
  const reduced = scheme === "reduced";
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: reduced ? "light" : scheme, reducedMotion: reduced ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(scheme, "pageerror", e.message));
  page.on("console", (m) => m.type() === "error" && console.log(scheme, "console", m.text()));
  const shot = async (name, wait = 700) => { await page.waitForTimeout(wait); await page.screenshot({ path: `${out}/${scheme}-${name}.png` }); };
  const tap = (name) => page.getByRole("button", { name, exact: true }).first().click();

  // a brand new person: the welcome as a chat with dawn
  await page.goto(base);
  await page.waitForSelector(".chat");
  await shot("01-welcome");
  await tap("continue"); await tap("continue");
  await page.getByLabel("what would you like me to call you?").fill("sam");
  await tap("that's me");
  await tap("continue"); await tap("continue");
  await tap("showed up today, and that counts.");
  await tap("keep it");
  await tap("continue");
  await tap("warm");
  await shot("02-welcome-kind");

  // someone coming back with a book and some history
  await page.evaluate((seed) => { localStorage.setItem("heyyou.v1", JSON.stringify(seed)); indexedDB.deleteDatabase("heyyou"); }, SEED);
  await page.goto(base); await page.reload();
  await page.waitForSelector(".sky");
  await shot("10-home");

  await page.goto(`${base}#/check`);
  await tap("start");
  await shot("11-check");
  const answers = ["that's me", "sometimes", "not really"];
  for (let i = 0; i < 20; i++) { await tap(answers[i % 3 === 2 ? 0 : i % 3]); await page.waitForTimeout(300); }
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
  await page.goto(`${base}#/lesson/on-your-side/a-kind-minute`);
  for (let i = 0; i < 2; i++) await tap("continue");
  await tap("rest is allowed"); await tap("i'm glad you're here");
  await tap("next");
  await tap("continue");
  await tap("sam, rest is allowed.");
  await shot("25-kind-minute");
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
  // a book a couple of months in: kept words, lessons read, answers with loudness
  await page.evaluate(fillBook);
  await page.reload();
  await page.goto(`${base}#/book`);
  await shot("43-book", 1800);
  await page.evaluate(() => window.scrollTo(0, 620));
  await shot("44-book-shelf");
  await page.evaluate(() => window.scrollTo(0, 99999));
  await shot("45-book-range");
  await page.goto(`${base}#/book/voice`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator(".entry .ibtn").nth(1).click();
  await shot("46-book-pages");
  await page.goto(`${base}#/settings`);
  await shot("47-settings");
  await ctx.close();
}
await browser.close();
console.log("shots in", out);
