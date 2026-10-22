import { expect, test } from "@playwright/test";
import { button, cont, returning, saved } from "./helpers";

test("a lesson is a chat: tap through, try it, keep what you like", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "learn" }).click();
  await page.getByRole("link", { name: /meet your inner voice/ }).click();
  await page.getByRole("link", { name: /a thought is not a fact/ }).click();
  for (let i = 0; i < 5; i++) await cont(page);
  await button(page, "a bit lighter").click();
  await expect(page.getByText(/that's the frame doing its work/)).toBeVisible();

  // leave mid-lesson and come back to the same place
  await saved(page, "progress", (p) => (p as Record<string, { i: number }> | null)?.["inner-voice/a-thought-not-a-fact"]?.i === 5);
  await page.reload();
  await expect(page.getByText(/that's the frame doing its work/)).toBeVisible();

  for (let i = 0; i < 3; i++) await cont(page);
  await button(page, "they're annoyed with me.").click();
  await button(page, "keep it").click();
  await cont(page);
  await button(page, "keep it in my book").click();
  await cont(page);
  await button(page, "i'll try it").click();
  await cont(page);
  await expect(page.getByText("lesson done. nice work.")).toBeVisible();
  await button(page, "done").click();
  await expect(page.locator(".lesson-row").nth(2)).toContainText("done");

  await page.goto("./#/book/voice");
  await expect(page.locator(".entries")).toContainText("i'm noticing the thought that they're annoyed with me.");
  await page.getByRole("tab", { name: "keepers" }).click();
  await expect(page.locator(".entries")).toContainText("a thought is something your mind said");

  // a line that holds the inner voice's words is kept, but never resurfaced on home
  await page.goto("./");
  await button(page, "tap to read it").click();
  await expect(page.locator(".told")).not.toContainText("noticing the thought");
});

test("a voice habit lesson: spot it in the wild", async ({ page }) => {
  await returning(page);
  await page.goto("./#/lesson/habit%3Aforecast");
  await expect(page.getByText("this is the forecaster.")).toBeVisible();
  for (let i = 0; i < 5; i++) await cont(page);
  await button(page, "sometimes").click();
  for (let i = 0; i < 4; i++) await cont(page);
  await expect(page.getByText("“i'm getting fired.”")).toBeVisible();
  await button(page, "the forecaster").click();
  await expect(page.getByText(/good noticing\. one way to read it/)).toBeVisible();
});

test("this or that keeps picks in about you", async ({ page }) => {
  await returning(page);
  await page.goto("./#/practice");
  await page.getByRole("link", { name: /this or that/ }).click();
  await cont(page);
  await cont(page);
  await button(page, "sunrise").click();
  await button(page, "rain on the window").click();
  for (let i = 0; i < 6; i++) await button(page, "neither").click();
  await page.goto("./#/book/voice");
  await page.getByRole("tab", { name: "about you" }).click();
  await expect(page.locator(".entries")).toContainText("you'd pick rain on the window.");
});
