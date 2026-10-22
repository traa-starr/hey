import { expect, test } from "@playwright/test";
import { returning } from "./helpers";

test("installable, and works offline after the first load", async ({ page, context }) => {
  await returning(page);
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    return link ? (await fetch(link.href)).json() : null;
  });
  expect(manifest).toMatchObject({ name: "hey you", display: "standalone", start_url: "/hey/" });
  expect(manifest.icons.some((i: { sizes: string }) => i.sizes === "512x512")).toBe(true);

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  // give the service worker a moment to finish precaching every screen
  await page.waitForTimeout(1500);

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".sky")).toBeVisible();
  for (const name of ["learn", "practice", "you"]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("./#/answer");
  await expect(page.getByRole("heading", { name: "what did your inner voice say?" })).toBeVisible();
  await context.setOffline(false);
});
