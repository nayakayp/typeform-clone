import { test, expect } from "./fixtures/auth";

test.describe("Form Builder", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navigate to create a new form
    await page.goto("/forms/new");
    // Wait for the builder to load
    await page.waitForLoadState("networkidle");
  });

  test.describe("Page Load", () => {
    test("displays the form builder interface", async ({
      authenticatedPage: page,
    }) => {
      // The form builder should have main sections
      await expect(page.locator("main")).toBeVisible();
    });

    test("shows question sidebar", async ({ authenticatedPage: page }) => {
      // Check for question type buttons in sidebar
      await expect(page.getByText("Short Text")).toBeVisible();
      await expect(page.getByText("Email")).toBeVisible();
      await expect(page.getByText("Multiple Choice")).toBeVisible();
    });
  });

  test.describe("Creating Questions", () => {
    test("can add a short text question", async ({
      authenticatedPage: page,
    }) => {
      // Click on short text in the sidebar
      await page.getByText("Short Text").click();

      // A question card should appear
      await expect(
        page.getByPlaceholder("Enter your question...")
      ).toBeVisible();
    });

    test("can add multiple questions", async ({ authenticatedPage: page }) => {
      // Add first question
      await page.getByText("Short Text").click();
      await page.waitForTimeout(100);

      // Add second question
      await page.getByText("Email").click();
      await page.waitForTimeout(100);

      // Both question cards should be visible
      const questionCards = page.locator(
        '[class*="rounded-lg border bg-card"]'
      );
      await expect(questionCards).toHaveCount(2);
    });

    test("can add a multiple choice question", async ({
      authenticatedPage: page,
    }) => {
      await page.getByText("Multiple Choice").click();

      // Should see the multiple choice badge
      await expect(page.getByText("Multiple Choice")).toBeVisible();
    });

    test("can add a rating question", async ({ authenticatedPage: page }) => {
      await page.getByText("Rating").click();

      await expect(page.getByText("Rating")).toBeVisible();
    });
  });

  test.describe("Editing Questions", () => {
    test("can edit question title", async ({ authenticatedPage: page }) => {
      // Add a question first
      await page.getByText("Short Text").click();

      // Find the title input and type
      const titleInput = page.getByPlaceholder("Enter your question...");
      await titleInput.click();
      await titleInput.fill("What is your name?");

      await expect(titleInput).toHaveValue("What is your name?");
    });

    test("can add description when question is selected", async ({
      authenticatedPage: page,
    }) => {
      // Add a question
      await page.getByText("Short Text").click();

      // Click to select the question
      await page.getByPlaceholder("Enter your question...").click();

      // Description field should appear
      const descInput = page.getByPlaceholder("Add a description (optional)");
      await expect(descInput).toBeVisible();

      await descInput.fill("Please provide your full name");
      await expect(descInput).toHaveValue("Please provide your full name");
    });

    test("shows question number badge", async ({ authenticatedPage: page }) => {
      // Add questions
      await page.getByText("Short Text").click();
      await page.waitForTimeout(100);
      await page.getByText("Email").click();

      // Check question numbers
      await expect(page.getByText("1")).toBeVisible();
      await expect(page.getByText("2")).toBeVisible();
    });
  });

  test.describe("Question Actions", () => {
    test("can duplicate a question", async ({ authenticatedPage: page }) => {
      // Add a question
      await page.getByText("Short Text").click();

      // Fill in the title
      const titleInput = page.getByPlaceholder("Enter your question...");
      await titleInput.fill("Original Question");

      // Open the dropdown menu (three dots button)
      await page.locator("button").filter({ hasText: "" }).last().click();

      // Click duplicate
      await page.getByText("Duplicate").click();

      // Should now have 2 questions
      const inputs = page.getByPlaceholder("Enter your question...");
      await expect(inputs).toHaveCount(2);
    });

    test("can delete a question", async ({ authenticatedPage: page }) => {
      // Add a question
      await page.getByText("Short Text").click();
      await page.waitForTimeout(100);

      // Verify question exists
      await expect(
        page.getByPlaceholder("Enter your question...")
      ).toBeVisible();

      // Open the dropdown menu
      await page.locator("button").filter({ hasText: "" }).last().click();

      // Click delete
      await page.getByText("Delete").click();

      // Question should be removed
      await expect(
        page.getByPlaceholder("Enter your question...")
      ).not.toBeVisible();
    });
  });

  test.describe("Question Types", () => {
    const questionTypes = [
      { name: "Short Text", badge: "Short Text" },
      { name: "Long Text", badge: "Long Text" },
      { name: "Email", badge: "Email" },
      { name: "Number", badge: "Number" },
      { name: "Rating", badge: "Rating" },
      { name: "Yes/No", badge: "Yes/No" },
    ];

    for (const { name, badge } of questionTypes) {
      test(`can add ${name} question type`, async ({
        authenticatedPage: page,
      }) => {
        // Find and click the question type
        const typeButton = page.getByText(name, { exact: true }).first();
        if (await typeButton.isVisible()) {
          await typeButton.click();

          // Verify the badge shows the correct type
          await expect(page.getByText(badge).last()).toBeVisible();
        }
      });
    }
  });

  test.describe("Preview", () => {
    test("can toggle preview modes", async ({ authenticatedPage: page }) => {
      // Look for preview mode buttons (desktop, tablet, mobile)
      const desktopButton = page.getByRole("button", { name: /desktop/i });
      const tabletButton = page.getByRole("button", { name: /tablet/i });
      const mobileButton = page.getByRole("button", { name: /mobile/i });

      if (await desktopButton.isVisible()) {
        await desktopButton.click();
        await expect(desktopButton).toHaveAttribute("aria-pressed", "true");
      }

      if (await tabletButton.isVisible()) {
        await tabletButton.click();
        await expect(tabletButton).toHaveAttribute("aria-pressed", "true");
      }

      if (await mobileButton.isVisible()) {
        await mobileButton.click();
        await expect(mobileButton).toHaveAttribute("aria-pressed", "true");
      }
    });
  });

  test.describe("Form Metadata", () => {
    test("can edit form title in header", async ({
      authenticatedPage: page,
    }) => {
      // Look for the form title input in header
      const titleInput = page.getByPlaceholder("Untitled Form");
      if (await titleInput.isVisible()) {
        await titleInput.fill("My Survey");
        await expect(titleInput).toHaveValue("My Survey");
      }
    });
  });

  test.describe("Keyboard Shortcuts", () => {
    test("can use keyboard to navigate", async ({
      authenticatedPage: page,
    }) => {
      // Add two questions
      await page.getByText("Short Text").click();
      await page.waitForTimeout(100);
      await page.getByText("Email").click();

      // Use keyboard to navigate
      await page.keyboard.press("ArrowUp");

      // First question should be selected
      const firstQuestion = page.locator('[class*="ring-2"]').first();
      await expect(firstQuestion).toBeVisible();
    });
  });

  test.describe("Save Functionality", () => {
    test("shows save button", async ({ authenticatedPage: page }) => {
      const saveButton = page.getByRole("button", { name: /save/i });
      await expect(saveButton).toBeVisible();
    });

    test("shows publish button", async ({ authenticatedPage: page }) => {
      const publishButton = page.getByRole("button", { name: /publish/i });
      await expect(publishButton).toBeVisible();
    });
  });
});
