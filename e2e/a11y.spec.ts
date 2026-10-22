import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { button, returning } from "./helpers";

const scan = async (page: import("@playwright/test").Page) => {
  await page.waitForTimeout(600);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

test("the welcome passes automated accessibility checks", async ({ page }) => {
  await page.goto("./");
  await page.locator(".chat").waitFor();
  await scan(page);
});

test("every main screen passes automated accessibility checks", async ({ page }) => {
  await returning(page);
  await scan(page);
  for (const path of ["#/learn", "#/path/habits", "#/practice", "#/you", "#/habit/mind", "#/book", "#/settings", "#/catch", "#/checkin", "#/way/talk-to-you", "#/lesson/what-you-think/i-think-because"]) {
    await page.goto(`./${path}`);
    await scan(page);
  }
  await page.goto("./#/answer");
  await button(page, "i'm too much.").click();
  await scan(page);
  await button(page, "next").click();
  await scan(page);
});
