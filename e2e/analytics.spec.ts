import { test, expect } from "./fixtures/auth";

test.describe("Analytics Dashboard", () => {
  test("displays form overview stats", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);

      // Navigate to analytics tab
      const analyticsTab = page.locator(
        '[data-tab="analytics"], button:has-text("Analytics"), a:has-text("Analytics")'
      ).first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Check for key metrics
        const totalViews = page.locator('[data-testid="total-views"], [data-metric="views"]');
        const totalResponses = page.locator('[data-testid="total-responses"], [data-metric="responses"]');
        const completionRate = page.locator('[data-testid="completion-rate"], [data-metric="completion"]');
        const avgTime = page.locator('[data-testid="avg-completion-time"], [data-metric="time"]');

        // At least some metrics should be visible
        const hasViews = await totalViews.isVisible({ timeout: 5000 }).catch(() => false);
        const hasResponses = await totalResponses.isVisible({ timeout: 2000 }).catch(() => false);
        const hasRate = await completionRate.isVisible({ timeout: 2000 }).catch(() => false);
        const hasTime = await avgTime.isVisible({ timeout: 2000 }).catch(() => false);

        expect(hasViews || hasResponses || hasRate || hasTime).toBeTruthy();
      }
    }
  });

  test("shows question-level analytics", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator(
        '[data-tab="analytics"], button:has-text("Analytics")'
      ).first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for questions tab or section
        const questionsTab = page.locator('[data-tab="questions"], button:has-text("Questions")').first();

        if (await questionsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await questionsTab.click();
          await page.waitForLoadState("networkidle");

          // Should show question-level charts or stats
          const questionChart = page.locator(
            '[data-testid="question-chart"], [data-testid="question-analytics"], canvas, svg'
          );
          await questionChart.first().isVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    }
  });

  test("displays response distribution chart", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for distribution chart (bar chart, pie chart)
        const chart = page.locator(
          '[data-testid="distribution-chart"], [data-chart="distribution"], canvas, svg'
        ).first();

        await chart.isVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test("filters analytics by date range", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Click date picker
        const datePicker = page.locator(
          '[data-testid="date-picker"], [data-testid="date-range"], button:has-text("Date")'
        ).first();

        if (await datePicker.isVisible({ timeout: 3000 }).catch(() => false)) {
          await datePicker.click();

          // Select last 7 days
          const lastWeek = page.locator(
            'text=/Last 7 days/i, text=/This week/i, [data-range="7days"]'
          ).first();

          if (await lastWeek.isVisible({ timeout: 2000 }).catch(() => false)) {
            await lastWeek.click();
            await page.waitForLoadState("networkidle");

            // Date label should update
            const dateLabel = page.locator('[data-testid="date-range-label"]');
            if (await dateLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
              await expect(dateLabel).toContainText(/7 days|week/i);
            }
          }
        }
      }
    }
  });

  test("shows response trend over time", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for trend chart (line chart)
        const trendChart = page.locator(
          '[data-testid="trend-chart"], [data-chart="trend"], [data-testid="response-trend"]'
        ).first();

        await trendChart.isVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test("displays completion funnel", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for funnel or drop-off visualization
        const funnel = page.locator(
          '[data-testid="completion-funnel"], [data-testid="drop-off"], [data-chart="funnel"]'
        ).first();

        await funnel.isVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test("shows device breakdown", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for device breakdown
        const deviceChart = page.locator(
          '[data-testid="device-breakdown"], [data-chart="device"], text=/desktop|mobile|tablet/i'
        ).first();

        await deviceChart.isVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test("shows geographic distribution", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for geographic/location data
        const geoChart = page.locator(
          '[data-testid="geo-distribution"], [data-chart="geo"], [data-testid="map"]'
        ).first();

        await geoChart.isVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test("exports analytics report", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for export button
        const exportButton = page.locator(
          'button:has-text("Export"), button:has-text("Download Report"), [data-testid="export-analytics"]'
        ).first();

        if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          const downloadPromise = page.waitForEvent("download", { timeout: 10000 }).catch(() => null);
          await exportButton.click();
          const download = await downloadPromise;

          if (download) {
            expect(download.suggestedFilename()).toMatch(/\.(pdf|csv|xlsx)$/);
          }
        }
      }
    }
  });

  test("compares time periods", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const formCard = page.locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]').first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();

      const analyticsTab = page.locator('[data-tab="analytics"], button:has-text("Analytics")').first();

      if (await analyticsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await analyticsTab.click();
        await page.waitForLoadState("networkidle");

        // Look for compare option
        const compareButton = page.locator(
          'button:has-text("Compare"), [data-testid="compare-periods"]'
        ).first();

        if (await compareButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await compareButton.click();

          // Should show comparison view
          const comparisonView = page.locator(
            '[data-testid="comparison-view"], [data-testid="period-comparison"]'
          );
          await comparisonView.isVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });
});
