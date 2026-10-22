import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { button, returning } from "./helpers";

const scan = async (page: Page) => {
  await page.waitForTimeout(600);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

// the full visit: feel check, settle, build the voice, bring something small, hear it, see the shift, keep it
async function visit(page: Page, scanning = false) {
  await page.goto("./#/practice");
  await page.getByRole("link", { name: /the warm room/ }).click();
  await expect(page.getByRole("heading", { name: "the warm room" }).first()).toBeVisible();
  if (scanning) await scan(page);
  await page.getByRole("link", { name: "come in" }).click();

  await page.getByRole("slider", { name: "heavy or light" }).fill("3");
  if (scanning) await scan(page);
  await button(page, "continue").click();

  // settle: the hand on the chest is labelled as one small study
  await expect(page.getByText(/Dreisoerner et al., 2021/)).toBeVisible();
  if (scanning) await scan(page);
  await button(page, "skip").click();

  // first visit: build the voice
  await button(page, "continue").isHidden();
  await expect(page.getByRole("button", { name: /^gentle/ })).toBeVisible();
  await expect(button(page, "this is the voice")).toBeDisabled();
  await page.getByRole("button", { name: /^gentle/ }).click();
  await page.getByRole("button", { name: /^funny/ }).click();
  await page.getByLabel("a name for the voice, if one fits").fill("ember");
  if (scanning) await scan(page);
  await button(page, "this is the voice").click();

  await button(page, "a plan fell through").click();
  if (scanning) await scan(page);
  await button(page, "tell ember").click();

  await expect(page.locator(".quote", { hasText: "a plan fell through" })).toBeVisible();
  await button(page, "go on").click();
  await button(page, "go on").click();
  await expect(page.locator(".warm-bubble")).toHaveCount(3);
  if (scanning) await scan(page);
  await button(page, "that's enough").click();

  await page.getByRole("slider", { name: "heavy or light" }).fill("6");
  await button(page, "continue").click();
  await expect(page.getByRole("img", { name: /before: 3 of 10 light.*after: 6 of 10 light/ })).toBeVisible();
  if (scanning) await scan(page);
}

test("a visit builds a voice, answers kindly, shows the shift and keeps it in the book", async ({ page }) => {
  await returning(page);
  await visit(page, true);
  await page.getByLabel(/keep what i brought, too/).check();
  await button(page, "keep what ember said").click();
  await expect(page.getByText("kept in the book.")).toBeVisible();
  await button(page, "done").click();

  await page.goto("./#/book");
  const section = page.getByRole("region", { name: "the warm room" });
  await expect(section.getByText("ember")).toBeVisible();
  await expect(section.getByText("gentle, funny")).toBeVisible();
  // visits stay closed until opened
  await expect(section.getByText("a plan fell through")).toBeHidden();
  await section.locator("summary").first().click();
  await expect(section.getByText("a plan fell through")).toBeVisible();
  await expect(page.getByText("how it shifted")).toBeVisible();
  await scan(page);
});

test("letting a visit go keeps no words, and everything can be skipped", async ({ page }) => {
  await returning(page);
  await page.goto("./#/grow/warm/visit");
  await button(page, "skip").click();
  await button(page, "skip").click();
  await page.getByRole("button", { name: /^steady/ }).click();
  await page.getByRole("button", { name: /^wise/ }).click();
  await button(page, "this is the voice").click();
  await button(page, "nothing today, skip").click();
  await expect(page.getByText("is here anyway.")).toBeVisible();
  await button(page, "go on").click();
  await button(page, "go on").click();
  await button(page, "another way to say it").click();
  await expect(page.locator(".warm-bubble")).toHaveCount(1);
  await button(page, "go on").click();
  await button(page, "go on").click();
  await button(page, "that's enough").click();
  await button(page, "skip").click();
  await expect(page.getByRole("img", { name: /before/ })).toHaveCount(0);
  await button(page, "let it go").click();
  await expect(page.getByText(/let go\./)).toBeVisible();
  await page.goto("./#/book");
  await expect(page.getByRole("region", { name: "the warm room" }).getByText("kept visits")).toHaveCount(0);
});

test("why it works, and changing the voice, pass accessibility checks", async ({ page }) => {
  await returning(page);
  await page.goto("./#/grow/warm/why");
  for (let i = 0; i < 7; i++) {
    await scan(page);
    await button(page, "next").click();
  }
  await expect(page.getByText(/Dreisoerner et al., 2021.*evidence: one randomized study/)).toBeVisible();
  await scan(page);
  await page.goto("./#/grow/warm/voice");
  await scan(page);
});

test("the settling works with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await returning(page);
  await page.goto("./#/grow/warm/visit");
  await button(page, "continue").click();
  await button(page, "breathe").click();
  await expect(page.getByText(/breathe in for four, out for six/)).toBeVisible();
  await scan(page);
});
