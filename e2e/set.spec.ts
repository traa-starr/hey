import { expect, test } from "@playwright/test";
import { button, returning } from "./helpers";

test("a set plays, keeps answers in about you, and resumes", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "explore" }).click();
  await page.getByRole("link", { name: /this or that/ }).click();
  await button(page, "okay").click();
  await button(page, "let's play").click();
  await button(page, "sunrise").click();
  await button(page, "rain on the window").click();

  // leave halfway and come back: it picks up where it stopped
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
