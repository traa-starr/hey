import { expect, test } from "@playwright/test";
import { button, returning, saved } from "./helpers";

test("a set plays, keeps answers in about you, and resumes", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "explore" }).click();
  await page.getByRole("link", { name: /this or that/ }).click();
  await button(page, "okay").click();
  await button(page, "let's play").click();
  await button(page, "sunrise").click();
  await button(page, "rain on the window").click();

  // leave halfway and come back: it picks up where it stopped
  await saved(page, "progress", (p) => (p as Record<string, { locals: Record<number, { at?: number }> }> | null)?.["desires/this-or-that.json"]?.locals[2]?.at === 2);
  await page.reload();
  await expect(page.getByText("3 of 8")).toBeVisible();
  for (let i = 0; i < 6; i++) await button(page, "neither").click();
  await expect(page.getByText("your picks")).toBeVisible();
  await button(page, "next").click();
  await button(page, "nice").click();
  await button(page, "not today").click();
  await button(page, "done").click();

  await page.getByRole("link", { name: "your book" }).click();
  await page.getByRole("tab", { name: "about you" }).click();
  await expect(page.locator(".entries")).toContainText("you'd pick rain on the window.");
  await expect(page.locator(".entries")).toContainText("you'd pick sunrise.");
});

test("today's question goes into about you", async ({ page }) => {
  await returning(page);
  const q = page.locator(".question .pair .chip").first();
  const pick = (await q.textContent()) ?? "";
  await q.click();
  await expect(page.getByText("noted in your book.")).toBeVisible();
  await page.getByRole("link", { name: "your book" }).click();
  await page.getByRole("tab", { name: "about you" }).click();
  await expect(page.locator(".entries")).toContainText(pick);
});

test("going back in a set never keeps the same thing twice", async ({ page }) => {
  await returning(page);
  await page.goto("./#/set/opinions/for-now");
  await button(page, "okay").click();
  await button(page, "go on").click();
  await button(page, "for now, i think i'd like a slower pace.").click();
  await button(page, "next").click();
  await button(page, "i like that").click();
  await button(page, "i'd like more quiet in my life.").click();
  await button(page, "keep it").click();
  await button(page, "next").click();
  await button(page, "back").click();
  await expect(page.getByText("saved with today's date, so you can see how it grows.")).toBeVisible();
  await button(page, "next").click();
  await page.goto("./#/book");
  await page.getByRole("tab", { name: "about you" }).click();
  await expect(page.locator(".entry", { hasText: "more quiet in your life" })).toHaveCount(1);
});
