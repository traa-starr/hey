import type { Page } from "@playwright/test";

export const button = (page: Page, name: string | RegExp) =>
  page.getByRole("button", typeof name === "string" ? { name, exact: true } : { name });

// someone who has been here before, saved by the first version of hey you
export const V1 = {
  welcomed: true,
  name: "sam",
  tried: {},
  collected: {
    "my-words": [{ id: "a1", text: "hey sam, you've handled hard weeks before.", from: "talk to you", at: "2026-09-03T08:00:00.000Z", before: 5, after: 3 }],
    "what-i-like": [{ id: "b1", text: "sunrise", from: "this or that", at: "2026-09-02T09:00:00.000Z" }],
    "what-i-think": []
  }
};

export async function returning(page: Page) {
  await page.addInitScript((v1) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("heyyou.v1", JSON.stringify(v1));
      sessionStorage.setItem("seeded", "1");
    }
  }, V1);
  await page.goto("./");
  await page.locator(".greet").waitFor();
}
