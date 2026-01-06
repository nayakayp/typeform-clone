import { db } from "./index";
import {
  users,
  workspaces,
  workspaceMembers,
  forms,
  questions,
  questionOptions,
  themes,
} from "./schema";

async function seed() {
  console.log("🌱 Starting database seed...");

  // Create a test user
  const [testUser] = await db
    .insert(users)
    .values({
      email: "demo@example.com",
      name: "Demo User",
      emailVerified: true,
    })
    .returning();

  console.log("✅ Created test user:", testUser.email);

  // Create a default theme
  const [defaultTheme] = await db
    .insert(themes)
    .values({
      name: "Default",
      isDefault: true,
      isPublic: true,
      primaryColor: "#0066FF",
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
      fontFamily: "Inter",
    })
    .returning();

  console.log("✅ Created default theme:", defaultTheme.name);

  // Create a test workspace
  const [testWorkspace] = await db
    .insert(workspaces)
    .values({
      name: "Demo Workspace",
      slug: "demo-workspace",
      ownerId: testUser.id,
      plan: "free",
    })
    .returning();

  console.log("✅ Created test workspace:", testWorkspace.name);

  // Add user as workspace member
  await db.insert(workspaceMembers).values({
    workspaceId: testWorkspace.id,
    userId: testUser.id,
    role: "owner",
  });

  console.log("✅ Added user as workspace owner");

  // Create a sample form
  const [sampleForm] = await db
    .insert(forms)
    .values({
      workspaceId: testWorkspace.id,
      createdBy: testUser.id,
      title: "Customer Feedback Survey",
      description:
        "Help us improve by sharing your feedback on our product and services.",
      slug: "customer-feedback",
      status: "published",
      themeId: defaultTheme.id,
      publishedAt: new Date(),
      settings: {
        showProgressBar: true,
        showQuestionNumbers: true,
        oneQuestionPerPage: true,
      },
    })
    .returning();

  console.log("✅ Created sample form:", sampleForm.title);

  // Create sample questions
  const [welcomeScreen] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "welcome_screen",
      title: "Welcome to our feedback survey!",
      description: "We appreciate you taking the time to share your thoughts.",
      order: 0,
      required: false,
    })
    .returning();

  const [nameQuestion] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "short_text",
      title: "What's your name?",
      placeholder: "Enter your name",
      order: 1,
      required: true,
      validations: {
        minLength: 2,
        maxLength: 100,
      },
    })
    .returning();

  const [emailQuestion] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "email",
      title: "What's your email address?",
      placeholder: "you@example.com",
      order: 2,
      required: true,
    })
    .returning();

  const [ratingQuestion] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "rating",
      title: "How would you rate your overall experience?",
      order: 3,
      required: true,
      settings: {
        ratingScale: 5,
        ratingShape: "star",
      },
    })
    .returning();

  const [multipleChoiceQuestion] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "multiple_choice",
      title: "What do you like most about our product?",
      order: 4,
      required: true,
      settings: {
        allowOther: true,
        randomizeOptions: false,
      },
    })
    .returning();

  // Add options for multiple choice question
  await db.insert(questionOptions).values([
    {
      questionId: multipleChoiceQuestion.id,
      label: "Easy to use",
      value: "easy_to_use",
      order: 0,
    },
    {
      questionId: multipleChoiceQuestion.id,
      label: "Great features",
      value: "great_features",
      order: 1,
    },
    {
      questionId: multipleChoiceQuestion.id,
      label: "Good customer support",
      value: "customer_support",
      order: 2,
    },
    {
      questionId: multipleChoiceQuestion.id,
      label: "Affordable pricing",
      value: "pricing",
      order: 3,
    },
  ]);

  const [feedbackQuestion] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "long_text",
      title: "Do you have any additional feedback for us?",
      placeholder: "Share your thoughts...",
      order: 5,
      required: false,
      validations: {
        maxLength: 2000,
      },
    })
    .returning();

  const [thankYouScreen] = await db
    .insert(questions)
    .values({
      formId: sampleForm.id,
      type: "thank_you_screen",
      title: "Thank you for your feedback!",
      description:
        "We really appreciate you taking the time to help us improve.",
      order: 6,
      required: false,
    })
    .returning();

  console.log("✅ Created 7 sample questions");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nTest credentials:");
  console.log("  Email: demo@example.com");
  console.log("  Workspace: demo-workspace");
  console.log("  Form slug: customer-feedback");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
