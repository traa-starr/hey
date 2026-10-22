import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { button, returning } from "./helpers";

// everything saved by the growth practices, read straight from IndexedDB
async function grown(page: Page, feature: string): Promise<{ id: string; type: string; data: Record<string, unknown> }[]> {
  const read = () =>
    page.evaluate(
      (f) =>
        new Promise<{ id: string; feature: string; type: string; data: Record<string, unknown> }[]>((resolve) => {
          const open = indexedDB.open("heyyou");
          open.onsuccess = () => {
            const all = open.result.transaction("grown").objectStore("grown").getAll();
            all.onsuccess = () => resolve((all.result as { id: string; feature: string; type: string; data: Record<string, unknown> }[]).filter((g) => g.feature === f));
            all.onerror = () => resolve([]);
          };
          open.onerror = () => resolve([]);
        }),
      feature
    );
  return read();
}

const scan = async (page: Page) => {
  await page.waitForTimeout(900);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

const begin = async (page: Page) => {
  await returning(page);
  await page.goto("./#/grow/ladder");
  await expect(page.getByRole("heading", { name: "one rung up", level: 1 })).toBeVisible();
};
const setTrue = async (page: Page, n: number) => {
  await page.getByLabel("how true this feels, 0 to 100").fill(String(n));
  await expect(page.getByLabel("how true this feels, 0 to 100")).toHaveAttribute("aria-valuetext", `${n} of 100`);
};
const next = (page: Page) => button(page, "next").click();

test("practice offers the tile", async ({ page }) => {
  await returning(page);
  await page.goto("./#/practice");
  await page.getByRole("link", { name: /one rung up/ }).click();
  await expect(page).toHaveURL(/#\/grow\/ladder$/);
});

test("a climb: feel check, start, small honest steps, the ladder, kept, and carried into today", async ({ page }) => {
  await begin(page);
  // welcome first, then the feel check, which can be answered
  await expect(page.getByText("thank you for coming here when it's heavy")).toBeVisible();
  await expect(page.getByRole("group", { name: /before we start/ })).toBeVisible();
  await page.getByLabel("heavy or light").fill("3");
  await page.getByRole("button", { name: "tense", exact: true }).click();
  await next(page);

  await expect(page.getByRole("heading", { name: "where are we starting?" })).toBeVisible();
  await expect(button(page, "next")).toBeDisabled();
  await button(page, "heavy").click();
  await next(page);

  // the first time, why believable beats big
  await expect(page.getByText(/slightly different angle/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Wood, Perunovic & Lee \(2009\)/ })).toBeVisible();
  await expect(page.getByText(/not settled/)).toBeVisible();
  await button(page, "makes sense").click();

  // rung 1: pick an idea, then it becomes theirs
  await expect(page.getByRole("heading", { name: "which thought is a little lighter, and still believable?" })).toBeVisible();
  await expect(button(page, "next")).toBeDisabled();
  await button(page, "it's heavy right now, and that makes sense.").click();
  await expect(page.getByLabel("in my own words")).toHaveValue("it's heavy right now, and that makes sense.");
  await page.getByLabel("in my own words").fill("it's heavy right now, and that makes sense to me.");
  await next(page);

  // a number is always an answer: nothing counts until it's set
  await expect(page.getByRole("heading", { name: "how true does this feel?" })).toBeVisible();
  await expect(button(page, "next")).toBeDisabled();
  await setTrue(page, 40);
  await next(page);

  // below 60: a smaller step, never a correction
  await expect(page.getByText(/thanks for saying so honestly/)).toBeVisible();
  await button(page, "try a smaller step").click();
  await expect(page.getByText(/let's find a smaller step/)).toBeVisible();
  await button(page, "right now it's heavy. that's all i know.").click();
  await next(page);
  await setTrue(page, 75);
  await next(page);

  // 60 or more is a rung
  await expect(page.getByText(/that one holds/)).toBeVisible();
  await expect(page.getByRole("list", { name: "the climb, from the bottom up" }).getByRole("listitem")).toHaveCount(2);
  await button(page, "one more rung up").click();
  await expect(page.locator(".ladder-here-text")).toHaveText("right now it's heavy. that's all i know.");
  await button(page, "heavy isn't the same as forever.").click();
  await next(page);
  await setTrue(page, 65);
  await next(page);
  await button(page, "that's enough for now").click();

  // the feel check again
  await expect(page.getByRole("group", { name: "and now?" })).toBeVisible();
  await page.getByLabel("heavy or light").fill("5");
  await next(page);

  // the climb, bottom to top, beside the before and after
  await expect(page.getByRole("heading", { name: "the climb" })).toBeVisible();
  const steps = page.getByRole("list", { name: "the climb, from the bottom up" }).getByRole("listitem");
  await expect(steps).toHaveCount(3);
  await expect(steps.nth(0)).toContainText("heavy");
  await expect(steps.nth(1)).toContainText("right now it's heavy. that's all i know.");
  await expect(steps.nth(2)).toContainText("heavy isn't the same as forever.");
  await expect(page.getByRole("img", { name: /^before: 3 of 10 light/ })).toBeVisible();
  await button(page, "keep the climb").click();
  await expect(page.getByRole("status")).toContainText("kept in the book");
  await button(page, "take the top rung into today").click();
  await expect(page.getByRole("status")).toContainText("set aside for today");

  await expect.poll(async () => (await grown(page, "ladder")).length).toBe(1);
  const [climb] = await grown(page, "ladder");
  expect(climb!.type).toBe("climb");
  expect(climb!.data).toMatchObject({
    start: "heavy",
    rungs: [{ text: "right now it's heavy. that's all i know.", believe: 75 }, { text: "heavy isn't the same as forever.", believe: 65 }],
    top: "heavy isn't the same as forever.",
    carry: true
  });
  await expect.poll(async () => (await grown(page, "feel")).length).toBe(1);
  expect((await grown(page, "feel"))[0]!.data).toMatchObject({ practice: "ladder", ref: climb!.id, before: { light: 3, word: "tense" }, after: { light: 5 } });

  // and it's in the book
  await button(page, "see the book").click();
  const section = page.getByRole("region", { name: "past ladders" });
  await expect(section).toContainText("heavy isn't the same as forever.");
  await expect(section).toContainText("2 rungs");
  await section.getByRole("button", { name: /^remove the climb from/ }).click();
  await expect(page.getByRole("region", { name: "past ladders" })).toHaveCount(0);
  await expect.poll(async () => (await grown(page, "ladder")).length).toBe(0);
});

test("the loud sentence stays out of the book unless they keep it; both feel checks can be skipped", async ({ page }) => {
  await begin(page);
  await button(page, "skip").click();
  await button(page, "a sentence").click();
  await page.getByLabel("the sentence, as it sounds").fill("my own words for the loud sentence");
  await next(page);
  // not one of the offered sentences, so the closest feeling is asked
  await expect(page.getByRole("heading", { name: "which feeling is closest?" })).toBeVisible();
  await button(page, "not enough").click();
  await next(page);
  await button(page, "makes sense").click();
  await page.getByRole("button", { name: /^it hurts to feel this way about myself\.$/ }).click();
  await next(page);
  await setTrue(page, 60);
  await next(page);
  await button(page, "that's enough for now").click();
  await button(page, "skip this").click();
  await expect(page.getByRole("img", { name: /^before:/ })).toHaveCount(0);
  await expect(page.getByText("keep the sentence too")).toBeVisible();
  await button(page, "keep the climb").click();
  await expect.poll(async () => (await grown(page, "ladder")).length).toBe(1);
  const [climb] = await grown(page, "ladder");
  expect(climb!.data.start).toBe("not enough");
  expect(JSON.stringify(climb)).not.toContain("my own words for the loud sentence");
  expect(await grown(page, "feel")).toHaveLength(0);

  // again, this time keeping it
  await button(page, "back to practice").click();
  await page.getByRole("link", { name: /one rung up/ }).click();
  await button(page, "skip").click();
  await button(page, "a sentence").click();
  await button(page, "i'm not good enough.").click();
  await next(page);
  // an offered sentence knows its feeling, and the why is skipped after the first climb
  await expect(page.getByRole("heading", { name: "which thought is a little lighter, and still believable?" })).toBeVisible();
  await page.getByLabel("in my own words").fill("it hurts to feel this way, and that's allowed");
  await next(page);
  await setTrue(page, 90);
  await next(page);
  await button(page, "that's enough for now").click();
  await button(page, "skip this").click();
  await page.getByLabel("keep the sentence too").check();
  await button(page, "keep the climb").click();
  await expect.poll(async () => (await grown(page, "ladder")).length).toBe(2);
  expect((await grown(page, "ladder")).at(-1)!.data).toMatchObject({ start: "i'm not good enough.", from: "sentence" });
});

test("stopping before any rung leaves nothing behind", async ({ page }) => {
  await begin(page);
  await button(page, "skip").click();
  await button(page, "worried").click();
  await next(page);
  await button(page, "makes sense").click();
  await button(page, "stop for now").click();
  await expect(page).toHaveURL(/#\/practice$/);
  expect(await grown(page, "ladder")).toHaveLength(0);
});

const MODES = [
  { name: "light", colorScheme: "light", reducedMotion: "no-preference" },
  { name: "dark", colorScheme: "dark", reducedMotion: "no-preference" },
  { name: "reduced motion", colorScheme: "light", reducedMotion: "reduce" }
] as const;

for (const mode of MODES) {
  test(`every screen passes automated accessibility checks (${mode.name})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode.colorScheme, reducedMotion: mode.reducedMotion });
    await begin(page);
    await scan(page); // open
    await next(page);
    await scan(page); // start (feeling)
    await button(page, "a sentence").click();
    await scan(page); // start (sentence)
    await page.getByLabel("the sentence, as it sounds").fill("something of my own");
    await next(page);
    await scan(page); // near
    await button(page, "stuck").click();
    await next(page);
    await scan(page); // why
    await button(page, "makes sense").click();
    await scan(page); // rung
    await button(page, "why small steps?").click();
    await scan(page); // rung with the teaching open
    await button(page, "it makes sense that this feels slow.").click();
    await next(page);
    await scan(page); // true
    await setTrue(page, 30);
    await next(page);
    await scan(page); // short
    await button(page, "try a smaller step").click();
    await scan(page); // rung, smaller
    await button(page, "right now it feels stuck. i can say that.").click();
    await next(page);
    await setTrue(page, 80);
    await next(page);
    await scan(page); // held
    await button(page, "that's enough for now").click();
    await scan(page); // after
    await next(page);
    await scan(page); // climb
    await button(page, "keep the climb").click();
    await scan(page); // climb, kept
    await page.goto("./#/book");
    await scan(page); // book with a past ladder
  });
}
