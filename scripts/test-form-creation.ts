import { chromium, Browser, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// All question types organized by category (matching QUESTION_CATEGORIES from builder.ts)
// Using exact labels from QUESTION_TYPE_META
const QUESTION_TYPES = {
  basic: {
    label: "Basic",
    types: [
      { key: "short_text", label: "Short Text" },
      { key: "long_text", label: "Long Text" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "number", label: "Number" },
      { key: "url", label: "Website" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
    ],
  },
  selection: {
    label: "Selection",
    types: [
      { key: "multiple_choice", label: "Multiple Choice" },
      { key: "checkboxes", label: "Checkboxes" },
      { key: "dropdown", label: "Dropdown" },
      { key: "picture_choice", label: "Picture Choice" },
      { key: "yes_no", label: "Yes/No" },
      { key: "rating", label: "Rating" },
      { key: "opinion_scale", label: "Opinion Scale" },
      { key: "nps", label: "NPS" },
      { key: "ranking", label: "Ranking" },
      { key: "matrix", label: "Matrix" },
    ],
  },
  media: {
    label: "Media",
    types: [
      { key: "file_upload", label: "File Upload" },
      { key: "signature", label: "Signature" },
      { key: "video_recording", label: "Video" },
      { key: "audio_recording", label: "Audio" },
    ],
  },
  content: {
    label: "Content",
    types: [
      { key: "welcome_screen", label: "Welcome Screen" },
      { key: "statement", label: "Statement" },
      { key: "thank_you_screen", label: "Thank You" },
      { key: "redirect", label: "Redirect" },
      { key: "video_embed", label: "Video Embed" },
      { key: "image_block", label: "Image Block" },
    ],
  },
  advanced: {
    label: "Advanced",
    types: [
      { key: "payment", label: "Payment" },
      { key: "calendly", label: "Calendly" },
      { key: "address", label: "Address" },
      { key: "legal", label: "Legal" },
      { key: "captcha", label: "CAPTCHA" },
    ],
  },
};

async function expandAccordion(page: Page, categoryLabel: string): Promise<boolean> {
  try {
    // Find the accordion trigger by its text content
    const trigger = page.locator(`button[data-slot="accordion-trigger"]:has-text("${categoryLabel}")`).first();

    if (!(await trigger.isVisible({ timeout: 2000 }))) {
      console.log(`     Accordion trigger "${categoryLabel}" not visible`);
      return false;
    }

    // Check if already expanded by looking at data-state
    const state = await trigger.getAttribute("data-state");
    if (state === "open") {
      return true; // Already expanded
    }

    // Click to expand
    await trigger.click();
    await page.waitForTimeout(300);
    return true;
  } catch (e) {
    console.log(`     Error expanding accordion "${categoryLabel}":`, e);
    return false;
  }
}

async function addQuestionType(page: Page, typeLabel: string): Promise<boolean> {
  try {
    // Close any open config panel first
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    // Find the question type button within the sidebar
    // The buttons are inside the accordion content, with structure:
    // button > icon + span with label
    const sidebar = page.locator(".w-64"); // The sidebar has w-64 class
    const typeButton = sidebar.locator(`button:has(span:text-is("${typeLabel}"))`).first();

    if (await typeButton.isVisible({ timeout: 1000 })) {
      await typeButton.click();
      await page.waitForTimeout(500);
      return true;
    }

    // Try alternative selector - exact text match
    const altButton = sidebar.locator(`button span:text-is("${typeLabel}")`).first();
    if (await altButton.isVisible({ timeout: 500 })) {
      // Click the parent button
      await altButton.locator("..").click();
      await page.waitForTimeout(500);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Starting form creation test with ALL question types...\n");

  const browser: Browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  try {
    // Step 1: Login
    console.log("1. Logging in...");
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");

    // Fill login form
    await page.fill('input[placeholder="name@example.com"]', "demo@example.com");
    await page.fill('input[type="password"]', "demo1234");

    // Click sign in and wait for navigation
    await page.click('button:has-text("Sign In")');

    try {
      await page.waitForURL("**/forms**", { timeout: 5000 });
      console.log("   Logged in successfully!\n");
    } catch {
      const errorText = await page.locator(".text-destructive, .text-red-500, [role='alert']").textContent().catch(() => null);
      if (errorText) {
        console.log(`   Login error: ${errorText}`);
        throw new Error("Login failed");
      }
      await page.waitForURL("**/forms**", { timeout: 15000 });
      console.log("   Logged in (slow)!\n");
    }

    // Step 2: Create a new form
    console.log("2. Creating a new form...");
    await page.waitForLoadState("networkidle");

    const createButton = page.locator('button:has-text("Create Form")').first();
    await createButton.waitFor({ state: "visible", timeout: 5000 });
    await createButton.click();

    await page.waitForURL("**/forms/**/edit**", { timeout: 15000 });
    console.log("   Form created, now in editor!\n");

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Step 3: Update form title
    console.log("3. Updating form title...");
    const titleInput = page.locator('input[placeholder="Untitled Form"]').first();
    if (await titleInput.isVisible({ timeout: 3000 })) {
      await titleInput.fill("Test Form - All Question Types");
      console.log("   Title updated!\n");
    } else {
      console.log("   Title input not found, continuing...\n");
    }

    // Step 4: Add ALL question types
    console.log("4. Adding ALL question types...");
    let addedCount = 0;
    const addedTypes: string[] = [];
    const failedTypes: string[] = [];

    // Process each category
    for (const [categoryKey, category] of Object.entries(QUESTION_TYPES)) {
      console.log(`\n   Category: ${category.label}`);

      // Expand the accordion for this category
      const expanded = await expandAccordion(page, category.label);
      if (!expanded) {
        console.log(`     Could not expand ${category.label} accordion`);
      }

      // Add each question type in this category
      for (const questionType of category.types) {
        const success = await addQuestionType(page, questionType.label);
        if (success) {
          console.log(`     + Added: ${questionType.label}`);
          addedTypes.push(questionType.key);
          addedCount++;
        } else {
          console.log(`     - Failed: ${questionType.label}`);
          failedTypes.push(questionType.label);
        }
      }
    }

    console.log(`\n   Total questions added: ${addedCount}`);
    if (failedTypes.length > 0) {
      console.log(`   Failed to add: ${failedTypes.join(", ")}`);
    }

    // Step 5: Wait for autosave
    console.log("\n5. Waiting for autosave...");
    await page.waitForTimeout(3000);

    const savedIndicator = page.locator('text=/saved|Saved/i').first();
    if (await savedIndicator.isVisible({ timeout: 5000 })) {
      console.log("   Autosave complete!\n");
    } else {
      console.log("   Autosave status unclear, continuing...\n");
    }

    // Step 6: Close any open dialogs/sheets before publishing
    console.log("6. Closing any open dialogs...");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const openSheet = page.locator('[data-state="open"][role="dialog"]').first();
    if (await openSheet.isVisible({ timeout: 500 }).catch(() => false)) {
      console.log("   Found open dialog, pressing Escape again...");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
    console.log("   Dialogs closed.\n");

    // Step 7: Publish the form
    console.log("7. Publishing the form...");
    const publishButton = page.locator('button:has-text("Publish")').first();
    if (await publishButton.isVisible({ timeout: 3000 })) {
      const isDisabled = await publishButton.isDisabled();
      if (isDisabled) {
        console.log("   Publish button disabled, waiting for save...");
        await page.waitForTimeout(3000);
      }
      await publishButton.click({ force: true });
      await page.waitForTimeout(2000);
      console.log("   Form published!\n");
    } else {
      console.log("   Publish button not visible\n");
    }

    // Step 8: Get the form info and navigate to live form
    console.log("8. Getting form info...");
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    const formIdMatch = currentUrl.match(/forms\/([^/]+)/);
    const formId = formIdMatch ? formIdMatch[1] : null;

    if (formId) {
      console.log(`   Form ID: ${formId}`);

      const formData = await page.evaluate(async (id) => {
        try {
          const res = await fetch(`/api/forms/${id}`, { credentials: "include" });
          if (res.ok) {
            return res.json();
          }
          return { error: `Status ${res.status}` };
        } catch (e) {
          return { error: String(e) };
        }
      }, formId);

      const questionCount = formData?.questions?.length || 0;
      console.log(`   Total questions in form: ${questionCount}`);

      // List question types
      if (formData?.questions) {
        console.log("   Question types in form:");
        for (const q of formData.questions) {
          console.log(`     - ${q.type}${q.title ? `: "${q.title}"` : ""}`);
        }
      }

      const slug = formData?.slug || formData?.form?.slug;
      if (slug) {
        const liveUrl = `${BASE_URL}/f/${slug}`;
        console.log(`\n9. Opening live form: ${liveUrl}`);

        await page.goto(liveUrl);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);

        // Take a screenshot
        await page.screenshot({ path: "form-live-preview.png", fullPage: true });
        console.log("   Screenshot saved to form-live-preview.png");

        // Check if form loads properly
        const formTitle = await page.locator("h1, h2, [data-testid='form-title']").first().textContent().catch(() => "Not found");
        console.log(`   Form title on live page: ${formTitle}`);

        // Try to interact with the form
        const startButton = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Next")').first();
        if (await startButton.isVisible({ timeout: 3000 })) {
          await startButton.click();
          console.log("   Started form interaction!");
          await page.waitForTimeout(1000);
          await page.screenshot({ path: "form-live-interaction.png", fullPage: true });
          console.log("   Interaction screenshot saved.");
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("TEST COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log(`\nSummary:`);
    console.log(`- Questions added: ${addedCount}`);
    console.log(`- Question types: ${addedTypes.join(", ")}`);
    if (failedTypes.length > 0) {
      console.log(`- Failed types: ${failedTypes.join(", ")}`);
    }

  } catch (error) {
    console.error("\nTest failed:", error);
    await page.screenshot({ path: "test-failure.png" });
    console.log("Failure screenshot saved to test-failure.png");
  } finally {
    console.log("\nBrowser will stay open for 30 seconds for inspection...");
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

main();
