import { expect, test } from "@playwright/test";
import { button, saved } from "./helpers";

test("a first visit tells the two-voices story and ends with answering one", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "hey you." })).toBeVisible();
  await button(page, "hi").click();
  await expect(page.getByText("most of us carry one loud inner voice.")).toBeVisible();
  await button(page, "go on").click();
  await button(page, "i'd like that").click();
  await button(page, "tell me more").click();
  await expect(page.getByRole("link", { name: "Kross et al., 2014" })).toBeVisible();
  await button(page, "hey you").click();
  await button(page, "sounds good").click();
  await page.getByLabel("call me").fill("Robin");
  await button(page, "that's me").click();
  await expect(page.getByText("nice to meet you, robin.")).toBeVisible();
  await button(page, "next").click();
  await button(page, "answer one").click();
  await expect(page.getByRole("heading", { name: "what did your inner voice say?" })).toBeVisible();

  // the welcome doesn't come back once it's done
  await page.goto("./");
  await expect(page.locator(".greet")).toHaveText(/robin\./);
});

test("the welcome can be left early and resumes where it stopped", async ({ page }) => {
  await page.goto("./");
  await button(page, "hi").click();
  await button(page, "go on").click();
  await saved(page, "progress", (p) => (p as { i?: number } | null)?.i === 2);
  await page.reload();
  await expect(page.getByText("here, you grow a second one. yours, in your own words.")).toBeVisible();
});
