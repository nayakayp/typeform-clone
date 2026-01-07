import { test, expect } from "../fixtures/auth";

test.describe("Visual Regression - Form Builder", () => {
  test("form builder empty state", async ({ authenticatedPage: page }) => {
    await page.goto("/forms/new");
    await page.waitForLoadState("networkidle");

    // Wait for any animations to complete
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("form-builder-empty.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test("form builder with questions", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    // Click on first form if exists
    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot("form-builder-with-questions.png", {
        maxDiffPixels: 100,
        fullPage: false,
      });
    }
  });

  test("question type palette", async ({ authenticatedPage: page }) => {
    await page.goto("/forms/new");
    await page.waitForLoadState("networkidle");

    // Open question type palette/sidebar
    const addButton = page
      .locator(
        '[data-testid="add-question"], button:has-text("Add"), [data-testid="question-palette-trigger"]'
      )
      .first();

    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot("question-palette.png", {
        maxDiffPixels: 100,
        fullPage: false,
      });
    }
  });

  test("question settings panel", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);

      // Click on a question to open settings
      const questionBlock = page
        .locator(
          '[data-testid="question-block"], [data-question-id], .question-item'
        )
        .first();

      if (await questionBlock.isVisible({ timeout: 3000 }).catch(() => false)) {
        await questionBlock.click();
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot("question-settings.png", {
          maxDiffPixels: 100,
          fullPage: false,
        });
      }
    }
  });
});

test.describe("Visual Regression - Form Response", () => {
  test("welcome screen", async ({ page }) => {
    await page.goto("/f/demo");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("welcome-screen.png", {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });

  test("short text question", async ({ page }) => {
    await page.goto("/f/demo");
    await page.waitForLoadState("networkidle");

    // Start the form
    const startButton = page
      .locator('button:has-text("Start"), button:has-text("Begin")')
      .first();
    if (await startButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to a text question
    const textInput = page.locator('input[type="text"], textarea').first();
    if (await textInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(page).toHaveScreenshot("short-text-question.png", {
        maxDiffPixels: 100,
        fullPage: true,
      });
    }
  });

  test("multiple choice question", async ({ page }) => {
    await page.goto("/f/demo");
    await page.waitForLoadState("networkidle");

    const startButton = page
      .locator('button:has-text("Start"), button:has-text("Begin")')
      .first();
    if (await startButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startButton.click();
    }

    // Look for multiple choice options
    const optionButtons = page.locator(
      '[data-testid="option-button"], button[role="option"], .option-button, [data-choice]'
    );

    if ((await optionButtons.count()) > 0) {
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot("multiple-choice-question.png", {
        maxDiffPixels: 100,
        fullPage: true,
      });
    }
  });

  test("thank you screen", async ({ page }) => {
    await page.goto("/f/demo/thank-you");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("thank-you-screen.png", {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });
});

test.describe("Visual Regression - Dashboard", () => {
  test("forms list empty state", async ({ authenticatedPage: page }) => {
    // Navigate with query param to force empty state if available
    await page.goto("/forms?demo=empty");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const emptyState = page.locator(
      '[data-testid="empty-state"], .empty-state'
    );
    if (await emptyState.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(page).toHaveScreenshot("forms-list-empty.png", {
        maxDiffPixels: 100,
        fullPage: false,
      });
    }
  });

  test("forms list with cards", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("forms-list.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test("responses table", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);

      const responsesTab = page
        .locator(
          '[data-tab="responses"], button:has-text("Responses"), a:has-text("Responses")'
        )
        .first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot("responses-table.png", {
          maxDiffPixels: 100,
          fullPage: false,
        });
      }
    }
  });

  test("analytics dashboard", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);

      const analyticsTab = page
        .locator(
          '[data-tab="analytics"], button:has-text("Analytics"), a:has-text("Analytics")'
        )
        .first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot("analytics-dashboard.png", {
          maxDiffPixels: 100,
          fullPage: false,
        });
      }
    }
  });
});

test.describe("Visual Regression - Settings", () => {
  test("workspace settings", async ({ authenticatedPage: page }) => {
    await page.goto("/settings/workspace");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("workspace-settings.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test("team settings", async ({ authenticatedPage: page }) => {
    await page.goto("/settings/team");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("team-settings.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test("profile settings", async ({ authenticatedPage: page }) => {
    await page.goto("/settings/profile");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("profile-settings.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });
});

test.describe("Visual Regression - Theme Variations", () => {
  test("dark mode form builder", async ({ authenticatedPage: page }) => {
    await page.goto("/forms/new");
    await page.waitForLoadState("networkidle");

    // Toggle dark mode
    const themeToggle = page
      .locator(
        '[data-testid="theme-toggle"], button:has-text("Dark"), [aria-label="Toggle theme"]'
      )
      .first();

    if (await themeToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot("form-builder-dark.png", {
        maxDiffPixels: 100,
        fullPage: false,
      });
    }
  });

  test("dark mode form response", async ({ page }) => {
    await page.goto("/f/demo");
    await page.waitForLoadState("networkidle");

    // Set dark mode via system preference emulation
    await page.emulateMedia({ colorScheme: "dark" });
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("form-response-dark.png", {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });
});

test.describe("Visual Regression - Responsive", () => {
  test("form builder mobile", async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/forms/new");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("form-builder-mobile.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });

  test("form response mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/f/demo");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("form-response-mobile.png", {
      maxDiffPixels: 100,
      fullPage: true,
    });
  });

  test("form builder tablet", async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/forms/new");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot("form-builder-tablet.png", {
      maxDiffPixels: 100,
      fullPage: false,
    });
  });
});
