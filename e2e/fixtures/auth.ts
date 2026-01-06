import { test as base, expect, Page } from "@playwright/test";

// Extend the base test with authenticated page fixture
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication state
    // In a real app, this would log in or set auth cookies
    await page.goto("/");

    // For now, just use the page as-is
    // Authentication setup will be added when auth is implemented
    await use(page);
  },
});

export { expect };
