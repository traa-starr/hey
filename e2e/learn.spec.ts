import { expect, test } from "@playwright/test";
import { button, cont, returning, saved } from "./helpers";

test("a lesson is a chat: tap through, try it, keep what you like", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "learn" }).click();
  await page.getByRole("link", { name: /meet the inner voice/ }).click();
  await page.getByRole("link", { name: /a thought is not a fact/ }).click();
  // a small preview of the lesson before, since it isn't done yet
  await expect(page.getByText("a small preview, from “where it comes from”")).toBeVisible();
  for (let i = 0; i < 6; i++) await cont(page);
  await button(page, "a bit lighter").click();
  await expect(page.getByText(/that's the frame doing its work/)).toBeVisible();

  // leave mid-lesson and come back to the same place
  await saved(page, "progress", (p) => (p as Record<string, { i: number }> | null)?.["inner-voice/a-thought-not-a-fact"]?.i === 6);
  await page.reload();
  await expect(page.getByText(/that's the frame doing its work/)).toBeVisible();

  await cont(page);
  // a short background break, with its source
  await expect(page.getByText("a little background")).toBeVisible();
  await expect(page.getByText(/calls it defusion/)).toBeVisible();
  for (let i = 0; i < 2; i++) await cont(page);
  // the frame is tried on a common thought, which isn't kept
  await button(page, "they're annoyed with me.").click();
  await button(page, "next").click();
  await cont(page);
  // a kinder thought is what goes in the book
  await button(page, "i'm learning as i go.").click();
  await button(page, "keep it").click();
  await cont(page);
  await button(page, "keep it in my book").click();
  await cont(page);
  await button(page, "i'll try it").click();
  await cont(page);
  await expect(page.getByText("lesson done. thank you for taking this time.")).toBeVisible();
  await button(page, "done").click();
  await expect(page.locator(".lesson-row").nth(2)).toContainText("done");

  await page.goto("./#/book/voice");
  await expect(page.locator(".entries")).toContainText("i'm learning as i go.");
  await expect(page.locator(".entries")).not.toContainText("noticing the thought");
  await page.getByRole("tab", { name: "keepers" }).click();
  await expect(page.locator(".entries")).toContainText("a thought is something your mind said");

  // the next lesson opens with a look back at this one
  await page.goto("./#/lesson/inner-voice%2Fturn-down-the-volume");
  await expect(page.getByText(/a quick look back at “a thought is not a fact”/)).toBeVisible();
  await button(page, "i remember it").click();
  await expect(page.getByText("nice. bringing it back is what helps it stick.")).toBeVisible();

  // a couple of days later, home brings the idea back, hidden until tapped
  await page.clock.setFixedTime(new Date(Date.now() + 2 * 864e5));
  await page.goto("./");
  const look = page.getByTestId("look-back");
  await expect(look).toContainText("what was the main idea of “a thought is not a fact”?");
  await expect(look).not.toContainText("a thought is something your mind said");
  await button(page, "show me").click();
  await expect(look).toContainText("a thought is something your mind said");
  await expect(look).toContainText("thanks for looking back");
});

test("a voice habit lesson: spot it in the wild", async ({ page }) => {
  await returning(page);
  await page.goto("./#/lesson/habit%3Aforecast");
  await expect(page.getByText("this is the forecaster.")).toBeVisible();
  for (let i = 0; i < 4; i++) await cont(page);
  await button(page, "sometimes").click();
  for (let i = 0; i < 3; i++) await cont(page);
  await expect(page.getByText("“i'm getting fired.”")).toBeVisible();
  await button(page, "the forecaster").click();
  await expect(page.getByText(/good noticing\. one way to read it/)).toBeVisible();
});

test("this or that keeps picks in about me", async ({ page }) => {
  await returning(page);
  await page.goto("./#/practice");
  await page.getByRole("link", { name: /this or that/ }).click();
  for (let i = 0; i < 3; i++) await cont(page);
  await button(page, "sunrise").click();
  await button(page, "rain on the window").click();
  for (let i = 0; i < 6; i++) await button(page, "neither").click();
  await page.goto("./#/book/voice");
  await page.getByRole("tab", { name: "about me" }).click();
  await expect(page.locator(".entries")).toContainText("i'd pick rain on the window.");
});
