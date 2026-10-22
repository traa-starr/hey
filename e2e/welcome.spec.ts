import { expect, test } from "@playwright/test";
import { button, cont, saved } from "./helpers";

test("a first visit starts with thanks, and a first kind line in your own book", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByText("hey you.", { exact: true })).toBeVisible();
  await cont(page);
  await expect(page.getByText(/thank you for being here/)).toBeVisible();
  await cont(page);
  await page.getByLabel("what would you like me to call you?").fill("Robin");
  await button(page, "that's me").click();
  await expect(page.getByText("nice to meet you, robin.")).toBeVisible();
  await cont(page);
  await expect(page.getByText(/get on your own side/)).toBeVisible();
  await cont(page);
  // nothing about the inner voice yet: the first thing is a kind line, to yourself
  await button(page, "showed up today, and that counts.").click();
  await button(page, "keep it").click();
  await expect(page.getByText("kept in your book.")).toBeVisible();
  await cont(page);
  await button(page, "a little strange").click();
  await expect(page.getByText(/they get easier with practice/)).toBeVisible();
  await cont(page);
  await expect(page.getByText("everything stays on this phone.")).toBeVisible();
  await cont(page);
  await button(page, "take me home").click();
  await expect(page.locator(".hello h1")).toHaveText(/robin\./);
  await expect(page.locator(".next")).toContainText("a kind minute");

  // the welcome doesn't come back, and the line is the first page of the book
  await page.goto("./");
  await expect(page.locator(".hello h1")).toHaveText(/robin\./);
  await page.goto("./#/book/voice");
  await expect(page.locator(".entries")).toContainText("hey robin, you showed up today, and that counts.");
});

test("the welcome can be left early, resumes, and can be skipped", async ({ page }) => {
  await page.goto("./");
  await cont(page);
  await cont(page);
  await saved(page, "progress", (p) => (p as Record<string, { i: number }> | null)?.["start/welcome"]?.i === 2);
  await page.reload();
  await expect(page.getByText(/thank you for being here/)).toBeVisible();
  await button(page, "close").click();
  await expect(page.locator(".sky")).toBeVisible();
  await page.reload();
  await expect(page.locator(".sky")).toBeVisible();
});
