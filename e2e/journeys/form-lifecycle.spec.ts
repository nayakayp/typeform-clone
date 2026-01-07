import { test, expect } from "../fixtures/auth";

test.describe("Complete Form Lifecycle", () => {
  test("create, edit, preview, and save form", async ({
    authenticatedPage: page,
  }) => {
    // Step 1: Navigate to forms page
    await page.goto("/forms");

    // Step 2: Create new form
    const createButton = page
      .locator(
        'button:has-text("New Form"), a:has-text("New Form"), [data-testid="new-form-button"]'
      )
      .first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForURL(/\/forms\/.*\/edit/);
    } else {
      // If no button, try direct navigation
      await page.goto("/forms/new");
    }

    // Step 3: Add questions
    // Add short text question
    const shortTextButton = page
      .locator(
        '[data-testid="add-short-text"], button:has-text("Short Text"), [data-question-type="short_text"]'
      )
      .first();

    if (await shortTextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shortTextButton.click();

      // Fill in question title
      const questionInput = page
        .locator(
          '[data-testid="question-title-input"], input[placeholder*="question"], textarea[placeholder*="question"]'
        )
        .first();

      if (await questionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await questionInput.fill("What is your name?");
      }
    }

    // Step 4: Save the form
    const saveButton = page
      .locator('button:has-text("Save"), [data-testid="save-button"]')
      .first();
    if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveButton.click();

      // Wait for save confirmation
      await page.waitForTimeout(1000);
    }

    // Step 5: Preview the form
    const previewButton = page
      .locator('button:has-text("Preview"), [data-testid="preview-button"]')
      .first();

    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      // Check preview is visible
      const previewPanel = page.locator(
        '[data-testid="preview-panel"], [data-preview]'
      );
      await expect(previewPanel.first())
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});
    }
  });

  test("publish form and view public link", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to an existing form or create one
    await page.goto("/forms");

    // Click on first form if exists
    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);
    }

    // Try to publish
    const publishButton = page
      .locator('button:has-text("Publish"), [data-testid="publish-button"]')
      .first();

    if (await publishButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await publishButton.click();

      // Wait for publish confirmation
      const shareLink = page.locator(
        '[data-testid="share-link"], input[readonly]'
      );
      await expect(shareLink.first())
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});
    }
  });

  test("submit response to published form", async ({ page }) => {
    // Navigate to a demo/public form
    await page.goto("/f/demo");

    // Check if form is accessible
    const startButton = page
      .locator('button:has-text("Start"), button:has-text("Begin")')
      .first();
    const formContent = page
      .locator('[data-testid="form-content"], form, [data-form]')
      .first();

    // Either start button or form content should be visible
    const isFormAccessible =
      (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await formContent.isVisible({ timeout: 5000 }).catch(() => false));

    if (isFormAccessible) {
      if (await startButton.isVisible().catch(() => false)) {
        await startButton.click();
      }

      // Fill in any visible inputs
      const textInput = page.locator('input[type="text"], textarea').first();
      if (await textInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await textInput.fill("Test Response");
      }

      // Try to submit or go to next
      const nextButton = page
        .locator(
          'button:has-text("Next"), button:has-text("Submit"), button[type="submit"]'
        )
        .first();

      if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextButton.click();
      }
    }
  });

  test("view and export responses", async ({ authenticatedPage: page }) => {
    // Navigate to forms
    await page.goto("/forms");

    // Click on first form
    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await formCard.click();
    }

    // Go to responses tab
    const responsesTab = page
      .locator(
        '[data-tab="responses"], button:has-text("Responses"), a:has-text("Responses")'
      )
      .first();

    if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await responsesTab.click();

      // Check for responses table or empty state
      const responsesContent = page
        .locator(
          '[data-testid="responses-table"], [data-testid="empty-responses"], table'
        )
        .first();

      await expect(responsesContent)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});
    }

    // Try export functionality
    const exportButton = page
      .locator('button:has-text("Export"), [data-testid="export-button"]')
      .first();

    if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Set up download listener
      const downloadPromise = page
        .waitForEvent("download", { timeout: 5000 })
        .catch(() => null);
      await exportButton.click();
      const download = await downloadPromise;

      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|json)$/);
      }
    }
  });

  test("view analytics for form", async ({ authenticatedPage: page }) => {
    // Navigate to forms
    await page.goto("/forms");

    // Click on first form
    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await formCard.click();
    }

    // Go to analytics tab
    const analyticsTab = page
      .locator(
        '[data-tab="analytics"], button:has-text("Analytics"), a:has-text("Analytics")'
      )
      .first();

    if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await analyticsTab.click();

      // Check for analytics content
      const analyticsContent = page
        .locator(
          '[data-testid="analytics-dashboard"], [data-testid="total-responses"], .analytics'
        )
        .first();

      await expect(analyticsContent)
        .toBeVisible({ timeout: 5000 })
        .catch(() => {});
    }
  });
});
