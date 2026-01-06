import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Typeform Clone/);
  });

  test("should display the main content", async ({ page }) => {
    await page.goto("/");
    // Check that the page loads without errors
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate to login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/.*login/);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/.*register/);
  });
});
