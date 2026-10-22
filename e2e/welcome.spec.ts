import { expect, test } from "@playwright/test";
import { button, cont, saved } from "./helpers";

test("a first visit is a short chat with sol that ends with the voice check", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText("hey you.", { exact: true })).toBeVisible();
  for (let i = 0; i < 4; i++) await cont(page);
  await expect(page.getByText("everything stays on this phone.")).toBeVisible();
  await cont(page);
  await page.getByLabel("what would you like me to call you?").fill("Robin");
  await button(page, "that's me").click();
  await expect(page.getByText("nice to meet you, robin.")).toBeVisible();
  await cont(page);
  await button(page, "let's find out").click();
  await expect(page.getByText(/swipe through a few things inner voices say/)).toBeVisible();

  // the welcome doesn't come back once it's done
  await page.goto("./");
  await expect(page.locator(".hello h1")).toHaveText(/robin\./);
});

test("the welcome can be left early, resumes, and can be skipped", async ({ page }) => {
  await page.goto("./");
  await cont(page);
  await cont(page);
  await saved(page, "progress", (p) => (p as Record<string, { i: number }> | null)?.["start/welcome"]?.i === 2);
  await page.reload();
  await expect(page.getByText(/most of us carry one loud inner voice/)).toBeVisible();
  await button(page, "close").click();
  await expect(page.locator(".sky")).toBeVisible();
  await page.reload();
  await expect(page.locator(".sky")).toBeVisible();
});
