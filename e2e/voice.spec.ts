import { expect, test } from "@playwright/test";
import { button, returning } from "./helpers";

test("the voice check maps your habits without any typing", async ({ page }) => {
  await returning(page);
  // the voice check lives in practice; home starts with something kind instead
  await page.getByRole("link", { name: "practice", exact: true }).click();
  await page.getByRole("link", { name: /voice check/ }).click();
  await button(page, "start").click();
  await expect(page.getByText("1 of 20")).toBeVisible();
  // lean hard on the mind reader: every second card is someone else's habit
  for (let i = 0; i < 20; i++) {
    const line = (await page.locator(".qcard:not(.under) .quote").last().textContent()) ?? "";
    const mind = /annoyed|invited me/.test(line);
    await button(page, mind ? "that's me" : "not really").click();
    if (i < 19) await expect(page.getByText(`${i + 2} of 20`)).toBeVisible();
    await page.waitForTimeout(260);
  }
  await expect(page.getByText(/thank you for being honest with yourself/)).toBeVisible();
  await expect(page.locator(".habit-row").first()).toContainText("the mind reader");
  await page.locator(".habit-row").first().click();
  await expect(page.getByRole("heading", { name: "the mind reader" })).toBeVisible();
  await expect(page.getByText("“they're probably annoyed with me.”")).toBeVisible();
});

test("catching a habit takes three taps and shows up in your patterns", async ({ page }) => {
  await returning(page);
  await page.goto("./#/catch");
  await page.locator(".habit-pick", { hasText: "forecaster" }).click();
  await button(page, "work").click();
  await page.getByRole("slider", { name: "how loud it is" }).fill("4");
  await button(page, "catch it").click();
  await expect(page.getByText(/caught\. that's how you get to know it/)).toBeVisible();

  // straight into answering it, with the habit's own lines as ideas
  await page.getByRole("link", { name: "answer it now" }).click();
  await expect(page.getByRole("heading", { name: "what did the forecaster say?" })).toBeVisible();
  await expect(button(page, "this is going to go terribly.")).toBeVisible();

  await page.goto("./#/you");
  await expect(page.locator(".bars")).toContainText("work");
});

test("a check-in feeds how loud it's been", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "check in" }).click();
  await page.getByRole("slider", { name: "how loud it is" }).fill("2");
  await button(page, "that's it").click();
  await expect(page.getByText("thanks for checking in.")).toBeVisible();
});
