import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  // Visual comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: "disabled",
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  // Snapshot directory for visual tests
  snapshotDir: "./e2e/visual/__snapshots__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}{ext}",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual-regression",
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Consistent viewport for visual tests
        viewport: { width: 1280, height: 720 },
        // Disable animations for consistent screenshots
        launchOptions: {
          args: ["--disable-animations"],
        },
      },
    },
    {
      name: "mobile-visual",
      testMatch: /visual\/.*\.spec\.ts/,
      use: {
        ...devices["iPhone 13"],
      },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
