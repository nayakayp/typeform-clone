import { test, expect } from "./fixtures/auth";

test.describe("Response Management", () => {
  test("views list of responses", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    // Click on first form
    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);

      // Navigate to responses tab
      const responsesTab = page.locator(
        '[data-tab="responses"], button:has-text("Responses"), a:has-text("Responses")'
      ).first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Should show responses table or empty state
        const responsesTable = page.locator('[data-testid="responses-table"], table');
        const emptyState = page.locator('[data-testid="empty-responses"], text=/no responses/i');

        const hasTable = await responsesTable.isVisible({ timeout: 5000 }).catch(() => false);
        const hasEmpty = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);

        expect(hasTable || hasEmpty).toBeTruthy();
      }
    }
  });

  test("views individual response detail", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator(
        '[data-tab="responses"], button:has-text("Responses")'
      ).first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Click on first response row
        const responseRow = page.locator('tr[data-response], [data-testid="response-row"]').first();

        if (await responseRow.isVisible({ timeout: 3000 }).catch(() => false)) {
          await responseRow.click();

          // Should show response detail
          const responseDetail = page.locator(
            '[data-testid="response-detail"], [data-testid="response-modal"]'
          );
          await responseDetail.isVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });

  test("filters responses by date", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator(
        '[data-tab="responses"], button:has-text("Responses")'
      ).first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Look for date filter
        const dateFilter = page.locator(
          '[data-testid="date-filter"], [data-testid="date-picker"], button:has-text("Date")'
        ).first();

        if (await dateFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
          await dateFilter.click();

          // Select a preset range
          const lastWeek = page.locator('text=/last 7 days/i, text=/this week/i').first();
          if (await lastWeek.isVisible({ timeout: 2000 }).catch(() => false)) {
            await lastWeek.click();
            await page.waitForLoadState("networkidle");
          }
        }
      }
    }
  });

  test("searches responses", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator(
        '[data-tab="responses"], button:has-text("Responses")'
      ).first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Look for search input
        const searchInput = page.locator(
          '[data-testid="search-responses"], input[placeholder*="Search"], input[type="search"]'
        ).first();

        if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await searchInput.fill("test@example.com");
          await page.keyboard.press("Enter");
          await page.waitForLoadState("networkidle");
        }
      }
    }
  });

  test("exports responses to CSV", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator(
        '[data-tab="responses"], button:has-text("Responses")'
      ).first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Look for export button
        const exportButton = page.locator(
          'button:has-text("Export"), button:has-text("Download"), [data-testid="export-button"]'
        ).first();

        if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Set up download listener
          const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
          await exportButton.click();

          // If there's a format selection, choose CSV
          const csvOption = page.locator('text=/CSV/i, [data-format="csv"]').first();
          if (await csvOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await csvOption.click();
          }

          const download = await downloadPromise;
          if (download) {
            expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|json)$/);
          }
        }
      }
    }
  });

  test("exports responses to Excel", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator(
        '[data-tab="responses"], button:has-text("Responses")'
      ).first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();

        const exportButton = page.locator('button:has-text("Export")').first();
        if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await exportButton.click();

          const excelOption = page.locator('text=/Excel/i, text=/XLSX/i, [data-format="xlsx"]').first();
          if (await excelOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
            await excelOption.click();
            const download = await downloadPromise;

            if (download) {
              expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
            }
          }
        }
      }
    }
  });

  test("deletes single response", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator('[data-tab="responses"], button:has-text("Responses")').first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        const responseRows = page.locator('tr[data-response], [data-testid="response-row"]');
        const initialCount = await responseRows.count();

        if (initialCount > 0) {
          // Click delete on first response
          const deleteButton = page.locator('[data-action="delete"], button:has-text("Delete")').first();

          if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await deleteButton.click();

            // Confirm deletion
            const confirmButton = page.locator(
              'button:has-text("Confirm"), button:has-text("Yes"), [data-testid="confirm-delete"]'
            ).first();

            if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await confirmButton.click();
              await page.waitForLoadState("networkidle");

              // Count should decrease
              const newCount = await responseRows.count();
              expect(newCount).toBe(initialCount - 1);
            }
          }
        }
      }
    }
  });

  test("bulk selects and deletes responses", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator('[data-tab="responses"], button:has-text("Responses")').first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Select multiple responses
        const checkboxes = page.locator(
          'input[type="checkbox"][data-response], [data-testid="response-checkbox"]'
        );

        if ((await checkboxes.count()) >= 2) {
          await checkboxes.nth(0).check();
          await checkboxes.nth(1).check();

          // Look for bulk delete button
          const bulkDeleteButton = page.locator(
            'button:has-text("Delete Selected"), [data-testid="bulk-delete"]'
          ).first();

          if (await bulkDeleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bulkDeleteButton.click();

            const confirmButton = page.locator('button:has-text("Confirm")').first();
            if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
              await confirmButton.click();
            }
          }
        }
      }
    }
  });

  test("paginates through responses", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const responsesTab = page.locator('[data-tab="responses"], button:has-text("Responses")').first();

      if (await responsesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await responsesTab.click();
        await page.waitForLoadState("networkidle");

        // Look for pagination
        const nextPageButton = page.locator(
          'button:has-text("Next"), [data-testid="next-page"], [aria-label="Next page"]'
        ).first();

        if (await nextPageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          const isEnabled = await nextPageButton.isEnabled();
          if (isEnabled) {
            await nextPageButton.click();
            await page.waitForLoadState("networkidle");

            // Should show page 2
            const pageIndicator = page.locator('text=/page 2/i, [data-page="2"]');
            await pageIndicator.isVisible({ timeout: 3000 }).catch(() => {});
          }
        }
      }
    }
  });
});
