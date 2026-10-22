import { defineConfig, devices } from "@playwright/test";

// phone-sized checks against the production build, the way people will use it
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173/hey/",
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    trace: "retain-on-failure",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
  },
  projects: [
    { name: "light", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, colorScheme: "light" } },
    { name: "dark", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, colorScheme: "dark" }, testMatch: /a11y/ }
  ],
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/hey/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
