import { expect, test } from "@playwright/test";
import { button, returning } from "./helpers";

test("answering the inner voice keeps the answer, never the original unless asked", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: /it's loud right now/ }).click();

  await page.getByLabel("in its words").fill("you're too much.");
  await button(page, "next").click();

  const loud = page.getByRole("slider", { name: "how loud it is" });
  await loud.fill("5");
  await expect(loud).toHaveAttribute("aria-valuetext", "all i can hear");
  await button(page, "next").click();

  // loud enough to be offered a breath; it's optional
  await expect(page.getByRole("heading", { name: /take a breath first/ })).toBeAttached();
  await button(page, "keep going").click();

  await page.getByRole("button", { name: /^the friend test/ }).click();
  await expect(page.locator(".reply-line")).toContainText('if a friend said "i\'m too much" about themselves');
  await button(page, "they're being harder on themselves than they deserve.").click();
  await button(page, "this is mine").click();

  await page.getByRole("slider", { name: "how loud it is" }).fill("2");
  await button(page, "next").click();
  await expect(page.getByText("a little quieter. you did that, in your own words.")).toBeVisible();
  // the answer carries the inner voice's words, and the screen says so before anything is kept
  await expect(page.getByText(/this answer includes your inner voice's words/)).toBeVisible();
  await button(page, "keep it in my book").click();
  await expect(page.getByText("kept in your book.")).toBeVisible();

  await button(page, "see your book").click();
  await expect(page.getByRole("img", { name: "a sky of 3 things you've kept" })).toBeVisible();
  await page.getByRole("link", { name: "words: 2" }).click();
  const first = page.locator(".entry").first();
  await expect(first).toContainText("they're being harder on themselves than they deserve.");
  await expect(first).toContainText("all i can hear → quiet");
  await expect(page.locator(".entries")).not.toContainText("my inner voice said");

  // nothing about the inner voice's sentence is left behind in the session
  expect(await page.evaluate(() => sessionStorage.getItem("heyyou.draft"))).toBeNull();
});

test("an unfinished answer resumes after a reload in the same session", async ({ page }) => {
  await returning(page);
  await page.goto("./#/answer");
  await button(page, "i'm too much.").click();
  await button(page, "next").click();
  await page.reload();
  await expect(page.locator(".said")).toHaveText("i'm too much.");
});

test("a way chosen from explore skips straight to writing", async ({ page }) => {
  await returning(page);
  await page.goto("./#/way/for-now");
  await button(page, "try it on one of yours").click();
  await button(page, "i'm not good enough.").click();
  await button(page, "next").click();
  await button(page, "hard to say").click();
  await expect(page.locator(".reply-line")).toHaveText("i'm not good enough, for now.");
});

test("leaving and coming back much later starts fresh", async ({ page }) => {
  await returning(page);
  await page.goto("./#/answer");
  await button(page, "i'm too much.").click();
  await button(page, "next").click();
  await page.evaluate(() => {
    const d = JSON.parse(sessionStorage.getItem("heyyou.draft") ?? "{}");
    sessionStorage.setItem("heyyou.draft", JSON.stringify({ ...d, updated: Date.now() - 31 * 60 * 1000 }));
  });
  await page.reload();
  await expect(page.getByLabel("in its words")).toHaveValue("");
});
