import { expect, test } from "@playwright/test";
import { button, returning } from "./helpers";

test("data from the first version is all here", async ({ page }) => {
  await returning(page);
  await expect(page.locator(".greet")).toContainText("sam.");
  // on a shared phone the line stays hidden until it's tapped
  await expect(page.locator(".resurface")).not.toContainText("hard weeks");
  await button(page, "tap to read it").click();
  await expect(page.locator(".resurface")).toContainText("hey sam, you've handled hard weeks before.");
  await page.getByRole("link", { name: "your book" }).click();
  await expect(page.locator(".entry").first()).toContainText("all i can hear → clear");
  await page.getByRole("tab", { name: "about you" }).click();
  await expect(page.locator(".entries")).toContainText("sunrise");
});

test("entries can be edited and removed", async ({ page }) => {
  await returning(page);
  await page.goto("./#/book");
  await page.getByRole("button", { name: /^edit:/ }).first().click();
  await page.getByLabel("edit this entry").fill("hey sam, you've done hard weeks before.");
  await page.locator(".entries").getByRole("button", { name: "save", exact: true }).click();
  await expect(page.locator(".entry").first()).toContainText("you've done hard weeks before.");
  await page.reload();
  await expect(page.locator(".entry").first()).toContainText("you've done hard weeks before.");
  await page.getByRole("button", { name: /^remove:/ }).first().click();
  await page.locator(".entries").getByRole("button", { name: "remove", exact: true }).click();
  await expect(page.getByText("every answer you keep lands here, in your words.")).toBeVisible();
});

test("settings: name, appearance, real help, and clearing everything", async ({ page }) => {
  await returning(page);
  await page.goto("./#/book");
  await page.getByLabel("a name, a nickname, anything").fill("Sam B");
  await button(page, "save").click();
  await expect(page.getByText("saved.")).toBeVisible();

  await page.getByLabel("always dark").check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByLabel("follow the time of day").check();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);

  await expect(page.getByText("call or text 988")).toBeVisible();

  await page.getByRole("switch", { name: "read aloud" }).check();
  await expect(page.getByRole("button", { name: "read this screen aloud" })).toBeVisible();

  await button(page, "clear everything").click();
  await button(page, "clear it all").click();
  await expect(page.getByText("every answer you keep lands here, in your words.")).toBeVisible();
  await page.getByRole("link", { name: "today" }).click();
  await expect(page.locator(".greet")).toHaveText(/you\./);
});
