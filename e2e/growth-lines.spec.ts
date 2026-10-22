import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { button, returning } from "./helpers";

const scan = async (page: Page) => {
  await page.waitForTimeout(600);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
};

const next = (page: Page) => button(page, "next").click();

// value → moment → shape → tune → try, ending just before "keep it"
async function toTry(page: Page) {
  await button(page, "showing up").click();
  await scan(page);
  await next(page);
  await button(page, "yesterday, when a friend needed a hand").click();
  await scan(page);
  await next(page);
  await expect(page.getByRole("button", { name: /^sam shows up, like yesterday, when a friend needed a hand\.$/ })).toBeVisible();
  await page.getByRole("button", { name: /^sam shows up, like/ }).click();
  await scan(page);
  await next(page);
  await expect(page.getByLabel("the line")).toHaveValue("sam shows up, like yesterday, when a friend needed a hand.");
  await button(page, "sometimes").click();
  await expect(page.getByLabel("the line")).toHaveValue("sam sometimes shows up, like yesterday, when a friend needed a hand.");
  await scan(page);
  await next(page);
}

test("making a line: value, moment, shape, tune, try, keep, with the feel check around it", async ({ page }) => {
  await returning(page);
  await page.goto("./#/grow/lines");
  await expect(page.getByRole("heading", { name: "your lines", level: 1 })).toBeVisible();
  await expect(page.getByText("nothing here yet")).toBeVisible();
  await scan(page);
  await page.getByRole("link", { name: "make a line" }).click();

  // the first session of the day opens with the feel check, and it can be skipped or answered
  await expect(page.getByText(/how does it feel right now/)).toBeVisible();
  await scan(page);
  await button(page, "continue").click();

  await toTry(page);
  await expect(page.getByText("sam sometimes shows up, like yesterday, when a friend needed a hand.")).toBeVisible();
  await expect(button(page, "keep it")).toBeDisabled();
  await page.getByLabel("how true does this feel?").fill("75");
  await expect(page.getByText(/sounds like it fits/)).toBeVisible();
  await scan(page);
  await button(page, "keep it").click();

  await expect(page.getByText("and now?")).toBeVisible();
  await scan(page);
  await button(page, "continue").click();
  await expect(page.getByRole("heading", { name: "kept.", level: 1 })).toBeVisible();
  await expect(page.getByRole("img", { name: /before:/ })).toBeVisible();
  await scan(page);
  await button(page, "done for now").click();

  // today's line waits on home, hidden until tapped
  await expect(page.locator(".sky")).toBeVisible();
  const card = page.getByTestId("lines-today");
  await expect(card).toBeVisible();
  await expect(page.getByText("sam sometimes shows up")).toHaveCount(0);
  await scan(page);
  await card.getByRole("button", { name: "show me" }).click();
  await expect(card.getByText("sam sometimes shows up, like yesterday, when a friend needed a hand.")).toBeVisible();
  await scan(page);

  // the book keeps a small gallery
  await page.goto("./#/book");
  await expect(page.getByRole("heading", { name: "lines", level: 2 })).toBeVisible();
  await expect(page.getByText("sam sometimes shows up, like").first()).toBeVisible();
  await scan(page);

  // "still true?" leads to tuning, and a tuned line keeps its place
  await page.goto("./#/grow/lines");
  await expect(page.getByTestId("line-card")).toHaveCount(1);
  await scan(page);
  await page.getByRole("link", { name: "still true?" }).click();
  await expect(page.getByLabel("how true does this feel?")).toHaveValue("75");
  await button(page, "tune it more").click();
  await button(page, "in small ways").click();
  await next(page);
  await page.getByLabel("how true does this feel?").fill("85");
  await button(page, "keep it").click();
  await expect(page.getByRole("heading", { name: "tuned and kept.", level: 1 })).toBeVisible();
  await scan(page);
  await button(page, "done for now").click();
  await page.goto("./#/grow/lines");
  await expect(page.getByTestId("line-card")).toHaveCount(1);
  await expect(page.getByTestId("line-card")).toContainText("in small ways");

  // a line can be let go, gently
  await button(page, "let it go").click();
  await button(page, "yes, let it go").click();
  await expect(page.getByTestId("line-card")).toHaveCount(0);
});

test("the feel check can be skipped, a moment can be skipped, and a word of one's own works", async ({ page }) => {
  await returning(page);
  await page.goto("./#/grow/lines/new");
  await button(page, "skip").click();
  await button(page, "my own word").click();
  await page.getByLabel("a word of my own").fill("loyalty");
  await scan(page);
  await next(page);
  await button(page, "no moment today").click();
  await expect(page.getByRole("button", { name: "loyalty is real in sam." })).toBeVisible();
  await page.getByRole("button", { name: "loyalty is real in sam." }).click();
  await next(page);
  // words from the book are offered, and tapping one puts it in the line
  await page.getByLabel("the line").fill("loyalty is real in sam");
  await page.getByLabel("the line").press("End");
  await button(page, "gently").click();
  await expect(page.getByLabel("the line")).toHaveValue("loyalty is real in sam gently");
  await scan(page);
  await next(page);
  await page.getByLabel("how true does this feel?").fill("20");
  await expect(page.getByText(/smaller line may fit better/)).toBeVisible();
  await button(page, "keep it").click();
  // skipped before, so no closing check
  await expect(page.getByRole("heading", { name: "kept.", level: 1 })).toBeVisible();
  await expect(page.getByRole("img", { name: /before:/ })).toHaveCount(0);
});

test("with no lines yet, home invites the first one without any pressure", async ({ page }) => {
  await returning(page);
  const invite = page.getByTestId("lines-invite");
  await expect(invite).toBeVisible();
  await expect(invite).toContainText("when you'd like");
  await page.getByRole("link", { name: "make one" }).click();
  await expect(page).toHaveURL(/#\/grow\/lines\/new/);
});

test("why it works: three ideas, each with a source and an honest label", async ({ page }) => {
  await returning(page);
  await page.goto("./#/grow/lines/why");
  await expect(page.getByText(/Steele, 1988/)).toBeVisible();
  await expect(page.getByText(/Kross et al., 2014/)).toBeVisible();
  await expect(page.getByText(/Wood, Perunovic & Lee, 2009/)).toBeVisible();
  await scan(page);
});

test("the tile shows in practice", async ({ page }) => {
  await returning(page);
  await page.goto("./#/practice");
  await page.getByRole("link", { name: /your lines/ }).click();
  await expect(page).toHaveURL(/#\/grow\/lines$/);
});
