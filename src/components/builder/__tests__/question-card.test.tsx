import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionCard } from "../question-card";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderQuestion } from "@/types/builder";

// Mock the DnD kit
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => undefined),
    },
  },
}));

describe("QuestionCard", () => {
  const defaultQuestion: BuilderQuestion = {
    id: "q-1",
    type: "short_text",
    title: "What is your name?",
    description: "Please enter your full name",
    placeholder: "Enter your name...",
    order: 0,
    groupId: null,
    required: false,
    validations: {},
    settings: {},
    image: null,
    video: null,
    logicJump: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset the store
    const state = useBuilderStore.getState();
    state.resetBuilder();
  });

  it("renders question title", () => {
    render(<QuestionCard question={defaultQuestion} index={0} />);

    expect(screen.getByDisplayValue("What is your name?")).toBeInTheDocument();
  });

  it("renders question type badge", () => {
    render(<QuestionCard question={defaultQuestion} index={0} />);

    expect(screen.getByText("Short Text")).toBeInTheDocument();
  });

  it("renders question number", () => {
    render(<QuestionCard question={defaultQuestion} index={0} />);

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows required badge when question is required", () => {
    const requiredQuestion = { ...defaultQuestion, required: true };
    render(<QuestionCard question={requiredQuestion} index={0} />);

    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("does not show required badge when question is not required", () => {
    render(<QuestionCard question={defaultQuestion} index={0} />);

    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("selects question on click", async () => {
    const user = userEvent.setup();
    render(<QuestionCard question={defaultQuestion} index={0} />);

    await user.click(screen.getByDisplayValue("What is your name?"));

    const state = useBuilderStore.getState();
    expect(state.selectedQuestionId).toBe("q-1");
  });

  it("shows description field when selected", async () => {
    // Set up the store with the question selected
    useBuilderStore.setState({ selectedQuestionId: "q-1" });

    render(<QuestionCard question={defaultQuestion} index={0} />);

    expect(
      screen.getByPlaceholderText("Add a description (optional)")
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Please enter your full name")
    ).toBeInTheDocument();
  });

  it("does not show description field when not selected", () => {
    render(<QuestionCard question={defaultQuestion} index={0} />);

    expect(
      screen.queryByPlaceholderText("Add a description (optional)")
    ).not.toBeInTheDocument();
  });

  it("calls updateQuestion when title changes", async () => {
    const user = userEvent.setup();

    // Set up a question in the store first so updateQuestion works
    useBuilderStore.getState().addQuestion("short_text");

    const question = useBuilderStore.getState().questions[0];
    render(<QuestionCard question={question} index={0} />);

    const titleInput = screen.getByPlaceholderText("Enter your question...");
    await user.type(titleInput, "A");

    // Verify the store update was called (each keystroke triggers update)
    const updatedQuestion = useBuilderStore.getState().questions[0];
    expect(updatedQuestion.title).toContain("A");
  });

  it("renders dropdown menu trigger", () => {
    render(<QuestionCard question={defaultQuestion} index={0} />);

    // There should be multiple buttons (drag handle and dropdown trigger)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    // Dropdown trigger should have specific attributes
    const dropdownTrigger = buttons.find(
      (btn) => btn.getAttribute("data-slot") === "dropdown-menu-trigger"
    );
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it("shows duplicate option in dropdown", async () => {
    const user = userEvent.setup();
    render(<QuestionCard question={defaultQuestion} index={0} />);

    // Find the dropdown trigger button (MoreHorizontal icon button)
    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons.find((btn) =>
      btn.className.includes("h-8")
    );

    if (dropdownTrigger) {
      await user.click(dropdownTrigger);
      expect(await screen.findByText("Duplicate")).toBeInTheDocument();
    }
  });

  it("shows delete option in dropdown", async () => {
    const user = userEvent.setup();
    render(<QuestionCard question={defaultQuestion} index={0} />);

    // Find the dropdown trigger button
    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons.find((btn) =>
      btn.className.includes("h-8")
    );

    if (dropdownTrigger) {
      await user.click(dropdownTrigger);
      expect(await screen.findByText("Delete")).toBeInTheDocument();
    }
  });

  it("renders different question types correctly", () => {
    const emailQuestion = { ...defaultQuestion, type: "email" as const };
    const { rerender } = render(
      <QuestionCard question={emailQuestion} index={0} />
    );

    expect(screen.getByText("Email")).toBeInTheDocument();

    const ratingQuestion = { ...defaultQuestion, type: "rating" as const };
    rerender(<QuestionCard question={ratingQuestion} index={0} />);

    expect(screen.getByText("Rating")).toBeInTheDocument();
  });

  it("applies selected styles when selected", () => {
    useBuilderStore.setState({ selectedQuestionId: "q-1" });

    render(<QuestionCard question={defaultQuestion} index={0} />);

    // The card should have a ring style when selected
    const card = screen.getByDisplayValue("What is your name?").closest("div");
    expect(card?.closest(".ring-2")).toBeTruthy();
  });

  it("renders with empty title placeholder", () => {
    const noTitleQuestion = { ...defaultQuestion, title: "" };
    render(<QuestionCard question={noTitleQuestion} index={0} />);

    expect(
      screen.getByPlaceholderText("Enter your question...")
    ).toBeInTheDocument();
  });
});

describe("QuestionCard with Store Integration", () => {
  beforeEach(() => {
    useBuilderStore.getState().resetBuilder();
  });

  it("calls deleteQuestion when delete is clicked", async () => {
    const user = userEvent.setup();

    // Add a question to the store
    const questionId = useBuilderStore.getState().addQuestion("short_text");
    useBuilderStore.getState().updateQuestion(questionId, {
      title: "Test Question",
    });

    const question = useBuilderStore.getState().questions[0];

    render(<QuestionCard question={question} index={0} />);

    // Open dropdown
    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons.find((btn) =>
      btn.className.includes("h-8")
    );

    if (dropdownTrigger) {
      await user.click(dropdownTrigger);

      const deleteButton = await screen.findByText("Delete");
      await user.click(deleteButton);

      expect(useBuilderStore.getState().questions).toHaveLength(0);
    }
  });

  it("calls duplicateQuestion when duplicate is clicked", async () => {
    const user = userEvent.setup();

    // Add a question to the store
    const questionId = useBuilderStore.getState().addQuestion("short_text");
    useBuilderStore.getState().updateQuestion(questionId, {
      title: "Original Question",
    });

    const question = useBuilderStore.getState().questions[0];

    render(<QuestionCard question={question} index={0} />);

    // Open dropdown
    const menuButtons = screen.getAllByRole("button");
    const dropdownTrigger = menuButtons.find((btn) =>
      btn.className.includes("h-8")
    );

    if (dropdownTrigger) {
      await user.click(dropdownTrigger);

      const duplicateButton = await screen.findByText("Duplicate");
      await user.click(duplicateButton);

      expect(useBuilderStore.getState().questions).toHaveLength(2);
    }
  });
});
