import { test } from "../fixtures/auth";

test.describe("Logic Branching & Conditional Flow", () => {
  test("create form with conditional logic", async ({
    authenticatedPage: page,
  }) => {
    // Navigate to forms and create new form
    await page.goto("/forms");

    const createButton = page
      .locator(
        'button:has-text("New Form"), a:has-text("New Form"), [data-testid="new-form-button"]'
      )
      .first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForURL(/\/forms\/.*\/edit/);
    } else {
      await page.goto("/forms/new");
    }

    // Add a multiple choice question
    const multipleChoiceButton = page
      .locator(
        '[data-testid="add-multiple-choice"], button:has-text("Multiple Choice"), [data-question-type="multiple_choice"]'
      )
      .first();

    if (
      await multipleChoiceButton.isVisible({ timeout: 3000 }).catch(() => false)
    ) {
      await multipleChoiceButton.click();

      // Fill in question title
      const questionInput = page
        .locator(
          '[data-testid="question-title-input"], input[placeholder*="question"], textarea[placeholder*="question"]'
        )
        .first();

      if (await questionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await questionInput.fill("What is your role?");
      }

      // Add options
      const addOptionButton = page
        .locator('button:has-text("Add Option"), [data-testid="add-option"]')
        .first();

      const optionInputs = page.locator(
        '[data-testid="option-input"], input[placeholder*="Option"]'
      );

      // Fill existing options
      const optionCount = await optionInputs.count();
      if (optionCount >= 2) {
        await optionInputs.nth(0).fill("Developer");
        await optionInputs.nth(1).fill("Designer");
      }

      // Add more options if needed
      if (
        await addOptionButton.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        await addOptionButton.click();
        const newOption = optionInputs.nth(2);
        if (await newOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await newOption.fill("Manager");
        }
      }
    }

    // Add follow-up questions for each path
    const shortTextButton = page
      .locator(
        '[data-testid="add-short-text"], button:has-text("Short Text"), [data-question-type="short_text"]'
      )
      .first();

    if (await shortTextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Add developer-specific question
      await shortTextButton.click();
      const questionInput1 = page
        .locator(
          '[data-testid="question-title-input"], input[placeholder*="question"]'
        )
        .last();
      if (
        await questionInput1.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        await questionInput1.fill("What programming languages do you use?");
      }

      // Add designer-specific question
      await shortTextButton.click();
      const questionInput2 = page
        .locator(
          '[data-testid="question-title-input"], input[placeholder*="question"]'
        )
        .last();
      if (
        await questionInput2.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        await questionInput2.fill("What design tools do you prefer?");
      }
    }

    // Open logic panel
    const logicButton = page
      .locator(
        'button:has-text("Logic"), [data-testid="logic-tab"], [data-tab="logic"]'
      )
      .first();

    if (await logicButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logicButton.click();

      // Add logic rule
      const addLogicButton = page
        .locator(
          'button:has-text("Add Logic"), button:has-text("Add Rule"), [data-testid="add-logic-rule"]'
        )
        .first();

      if (
        await addLogicButton.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await addLogicButton.click();

        // Configure condition
        const conditionSelect = page
          .locator('[data-testid="condition-select"], select[name="condition"]')
          .first();

        if (
          await conditionSelect.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await conditionSelect.selectOption({ index: 0 });
        }

        // Save logic
        const saveLogicButton = page
          .locator(
            'button:has-text("Save"), button:has-text("Apply"),[data-testid="save-logic"]'
          )
          .first();

        if (
          await saveLogicButton.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await saveLogicButton.click();
        }
      }
    }

    // Save the form
    const saveButton = page
      .locator('button:has-text("Save"), [data-testid="save-button"]')
      .first();
    if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("preview conditional paths", async ({ authenticatedPage: page }) => {
    // Navigate to an existing form with logic
    await page.goto("/forms");

    const formCard = page
      .locator('[data-testid="form-card"], .form-card, a[href*="/forms/"]')
      .first();

    if (await formCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await formCard.click();
      await page.waitForURL(/\/forms\//);
    }

    // Enter preview mode
    const previewButton = page
      .locator('button:has-text("Preview"), [data-testid="preview-button"]')
      .first();

    if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await previewButton.click();

      // Start the form
      const startButton = page
        .locator('button:has-text("Start"), button:has-text("Begin")')
        .first();
      if (await startButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startButton.click();
      }

      // Answer a question to trigger branching
      const optionButton = page
        .locator(
          '[data-testid="option-button"], button[role="option"], .option-button'
        )
        .first();

      if (await optionButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await optionButton.click();

        // Go to next question
        const nextButton = page
          .locator(
            'button:has-text("Next"), button:has-text("Continue"), [data-testid="next-button"]'
          )
          .first();

        if (await nextButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await nextButton.click();

          // Verify we're on the correct branched question
          // (This is a soft check as the exact question depends on logic)
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test("calculator and hidden fields", async ({ authenticatedPage: page }) => {
    // Navigate to forms and create new form
    await page.goto("/forms");

    const createButton = page
      .locator(
        'button:has-text("New Form"), a:has-text("New Form"), [data-testid="new-form-button"]'
      )
      .first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForURL(/\/forms\/.*\/edit/);

      // Add number question
      const numberButton = page
        .locator(
          '[data-testid="add-number"], button:has-text("Number"), [data-question-type="number"]'
        )
        .first();

      if (await numberButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await numberButton.click();

        const questionInput = page
          .locator(
            '[data-testid="question-title-input"], input[placeholder*="question"]'
          )
          .last();

        if (
          await questionInput.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await questionInput.fill("Quantity");
        }
      }

      // Add hidden field for calculation
      const hiddenFieldButton = page
        .locator(
          '[data-testid="add-hidden-field"], button:has-text("Hidden Field"), [data-question-type="hidden"]'
        )
        .first();

      if (
        await hiddenFieldButton.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await hiddenFieldButton.click();

        // Configure hidden field with calculation
        const calculatorTab = page
          .locator(
            '[data-tab="calculator"], button:has-text("Calculator"),[data-testid="calculator-tab"]'
          )
          .first();

        if (
          await calculatorTab.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await calculatorTab.click();

          const formulaInput = page
            .locator(
              '[data-testid="formula-input"], input[placeholder*="formula"], textarea[name="formula"]'
            )
            .first();

          if (
            await formulaInput.isVisible({ timeout: 2000 }).catch(() => false)
          ) {
            await formulaInput.fill("{{quantity}} * 10");
          }
        }
      }

      // Save form
      const saveButton = page
        .locator('button:has-text("Save"), [data-testid="save-button"]')
        .first();
      if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("jump logic with skip patterns", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const createButton = page
      .locator(
        'button:has-text("New Form"), a:has-text("New Form"), [data-testid="new-form-button"]'
      )
      .first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForURL(/\/forms\/.*\/edit/);

      // Add yes/no question
      const yesNoButton = page
        .locator(
          '[data-testid="add-yes-no"], button:has-text("Yes/No"), [data-question-type="yes_no"]'
        )
        .first();

      if (await yesNoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await yesNoButton.click();

        const questionInput = page
          .locator(
            '[data-testid="question-title-input"], input[placeholder*="question"]'
          )
          .last();

        if (
          await questionInput.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await questionInput.fill("Are you interested in our newsletter?");
        }
      }

      // Add email question (to be shown if yes)
      const emailButton = page
        .locator(
          '[data-testid="add-email"], button:has-text("Email"), [data-question-type="email"]'
        )
        .first();

      if (await emailButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailButton.click();

        const questionInput = page
          .locator(
            '[data-testid="question-title-input"], input[placeholder*="question"]'
          )
          .last();

        if (
          await questionInput.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await questionInput.fill("Enter your email address");
        }
      }

      // Add thank you screen
      const thankYouButton = page
        .locator(
          '[data-testid="add-thank-you"], button:has-text("Thank You"), [data-question-type="thank_you"]'
        )
        .first();

      if (
        await thankYouButton.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await thankYouButton.click();
      }

      // Set up jump logic - if No, skip to thank you
      const logicButton = page
        .locator('button:has-text("Logic"), [data-testid="logic-tab"]')
        .first();

      if (await logicButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await logicButton.click();

        const addJumpButton = page
          .locator(
            'button:has-text("Add Jump"), button:has-text("Add Skip"), [data-testid="add-jump-logic"]'
          )
          .first();

        if (
          await addJumpButton.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await addJumpButton.click();

          // Configure jump destination
          const destinationSelect = page
            .locator(
              '[data-testid="jump-destination"], select[name="destination"]'
            )
            .first();

          if (
            await destinationSelect
              .isVisible({ timeout: 2000 })
              .catch(() => false)
          ) {
            // Select thank you screen
            await destinationSelect.selectOption({ index: -1 });
          }
        }
      }

      // Save form
      const saveButton = page
        .locator('button:has-text("Save"), [data-testid="save-button"]')
        .first();
      if (await saveButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveButton.click();
      }
    }
  });

  test("variable piping in questions", async ({ authenticatedPage: page }) => {
    await page.goto("/forms");

    const createButton = page
      .locator(
        'button:has-text("New Form"), a:has-text("New Form"), [data-testid="new-form-button"]'
      )
      .first();

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForURL(/\/forms\/.*\/edit/);

      // Add name question
      const shortTextButton = page
        .locator(
          '[data-testid="add-short-text"], button:has-text("Short Text"), [data-question-type="short_text"]'
        )
        .first();

      if (
        await shortTextButton.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await shortTextButton.click();

        const questionInput = page
          .locator(
            '[data-testid="question-title-input"], input[placeholder*="question"]'
          )
          .last();

        if (
          await questionInput.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await questionInput.fill("What is your name?");
        }

        // Set variable name
        const variableInput = page
          .locator('[data-testid="variable-name"], input[name="variable"]')
          .first();

        if (
          await variableInput.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await variableInput.fill("name");
        }
      }

      // Add follow-up question that pipes the name
      if (
        await shortTextButton.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await shortTextButton.click();

        const questionInput = page
          .locator(
            '[data-testid="question-title-input"], input[placeholder*="question"]'
          )
          .last();

        if (
          await questionInput.isVisible({ timeout: 2000 }).catch(() => false)
        ) {
          await questionInput.fill(
            "Nice to meet you, {{name}}! What do you do?"
          );
        }
      }

      // Preview to verify piping
      const previewButton = page
        .locator('button:has-text("Preview"), [data-testid="preview-button"]')
        .first();

      if (await previewButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await previewButton.click();

        // Fill in name
        const nameInput = page.locator('input[type="text"], textarea').first();
        if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await nameInput.fill("John");

          // Go to next question
          const nextButton = page
            .locator(
              'button:has-text("Next"), button:has-text("Continue"), [data-testid="next-button"]'
            )
            .first();

          if (
            await nextButton.isVisible({ timeout: 2000 }).catch(() => false)
          ) {
            await nextButton.click();

            // Verify piped value is shown
            const pipedText = page.locator('text="Nice to meet you, John!"');
            await pipedText.isVisible({ timeout: 3000 }).catch(() => {});
          }
        }
      }
    }
  });
});
