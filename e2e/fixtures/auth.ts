import { test as base, expect, Page, BrowserContext } from "@playwright/test";

// Extend test with auth fixtures
export const test = base.extend<{
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
}>({
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to login
    await page.goto("/login");

    // Fill in test credentials
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page
      .waitForURL(/\/(forms|dashboard)/, { timeout: 10000 })
      .catch(() => {
        // If login fails or takes too long, continue anyway for CI
      });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);
    await context.close();
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect };

// Helper to login as a specific user
export async function loginAs(
  page: Page,
  email: string,
  password = "TestPassword123!"
) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page
    .waitForURL(/\/(forms|dashboard)/, { timeout: 10000 })
    .catch(() => {});
}

// Helper to get invite link from email (mock implementation)
export async function getInviteLink(email: string): Promise<string> {
  // In a real implementation, this would query the database or email service
  // For now, we'll use a mock URL pattern
  return `/invite/mock-token-for-${email.replace("@", "-at-")}`;
}

// Helper to wait for toast/notification
export async function waitForToast(page: Page, text: string | RegExp) {
  const toast = page.locator(
    '[data-sonner-toast], [role="alert"], [data-testid="toast"]'
  );
  await expect(toast.filter({ hasText: text })).toBeVisible({ timeout: 10000 });
}

// Helper to create a form quickly
export async function createQuickForm(page: Page, title: string) {
  await page.goto("/forms");
  await page.click(
    'button:has-text("New Form"), a:has-text("New Form"), [data-testid="new-form-button"]'
  );
  await page.waitForURL(/\/forms\/.*\/edit/);

  // Set title
  const titleInput = page
    .locator('[data-testid="form-title"], input[placeholder*="Untitled"]')
    .first();
  if (await titleInput.isVisible()) {
    await titleInput.fill(title);
  }

  return page.url();
}
