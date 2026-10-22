import { expect, test } from "@playwright/test";
import { button, returning } from "./helpers";

test("data from the first version is all here", async ({ page }) => {
  await returning(page);
  await expect(page.locator(".hello h1")).toContainText("sam.");
  // on a shared phone the line stays hidden until it's tapped
  await expect(page.locator(".told")).not.toContainText("hard weeks");
  await button(page, "tap to read it").click();
  await expect(page.locator(".told")).toContainText("hey sam, you've handled hard weeks before.");
  await page.goto("./#/book/voice");
  await expect(page.locator(".entry").first()).toContainText("all i can hear → clear");
  await page.getByRole("tab", { name: "about you" }).click();
  await expect(page.locator(".entries")).toContainText("sunrise");
});

test("the book grows a star for each thing kept, and shows what's been read and tried", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "you", exact: true }).click();
  await page.getByRole("link", { name: /your book/ }).click();
  await expect(page.getByRole("heading", { name: "your book", level: 1 })).toBeVisible();
  await expect(page.getByText("by sam")).toBeVisible();
  await expect(page.getByRole("img", { name: "a sky of 2 things you've kept" })).toBeVisible();
  await expect(page.locator(".cover .star")).toHaveCount(2);
  await expect(page.getByText("0 of 26 lessons read")).toBeVisible();
  await expect(page.getByRole("link", { name: "meet your inner voice: 0 of 4 read" })).toBeVisible();
  await expect(page.getByRole("img", { name: /^after you answered: .*all i can hear, then clear$/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "talk to you, used once" })).toBeVisible();
  await expect(page.getByRole("link", { name: "the dial, open to try" })).toBeVisible();
  await page.getByRole("link", { name: "about you: 1" }).click();
  await expect(page.getByRole("tab", { name: "about you" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".entries")).toContainText("sunrise");
  await page.getByRole("tab", { name: "words" }).press("ArrowRight");
  await expect(page).toHaveURL(/#\/book\/about$/);
  await page.getByRole("tab", { name: "about you" }).press("ArrowRight");
  await expect(page).toHaveURL(/#\/book\/keeper$/);
  await expect(page.getByRole("tab", { name: "keepers" })).toBeFocused();
});

test("entries can be edited and removed", async ({ page }) => {
  await returning(page);
  await page.goto("./#/book/voice");
  // edit and remove stay tucked away until asked for
  await expect(page.getByRole("button", { name: /^edit:/ })).toHaveCount(0);
  await page.getByRole("button", { name: /^edit or remove:/ }).first().click();
  await page.getByRole("button", { name: /^edit:/ }).first().click();
  await page.getByLabel("edit this entry").fill("hey sam, you've done hard weeks before.");
  await page.locator(".entries").getByRole("button", { name: "save", exact: true }).click();
  // focus comes back to the entry, not the top of the page
  await expect(page.getByRole("button", { name: /^edit or remove: hey sam, you've done/ })).toBeFocused();
  await expect(page.locator(".entry").first()).toContainText("you've done hard weeks before.");
  await page.reload();
  await expect(page.locator(".entry").first()).toContainText("you've done hard weeks before.");
  await page.getByRole("button", { name: /^edit or remove:/ }).first().click();
  await page.getByRole("button", { name: /^remove:/ }).first().click();
  await page.locator(".entries").getByRole("button", { name: "remove", exact: true }).click();
  await expect(page.getByText("every answer you keep lands here, in your words.")).toBeVisible();
});

test("settings: name, appearance, real help, and clearing everything", async ({ page }) => {
  await returning(page);
  await page.getByRole("link", { name: "you", exact: true }).click();
  await page.getByRole("link", { name: /settings/ }).click();
  await page.getByLabel("a name, a nickname, anything").fill("Sam B");
  await button(page, "save").click();
  await expect(page.getByText("saved.")).toBeVisible();

  await page.getByLabel("always dark").check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("match my phone").check();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);

  await expect(page.getByText("call or text 988")).toBeVisible();

  await page.getByRole("switch", { name: "read aloud" }).check();
  await expect(page.getByRole("button", { name: "read this screen aloud" })).toBeVisible();

  await button(page, "clear everything").click();
  await button(page, "clear it all").click();
  await page.goto("./#/book");
  await expect(page.getByRole("img", { name: "an empty sky, for now" })).toBeVisible();
  await page.goto("./#/book/voice");
  await expect(page.getByText("every answer you keep lands here, in your words.")).toBeVisible();
  await page.goto("./");
  await expect(page.locator(".hello h1")).toHaveText(/you\./);
});
