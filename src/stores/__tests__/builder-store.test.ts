import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBuilderStore } from "../builder-store";

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => `uuid-${Date.now()}-${Math.random()}`),
});

describe("Builder Store", () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    const { result } = renderHook(() => useBuilderStore());
    act(() => {
      result.current.resetBuilder();
    });
    // Clear mock call history
    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("has correct initial state", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.form).toBeNull();
      expect(result.current.questions).toEqual([]);
      expect(result.current.selectedQuestionId).toBeNull();
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.history).toEqual([]);
      expect(result.current.historyIndex).toBe(-1);
      expect(result.current.previewMode).toBe("desktop");
    });
  });

  describe("Question Management", () => {
    it("adds a question to the form", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
      });

      expect(result.current.questions).toHaveLength(1);
      expect(result.current.questions[0].type).toBe("short_text");
      expect(result.current.questions[0].order).toBe(0);
      expect(result.current.isDirty).toBe(true);
    });

    it("adds question at specific index", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
        result.current.addQuestion("email");
        result.current.addQuestion("number", 1);
      });

      expect(result.current.questions).toHaveLength(3);
      expect(result.current.questions[1].type).toBe("number");
      // Orders should be updated
      expect(result.current.questions[0].order).toBe(0);
      expect(result.current.questions[1].order).toBe(1);
      expect(result.current.questions[2].order).toBe(2);
    });

    it("selects the newly added question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      expect(result.current.selectedQuestionId).toBe(questionId!);
    });

    it("removes a question by id", () => {
      const { result } = renderHook(() => useBuilderStore());

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addQuestion("short_text");
        id2 = result.current.addQuestion("email");
      });

      expect(result.current.questions).toHaveLength(2);

      act(() => {
        result.current.deleteQuestion(id1!);
      });

      expect(result.current.questions).toHaveLength(1);
      expect(result.current.questions[0].id).toBe(id2!);
      expect(result.current.questions[0].type).toBe("email");
    });

    it("updates order after deletion", () => {
      const { result } = renderHook(() => useBuilderStore());

      let id1: string;
      act(() => {
        id1 = result.current.addQuestion("short_text");
        result.current.addQuestion("email");
        result.current.addQuestion("number");
      });

      act(() => {
        result.current.deleteQuestion(id1!);
      });

      expect(result.current.questions[0].order).toBe(0);
      expect(result.current.questions[1].order).toBe(1);
    });

    it("deselects if deleted question was selected", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      expect(result.current.selectedQuestionId).toBe(questionId!);

      act(() => {
        result.current.deleteQuestion(questionId!);
      });

      expect(result.current.selectedQuestionId).toBeNull();
    });

    it("updates question properties", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      act(() => {
        result.current.updateQuestion(questionId!, {
          title: "What is your name?",
          required: true,
          description: "Please enter your full name",
        });
      });

      const question = result.current.questions[0];
      expect(question.title).toBe("What is your name?");
      expect(question.required).toBe(true);
      expect(question.description).toBe("Please enter your full name");
    });

    it("updates updatedAt timestamp when updating question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      const originalUpdatedAt = result.current.questions[0].updatedAt;

      // Wait a bit to ensure timestamp differs
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      act(() => {
        result.current.updateQuestion(questionId!, { title: "New Title" });
      });

      expect(result.current.questions[0].updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      vi.useRealTimers();
    });

    it("reorders questions", () => {
      const { result } = renderHook(() => useBuilderStore());

      let id1: string, id2: string, id3: string;
      act(() => {
        id1 = result.current.addQuestion("short_text");
        result.current.updateQuestion(id1, { title: "First" });
        id2 = result.current.addQuestion("email");
        result.current.updateQuestion(id2, { title: "Second" });
        id3 = result.current.addQuestion("number");
        result.current.updateQuestion(id3, { title: "Third" });
      });

      act(() => {
        result.current.reorderQuestions(id3!, id1!);
      });

      expect(result.current.questions[0].title).toBe("Third");
      expect(result.current.questions[1].title).toBe("First");
      expect(result.current.questions[2].title).toBe("Second");

      // Orders should be updated
      expect(result.current.questions[0].order).toBe(0);
      expect(result.current.questions[1].order).toBe(1);
      expect(result.current.questions[2].order).toBe(2);
    });

    it("does not reorder if same id", () => {
      const { result } = renderHook(() => useBuilderStore());

      let id1: string;
      act(() => {
        id1 = result.current.addQuestion("short_text");
        result.current.addQuestion("email");
      });

      const questionsBefore = [...result.current.questions];

      act(() => {
        result.current.reorderQuestions(id1!, id1!);
      });

      expect(result.current.questions).toEqual(questionsBefore);
    });

    it("duplicates a question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let originalId: string;
      act(() => {
        originalId = result.current.addQuestion("short_text");
        result.current.updateQuestion(originalId, {
          title: "Original",
          required: true,
        });
      });

      let duplicateId: string | null;
      act(() => {
        duplicateId = result.current.duplicateQuestion(originalId!);
      });

      expect(result.current.questions).toHaveLength(2);
      expect(duplicateId).not.toBe(originalId!);
      expect(result.current.questions[1].title).toBe("Original");
      expect(result.current.questions[1].required).toBe(true);
      expect(result.current.questions[1].isNew).toBe(true);
    });

    it("places duplicate after original", () => {
      const { result } = renderHook(() => useBuilderStore());

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addQuestion("short_text");
        result.current.updateQuestion(id1, { title: "First" });
        id2 = result.current.addQuestion("email");
        result.current.updateQuestion(id2, { title: "Second" });
      });

      act(() => {
        result.current.duplicateQuestion(id1!);
      });

      expect(result.current.questions).toHaveLength(3);
      expect(result.current.questions[0].title).toBe("First");
      expect(result.current.questions[1].title).toBe("First");
      expect(result.current.questions[2].title).toBe("Second");
    });

    it("returns null when duplicating non-existent question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let duplicateId: string | null = "initial";
      act(() => {
        duplicateId = result.current.duplicateQuestion("non-existent-id");
      });

      expect(duplicateId).toBeNull();
    });
  });

  describe("Selection State", () => {
    it("tracks selected question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
        result.current.selectQuestion(null);
      });

      expect(result.current.selectedQuestionId).toBeNull();

      act(() => {
        result.current.selectQuestion(questionId!);
      });

      expect(result.current.selectedQuestionId).toBe(questionId!);
    });

    it("can deselect question", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
      });

      act(() => {
        result.current.selectQuestion(null);
      });

      expect(result.current.selectedQuestionId).toBeNull();
    });
  });

  describe("Undo/Redo", () => {
    it("can undo adding a question", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
      });

      expect(result.current.questions).toHaveLength(1);
      expect(result.current.canUndo()).toBe(true);

      act(() => {
        result.current.undo();
      });

      expect(result.current.questions).toHaveLength(0);
    });

    it("canUndo returns false when no history", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.canUndo()).toBe(false);
    });

    it("canRedo returns false when at latest state", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
      });

      expect(result.current.canRedo()).toBe(false);
    });

    it("canRedo returns true after undo", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo()).toBe(true);
    });

    it("saves history when updating question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      act(() => {
        result.current.updateQuestion(questionId!, { title: "New Title" });
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].type).toBe("UPDATE_QUESTION");
    });

    it("saves history when deleting question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      act(() => {
        result.current.deleteQuestion(questionId!);
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[1].type).toBe("DELETE_QUESTION");
    });

    it("saves history when reordering", () => {
      const { result } = renderHook(() => useBuilderStore());

      let id1: string, id2: string;
      act(() => {
        id1 = result.current.addQuestion("short_text");
        id2 = result.current.addQuestion("email");
      });

      act(() => {
        result.current.reorderQuestions(id2!, id1!);
      });

      expect(result.current.history[2].type).toBe("REORDER_QUESTIONS");
    });
  });

  describe("Form Management", () => {
    it("sets form with questions", () => {
      const { result } = renderHook(() => useBuilderStore());

      const form = {
        id: "form-1",
        title: "Test Form",
        description: "A test form",
        createdAt: new Date(),
        updatedAt: new Date(),
        workspaceId: "ws-1",
        userId: "user-1",
        status: "draft" as const,
        slug: "test-form",
        settings: {},
        themeId: null,
      };

      const questions = [
        {
          id: "q-1",
          type: "short_text" as const,
          title: "Question 1",
          description: null,
          placeholder: null,
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
        },
      ];

      act(() => {
        result.current.setForm(form, questions);
      });

      expect(result.current.form).toEqual(form);
      expect(result.current.questions).toEqual(questions);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.history).toEqual([]);
    });

    it("updates form metadata", () => {
      const { result } = renderHook(() => useBuilderStore());

      const form = {
        id: "form-1",
        title: "Test Form",
        description: "A test form",
        createdAt: new Date(),
        updatedAt: new Date(),
        workspaceId: "ws-1",
        userId: "user-1",
        status: "draft" as const,
        slug: "test-form",
        settings: {},
        themeId: null,
      };

      act(() => {
        result.current.setForm(form, []);
      });

      act(() => {
        result.current.updateFormMeta({ title: "Updated Title" });
      });

      expect(result.current.form?.title).toBe("Updated Title");
      expect(result.current.isDirty).toBe(true);
    });

    it("resets builder state", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
        result.current.addQuestion("email");
      });

      expect(result.current.questions).toHaveLength(2);

      act(() => {
        result.current.resetBuilder();
      });

      expect(result.current.questions).toEqual([]);
      expect(result.current.form).toBeNull();
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe("UI State", () => {
    it("toggles sidebar", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.sidebarCollapsed).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarCollapsed).toBe(false);
    });

    it("toggles preview", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.previewCollapsed).toBe(false);

      act(() => {
        result.current.togglePreview();
      });

      expect(result.current.previewCollapsed).toBe(true);
    });

    it("sets preview mode", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.previewMode).toBe("desktop");

      act(() => {
        result.current.setPreviewMode("mobile");
      });

      expect(result.current.previewMode).toBe("mobile");

      act(() => {
        result.current.setPreviewMode("tablet");
      });

      expect(result.current.previewMode).toBe("tablet");
    });
  });

  describe("Save State", () => {
    it("tracks saving state", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.isSaving).toBe(false);

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);

      act(() => {
        result.current.setSaving(false);
      });

      expect(result.current.isSaving).toBe(false);
    });

    it("tracks save error", () => {
      const { result } = renderHook(() => useBuilderStore());

      expect(result.current.saveError).toBeNull();

      act(() => {
        result.current.setSaveError("Failed to save");
      });

      expect(result.current.saveError).toBe("Failed to save");

      act(() => {
        result.current.setSaveError(null);
      });

      expect(result.current.saveError).toBeNull();
    });

    it("marks form as saved", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addQuestion("short_text");
        result.current.setSaving(true);
      });

      expect(result.current.isDirty).toBe(true);
      expect(result.current.isSaving).toBe(true);

      act(() => {
        result.current.markSaved();
      });

      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.lastSavedAt).toBeInstanceOf(Date);
      expect(result.current.saveError).toBeNull();
    });
  });

  describe("Logic Management", () => {
    it("sets skip logic for question", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      const skipLogic = {
        questionId: questionId!,
        conditions: [],
        action: "skip" as const,
        targetQuestionId: "target-1",
      };

      act(() => {
        result.current.setSkipLogic(questionId!, skipLogic);
      });

      expect(result.current.skipLogicRules).toHaveLength(1);
      expect(result.current.getSkipLogicForQuestion(questionId!)).toEqual(
        skipLogic
      );
    });

    it("removes skip logic when set to null", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      const skipLogic = {
        questionId: questionId!,
        conditions: [],
        action: "skip" as const,
        targetQuestionId: "target-1",
      };

      act(() => {
        result.current.setSkipLogic(questionId!, skipLogic);
      });

      expect(result.current.skipLogicRules).toHaveLength(1);

      act(() => {
        result.current.setSkipLogic(questionId!, null);
      });

      expect(result.current.skipLogicRules).toHaveLength(0);
    });

    it("opens and closes logic modal", () => {
      const { result } = renderHook(() => useBuilderStore());

      let questionId: string;
      act(() => {
        questionId = result.current.addQuestion("short_text");
      });

      expect(result.current.logicModalOpen).toBe(false);

      act(() => {
        result.current.openLogicModal(questionId!);
      });

      expect(result.current.logicModalOpen).toBe(true);
      expect(result.current.logicModalQuestionId).toBe(questionId!);

      act(() => {
        result.current.closeLogicModal();
      });

      expect(result.current.logicModalOpen).toBe(false);
      expect(result.current.logicModalQuestionId).toBeNull();
    });
  });

  describe("Calculator Management", () => {
    it("adds calculator", () => {
      const { result } = renderHook(() => useBuilderStore());

      const calculator = {
        id: "calc-1",
        name: "Total Score",
        expression: "q1 + q2",
        variables: [],
      };

      act(() => {
        result.current.addCalculator(calculator);
      });

      expect(result.current.calculators).toHaveLength(1);
      expect(result.current.calculators[0]).toEqual(calculator);
    });

    it("updates calculator", () => {
      const { result } = renderHook(() => useBuilderStore());

      const calculator = {
        id: "calc-1",
        name: "Total Score",
        expression: "q1 + q2",
        variables: [],
      };

      act(() => {
        result.current.addCalculator(calculator);
      });

      act(() => {
        result.current.updateCalculator("calc-1", { name: "Updated Name" });
      });

      expect(result.current.calculators[0].name).toBe("Updated Name");
    });

    it("deletes calculator", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addCalculator({
          id: "calc-1",
          name: "Calc 1",
          expression: "q1",
          variables: [],
        });
        result.current.addCalculator({
          id: "calc-2",
          name: "Calc 2",
          expression: "q2",
          variables: [],
        });
      });

      act(() => {
        result.current.deleteCalculator("calc-1");
      });

      expect(result.current.calculators).toHaveLength(1);
      expect(result.current.calculators[0].id).toBe("calc-2");
    });
  });

  describe("Hidden Fields Management", () => {
    it("adds hidden field", () => {
      const { result } = renderHook(() => useBuilderStore());

      const hiddenField = {
        id: "hf-1",
        name: "utm_source",
        defaultValue: "google",
      };

      act(() => {
        result.current.addHiddenField(hiddenField);
      });

      expect(result.current.hiddenFields).toHaveLength(1);
      expect(result.current.hiddenFields[0]).toEqual(hiddenField);
    });

    it("updates hidden field", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addHiddenField({
          id: "hf-1",
          name: "utm_source",
          defaultValue: "google",
        });
      });

      act(() => {
        result.current.updateHiddenField("hf-1", { defaultValue: "facebook" });
      });

      expect(result.current.hiddenFields[0].defaultValue).toBe("facebook");
    });

    it("deletes hidden field", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addHiddenField({
          id: "hf-1",
          name: "utm_source",
          defaultValue: "google",
        });
        result.current.addHiddenField({
          id: "hf-2",
          name: "utm_campaign",
          defaultValue: "summer",
        });
      });

      act(() => {
        result.current.deleteHiddenField("hf-1");
      });

      expect(result.current.hiddenFields).toHaveLength(1);
      expect(result.current.hiddenFields[0].id).toBe("hf-2");
    });
  });
});
