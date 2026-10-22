import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { button, cont, returning } from "./helpers";

const scan = async (page: Page) => {
  await page.waitForTimeout(600);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};
const claim = "if i speak up, they'll think i'm annoying.";

// the morning: choose the experiment
async function morning(page: Page) {
  await page.goto("./#/grow/proof/new");
  await scan(page);
  await button(page, /something my inner voice predicts/).click();
  await button(page, claim).click();
  await scan(page);
  await button(page, "next").click();
  await button(page, "it'll go the way the voice says.").click();
  await button(page, "next").click();
  await button(page, "ask one question.").click();
  await button(page, "next").click();
  await expect(page.getByRole("slider")).toHaveAttribute("aria-valuetext", /how true it feels: 50 of 100/);
  await scan(page);
  await button(page, "set the experiment").click();
  await expect(page.getByRole("heading", { name: "the experiment is set" })).toBeVisible();
}

test("proof: pick an experiment in the morning, look back in the evening, keep what turned up", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 22, 9, 0));
  await returning(page);

  // the practice shows up as a tile
  await page.goto("./#/practice");
  await expect(page.getByRole("link", { name: /proof/ })).toBeVisible();

  await page.goto("./#/grow/proof");
  await expect(page.getByText("nothing here yet. whatever turns up in an experiment can live here.")).toBeVisible();
  await scan(page);
  await button(page, "why this works").click();
  await expect(page.getByText(/Bennett-Levy et al., 2004/).first()).toBeVisible();
  await scan(page);

  await morning(page);
  await scan(page);

  // mid-morning: home stays quiet, nothing nags
  await page.goto("./");
  await expect(page.getByTestId("proof-evening")).toHaveCount(0);

  // the evening: a calm card that never shows the thought itself
  await page.clock.setFixedTime(new Date(2026, 9, 22, 18, 30));
  await page.goto("./");
  const card = page.getByTestId("proof-evening");
  await expect(card).toContainText("thanks for trying something real today");
  await expect(card).not.toContainText("annoying");
  await scan(page);
  await card.getByRole("link", { name: /tell sol what happened/ }).click();

  // feel check before (twice skippable), what happened, what to keep
  await expect(page.getByText("before we start: how does it feel right now?")).toBeVisible();
  await scan(page);
  await cont(page);
  await expect(page.getByText(claim)).toBeVisible();
  await button(page, "it went differently").click();
  await expect(page.getByText("good to know. that's worth keeping.")).toBeVisible();
  await scan(page);
  await cont(page);
  await expect(page.getByText(/the mind holds hard moments tighter than good ones/)).toBeVisible();
  await button(page, "nobody reacted the way it predicted.").click();
  await scan(page);
  await button(page, "keep as proof").click();
  await expect(page.getByText("kept. it's in the book now.")).toBeVisible();
  await cont(page);
  await expect(page.getByText("it was 50 of 100 this morning. any number is fine.")).toBeVisible();
  await page.getByRole("slider").fill("20");
  await cont(page);
  await scan(page);
  await button(page, "close it, with thanks").click();
  await expect(page.getByText("and now?")).toBeVisible();
  await page.getByLabel("heavy or light").fill("7");
  await cont(page);
  await expect(page.getByText("thanks for being curious about this.")).toBeVisible();
  await expect(page.getByRole("img", { name: /before: .* after: / })).toBeVisible();
  await scan(page);

  // closed: home stops asking, and the proof is kept
  await page.goto("./");
  await expect(page.getByTestId("proof-evening")).toHaveCount(0);
  await page.goto("./#/grow/proof");
  await expect(page.getByText("nobody reacted the way it predicted.")).toBeVisible();
  await expect(page.getByText(claim)).toBeHidden();
  await page.getByText("what it was testing").click();
  await expect(page.getByText(claim)).toBeVisible();

  // the book keeps the collection
  await page.goto("./#/book");
  await expect(page.getByRole("heading", { name: "proof", exact: true, level: 2 })).toBeVisible();
  await expect(page.getByText("nobody reacted the way it predicted.")).toBeVisible();

  // the same claim comes back: the proof already gathered shows up
  await page.goto("./#/grow/proof/new");
  await button(page, /something my inner voice predicts/).click();
  await page.getByLabel("what does the inner voice predict?").fill("If I speak up, they'll think I'm annoying");
  await expect(page.getByText("this one has come up before. proof already gathered:")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "nobody reacted the way it predicted." })).toBeVisible();
});

test("proof: an open experiment can wait, or be let go, never failed", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 22, 9, 0));
  await returning(page);
  await morning(page);
  await page.clock.setFixedTime(new Date(2026, 9, 22, 19, 0));
  await page.goto("./");
  await page.getByTestId("proof-evening").getByRole("link").click();
  await button(page, "skip").click();
  await button(page, "i didn't get to it").click();
  await cont(page);
  await expect(button(page, "close it, with thanks")).toHaveCount(0);
  await button(page, "keep it open").click();
  await button(page, "skip").click();
  await expect(page.getByText("thanks for being curious about this.")).toBeVisible();
  // still open, with no clock on it
  await page.goto("./#/grow/proof");
  await expect(page.getByText("today i'll ask one question.")).toBeVisible();
  // "not tonight" puts the card away
  await page.goto("./");
  await button(page, "not tonight").click();
  await expect(page.getByTestId("proof-evening")).toHaveCount(0);
  await page.goto("./#/grow/proof");
  await button(page, "let it go").click();
  await expect(page.getByText("today i'll ask one question.")).toHaveCount(0);
});

test("how the mind works: a science lesson, with its source and an experiment", async ({ page }) => {
  await returning(page);
  await page.goto("./#/path/how-your-mind-works");
  await expect(page.getByRole("link", { name: /why the mind talks to itself/ })).toBeVisible();
  await scan(page);
  await page.goto("./#/lesson/how-your-mind-works/why-the-mind-talks");
  await cont(page);
  await cont(page);
  // a background card with its real source and an honest evidence label
  await expect(page.getByRole("link", { name: "Alderson-Day & Fernyhough, 2015" })).toBeVisible();
  await expect(page.getByText(/evidence: moderate \(a review of many studies/)).toBeVisible();
  await scan(page);

  // tap through the rest: replies, try-ons, picks, a line to keep, the takeaway and the experiment
  let scanned = false;
  for (let i = 0; i < 40; i++) {
    if (await page.getByText("lesson done. thank you for taking this time.").isVisible()) break;
    const next = button(page, "continue");
    const reply = page.locator(".replies .reply").first();
    const option = page.locator(".option-stack .option:enabled:not([aria-pressed=true])").first();
    const idea = page.locator(".chip.idea").first();
    const chip = page.locator(".chips .chip:enabled").first();
    if (await next.isVisible()) await next.click();
    else if (await reply.isVisible()) await reply.click();
    else if (await option.isVisible()) await option.click();
    else if (await idea.isVisible()) {
      await idea.click();
      if (!scanned) { scanned = true; await scan(page); }
      await button(page, "keep it").click();
    } else if (await chip.isVisible()) {
      await chip.click();
      await button(page, "next").click();
    } else if (await button(page, "keep it in my book").isVisible()) await button(page, "keep it in my book").click();
    else await page.waitForTimeout(100);
  }
  await expect(page.getByText("lesson done. thank you for taking this time.")).toBeVisible();
  await scan(page);
  await button(page, "done").click();
  await page.goto("./#/path/how-your-mind-works");
  await expect(page.locator(".lesson-row").first()).toContainText("done");

  // the next lesson opens with a look back at this one
  await page.goto("./#/lesson/how-your-mind-works/the-negativity-bias");
  await expect(page.getByText(/a quick look back at “why the mind talks to itself”/)).toBeVisible();
});
