import { expect, test } from "@playwright/test";
import { button, saved } from "./helpers";

// closing the welcome starts the quick look around
test("the quick look around shows each page, can be left, and does not come back", async ({ page }) => {
  await page.goto("./");
  await button(page, "close").click();
  const dawn = page.getByRole("dialog", { name: "a quick look around" });
  await expect(dawn).toContainText("every morning, one voice wakes first");
  // the story, then home, then each tab opens its own page
  for (let n = 0; n < 7; n++) await button(page, "next").click();
  await expect(dawn).toContainText("learn is short chats");
  await expect(page).toHaveURL(/#\/learn$/);
  await expect(page.getByRole("heading", { name: "learn", exact: true })).toBeVisible();
  await button(page, "next").click();
  await expect(dawn).toContainText("each path is a theme");
  // leaving mid-way is fine, and it stays gone
  await button(page, "skip the tour").click();
  await expect(dawn).toHaveCount(0);
  await saved(page, "tour", (t) => (t as { end: string } | null)?.end === "skipped");
  await page.reload();
  await expect(page.locator(".tabs")).toBeVisible();
  await expect(dawn).toHaveCount(0);
});

test("the quick look around can be finished and replayed from settings", async ({ page }) => {
  await page.goto("./");
  await button(page, "close").click();
  for (let n = 0; n < 17; n++) await button(page, "next").click();
  await expect(page).toHaveURL(/#\/you$/);
  await button(page, "got it").click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("./#/settings");
  await button(page, "replay the quick look around").click();
  await expect(page.getByRole("dialog", { name: "a quick look around" })).toContainText("every morning, one voice wakes first");
});
