import { renderHook, act } from "@testing-library/react";
import { useResponseStore, Question } from "../response-store";

describe("Response Store", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useResponseStore());
    act(() => {
      result.current.resetSession();
    });
  });

  describe("Initialization", () => {
    it("initializes empty response", () => {
      const { result } = renderHook(() => useResponseStore());
      expect(result.current.answers).toEqual({});
      expect(result.current.formId).toBeNull();
      expect(result.current.sessionId).toBeNull();
    });

    it("initializes session with form and questions", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1", "q2", "q3"]);
      });

      expect(result.current.formId).toBe("form-123");
      expect(result.current.sessionId).toBeDefined();
      expect(result.current.questionOrder).toEqual(["q1", "q2", "q3"]);
      expect(result.current.startedAt).toBeInstanceOf(Date);
    });

    it("resets session completely", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1"]);
        result.current.setAnswer("q1", { textValue: "test" });
        result.current.resetSession();
      });

      expect(result.current.formId).toBeNull();
      expect(result.current.answers).toEqual({});
    });
  });

  describe("Answer Management", () => {
    it("sets answer for question", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "John Doe" });
      });

      expect(result.current.answers["q1"].textValue).toBe("John Doe");
    });

    it("updates existing answer", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "First" });
        result.current.setAnswer("q1", { textValue: "Second" });
      });

      expect(result.current.answers["q1"].textValue).toBe("Second");
    });

    it("sets multiple choice answer", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", {
          selectedOptions: ["option1", "option2"],
        });
      });

      expect(result.current.answers["q1"].selectedOptions).toEqual([
        "option1",
        "option2",
      ]);
    });

    it("sets rating answer", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { rating: 5 });
      });

      expect(result.current.answers["q1"].rating).toBe(5);
    });

    it("clears answer", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "test" });
        result.current.clearAnswer("q1");
      });

      expect(result.current.answers["q1"]).toBeUndefined();
    });

    it("gets answer correctly", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "test" });
      });

      expect(result.current.getAnswer("q1")?.textValue).toBe("test");
      expect(result.current.getAnswer("q2")).toBeUndefined();
    });

    it("checks if answer exists", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "test" });
      });

      expect(result.current.hasAnswer("q1")).toBe(true);
      expect(result.current.hasAnswer("q2")).toBe(false);
    });
  });

  describe("Validation - Required Fields", () => {
    it("validates required questions", () => {
      const { result } = renderHook(() => useResponseStore());

      const questions: Question[] = [
        { id: "q1", required: true, type: "short_text" },
        { id: "q2", required: false, type: "email" },
      ];

      let errors: Record<string, string>;
      act(() => {
        errors = result.current.validate(questions);
      });

      expect(errors!["q1"]).toBe("This field is required");
      expect(errors!["q2"]).toBeUndefined();
    });

    it("passes validation when required field is filled", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "John" });
      });

      const questions: Question[] = [
        { id: "q1", required: true, type: "short_text" },
      ];

      let errors: Record<string, string>;
      act(() => {
        errors = result.current.validate(questions);
      });

      expect(errors!["q1"]).toBeUndefined();
    });

    it("fails validation for empty string on required field", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "   " });
      });

      const questions: Question[] = [
        { id: "q1", required: true, type: "short_text" },
      ];

      let errors: Record<string, string>;
      act(() => {
        errors = result.current.validate(questions);
      });

      expect(errors!["q1"]).toBe("This field is required");
    });
  });

  describe("Validation - Email", () => {
    it("validates email format - valid email", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "test@example.com" });
      });

      const error = result.current.validateField("q1", { type: "email" });
      expect(error).toBeNull();
    });

    it("validates email format - invalid email", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "invalid-email" });
      });

      const error = result.current.validateField("q1", { type: "email" });
      expect(error).toBe("Invalid email address");
    });
  });

  describe("Validation - URL", () => {
    it("validates URL format - valid URL", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "https://example.com" });
      });

      const error = result.current.validateField("q1", { type: "website" });
      expect(error).toBeNull();
    });

    it("validates URL format - invalid URL", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "not-a-url" });
      });

      const error = result.current.validateField("q1", { type: "website" });
      expect(error).toBe("Invalid URL");
    });
  });

  describe("Validation - Phone", () => {
    it("validates phone format - valid phone", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "+1-234-567-8900" });
      });

      const error = result.current.validateField("q1", { type: "phone" });
      expect(error).toBeNull();
    });

    it("validates phone format - invalid phone", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "abc" });
      });

      const error = result.current.validateField("q1", { type: "phone" });
      expect(error).toBe("Invalid phone number");
    });
  });

  describe("Validation - Length Constraints", () => {
    it("validates minimum length", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "ab" });
      });

      const error = result.current.validateField("q1", {
        type: "short_text",
        validations: { minLength: 5 },
      });

      expect(error).toBe("Minimum 5 characters required");
    });

    it("validates maximum length", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "this is a very long text" });
      });

      const error = result.current.validateField("q1", {
        type: "short_text",
        validations: { maxLength: 10 },
      });

      expect(error).toBe("Maximum 10 characters allowed");
    });
  });

  describe("Validation - Number Constraints", () => {
    it("validates minimum value", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { numberValue: 5 });
      });

      const error = result.current.validateField("q1", {
        type: "number",
        validations: { min: 10 },
      });

      expect(error).toBe("Minimum value is 10");
    });

    it("validates maximum value", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { numberValue: 100 });
      });

      const error = result.current.validateField("q1", {
        type: "number",
        validations: { max: 50 },
      });

      expect(error).toBe("Maximum value is 50");
    });
  });

  describe("Navigation", () => {
    it("navigates to specific question", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1", "q2", "q3"]);
        result.current.goToQuestion(2);
      });

      expect(result.current.currentQuestionIndex).toBe(2);
    });

    it("goes to next question", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1", "q2", "q3"]);
        result.current.goToNext();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it("goes to previous question", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1", "q2", "q3"]);
        result.current.goToQuestion(2);
        result.current.goToPrevious();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });

    it("does not go below 0", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1", "q2"]);
        result.current.goToPrevious();
      });

      expect(result.current.currentQuestionIndex).toBe(0);
    });

    it("does not go beyond last question", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1", "q2"]);
        result.current.goToNext();
        result.current.goToNext();
        result.current.goToNext();
      });

      expect(result.current.currentQuestionIndex).toBe(1);
    });
  });

  describe("Progress Tracking", () => {
    it("calculates completion percentage", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.setAnswer("q1", { textValue: "Answer 1" });
      });

      const percentage = result.current.getCompletionPercentage([
        "q1",
        "q2",
        "q3",
      ]);
      expect(percentage).toBe(33);
    });

    it("returns 100% for empty question list", () => {
      const { result } = renderHook(() => useResponseStore());

      const percentage = result.current.getCompletionPercentage([]);
      expect(percentage).toBe(100);
    });

    it("returns 0% when no answers", () => {
      const { result } = renderHook(() => useResponseStore());

      const percentage = result.current.getCompletionPercentage([
        "q1",
        "q2",
        "q3",
      ]);
      expect(percentage).toBe(0);
    });

    it("marks completion", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.initSession("form-123", ["q1"]);
        result.current.markComplete();
      });

      expect(result.current.completedAt).toBeInstanceOf(Date);
    });
  });

  describe("Error Management", () => {
    it("clears error when answer is set", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.validate([{ id: "q1", required: true, type: "text" }]);
      });

      expect(result.current.errors["q1"]).toBeDefined();

      act(() => {
        result.current.setAnswer("q1", { textValue: "test" });
      });

      expect(result.current.errors["q1"]).toBeUndefined();
    });

    it("clears specific error", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.validate([
          { id: "q1", required: true, type: "text" },
          { id: "q2", required: true, type: "text" },
        ]);
        result.current.clearError("q1");
      });

      expect(result.current.errors["q1"]).toBeUndefined();
      expect(result.current.errors["q2"]).toBeDefined();
    });

    it("clears all errors", () => {
      const { result } = renderHook(() => useResponseStore());

      act(() => {
        result.current.validate([
          { id: "q1", required: true, type: "text" },
          { id: "q2", required: true, type: "text" },
        ]);
        result.current.clearAllErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });
});
