import { describe, it, expect } from "vitest";
import * as schema from "../schema";

describe("Database Enums", () => {
  describe("Question Type Enum", () => {
    it("should be defined", () => {
      expect(schema.questionTypeEnum).toBeDefined();
    });

    it("should include basic input types", () => {
      const enumValues = schema.questionTypeEnum.enumValues;

      expect(enumValues).toContain("short_text");
      expect(enumValues).toContain("long_text");
      expect(enumValues).toContain("email");
      expect(enumValues).toContain("phone");
      expect(enumValues).toContain("number");
      expect(enumValues).toContain("url");
      expect(enumValues).toContain("date");
      expect(enumValues).toContain("time");
    });

    it("should include selection types", () => {
      const enumValues = schema.questionTypeEnum.enumValues;

      expect(enumValues).toContain("multiple_choice");
      expect(enumValues).toContain("checkboxes");
      expect(enumValues).toContain("dropdown");
      expect(enumValues).toContain("picture_choice");
      expect(enumValues).toContain("yes_no");
      expect(enumValues).toContain("rating");
      expect(enumValues).toContain("opinion_scale");
      expect(enumValues).toContain("nps");
      expect(enumValues).toContain("ranking");
      expect(enumValues).toContain("matrix");
    });

    it("should include media types", () => {
      const enumValues = schema.questionTypeEnum.enumValues;

      expect(enumValues).toContain("file_upload");
      expect(enumValues).toContain("signature");
      expect(enumValues).toContain("video_recording");
      expect(enumValues).toContain("audio_recording");
    });

    it("should include content types", () => {
      const enumValues = schema.questionTypeEnum.enumValues;

      expect(enumValues).toContain("welcome_screen");
      expect(enumValues).toContain("statement");
      expect(enumValues).toContain("thank_you_screen");
      expect(enumValues).toContain("redirect");
      expect(enumValues).toContain("video_embed");
      expect(enumValues).toContain("image_block");
    });

    it("should include advanced types", () => {
      const enumValues = schema.questionTypeEnum.enumValues;

      expect(enumValues).toContain("payment");
      expect(enumValues).toContain("calendly");
      expect(enumValues).toContain("address");
      expect(enumValues).toContain("legal");
      expect(enumValues).toContain("captcha");
    });

    it("should have the correct total number of question types", () => {
      const enumValues = schema.questionTypeEnum.enumValues;
      // Basic: 8, Selection: 10, Media: 4, Content: 6, Advanced: 5 = 33
      expect(enumValues.length).toBe(33);
    });
  });
});

describe("Interface Types", () => {
  describe("FormSettings Interface", () => {
    it("should accept valid form settings", () => {
      const settings: schema.FormSettings = {
        showProgressBar: true,
        showQuestionNumbers: true,
        shuffleQuestions: false,
        oneQuestionPerPage: true,
        allowResponseEditing: false,
        closeAfterSubmission: false,
        responseLimitEnabled: false,
        responseLimit: 100,
        scheduledCloseDate: "2025-12-31",
      };

      expect(settings.showProgressBar).toBe(true);
      expect(settings.responseLimit).toBe(100);
    });

    it("should allow partial settings", () => {
      const settings: schema.FormSettings = {
        showProgressBar: true,
      };

      expect(settings.showProgressBar).toBe(true);
      expect(settings.shuffleQuestions).toBeUndefined();
    });
  });

  describe("CustomTheme Interface", () => {
    it("should accept valid theme settings", () => {
      const theme: schema.CustomTheme = {
        primaryColor: "#000000",
        backgroundColor: "#ffffff",
        textColor: "#333333",
        buttonColor: "#0066ff",
        buttonTextColor: "#ffffff",
        fontFamily: "Inter",
        backgroundImage: "https://example.com/bg.jpg",
      };

      expect(theme.primaryColor).toBe("#000000");
      expect(theme.fontFamily).toBe("Inter");
    });

    it("should allow partial theme", () => {
      const theme: schema.CustomTheme = {
        primaryColor: "#000000",
      };

      expect(theme.primaryColor).toBe("#000000");
      expect(theme.backgroundColor).toBeUndefined();
    });
  });

  describe("QuestionSettings Interface", () => {
    it("should accept number question settings", () => {
      const settings: schema.QuestionSettings = {
        min: 0,
        max: 100,
        step: 1,
      };

      expect(settings.min).toBe(0);
      expect(settings.max).toBe(100);
    });

    it("should accept text question settings", () => {
      const settings: schema.QuestionSettings = {
        minLength: 10,
        maxLength: 500,
      };

      expect(settings.minLength).toBe(10);
      expect(settings.maxLength).toBe(500);
    });

    it("should accept multiple choice settings", () => {
      const settings: schema.QuestionSettings = {
        allowOther: true,
        randomizeOptions: true,
        multipleSelection: false,
      };

      expect(settings.allowOther).toBe(true);
      expect(settings.randomizeOptions).toBe(true);
    });

    it("should accept rating settings", () => {
      const settings: schema.QuestionSettings = {
        ratingScale: 5,
        ratingShape: "star",
      };

      expect(settings.ratingScale).toBe(5);
      expect(settings.ratingShape).toBe("star");
    });

    it("should accept opinion scale settings", () => {
      const settings: schema.QuestionSettings = {
        scaleMin: 1,
        scaleMax: 10,
        leftLabel: "Not likely",
        rightLabel: "Very likely",
      };

      expect(settings.scaleMin).toBe(1);
      expect(settings.scaleMax).toBe(10);
    });

    it("should accept file upload settings", () => {
      const settings: schema.QuestionSettings = {
        allowedFileTypes: ["image/png", "image/jpeg"],
        maxFileSize: 5242880,
        maxFiles: 3,
      };

      expect(settings.allowedFileTypes).toEqual(["image/png", "image/jpeg"]);
      expect(settings.maxFileSize).toBe(5242880);
    });
  });

  describe("QuestionValidations Interface", () => {
    it("should accept validation rules", () => {
      const validations: schema.QuestionValidations = {
        required: true,
        minLength: 5,
        maxLength: 100,
        min: 0,
        max: 100,
        pattern: "^[a-zA-Z]+$",
        customError: "Please enter a valid value",
      };

      expect(validations.required).toBe(true);
      expect(validations.pattern).toBe("^[a-zA-Z]+$");
    });
  });

  describe("LogicJump Interface", () => {
    it("should accept logic jump configuration", () => {
      const logic: schema.LogicJump = {
        conditions: [
          {
            field: "question_1",
            operator: "equals",
            value: "yes",
          },
        ],
        action: "jump",
        target: "question_5",
      };

      expect(logic.conditions).toHaveLength(1);
      expect(logic.action).toBe("jump");
      expect(logic.target).toBe("question_5");
    });

    it("should accept multiple conditions", () => {
      const logic: schema.LogicJump = {
        conditions: [
          { field: "q1", operator: "equals", value: "a" },
          { field: "q2", operator: "greater_than", value: 5 },
        ],
        action: "show",
        target: "q3",
      };

      expect(logic.conditions).toHaveLength(2);
    });
  });

  describe("HiddenFields Interface", () => {
    it("should accept various field types", () => {
      const fields: schema.HiddenFields = {
        userId: "user-123",
        score: 85,
        isReturning: true,
        campaign: undefined,
      };

      expect(fields.userId).toBe("user-123");
      expect(fields.score).toBe(85);
      expect(fields.isReturning).toBe(true);
    });
  });

  describe("FileUrl Interface", () => {
    it("should accept file url data", () => {
      const file: schema.FileUrl = {
        url: "https://example.com/files/document.pdf",
        name: "document.pdf",
        size: 1024000,
        type: "application/pdf",
      };

      expect(file.url).toContain("document.pdf");
      expect(file.size).toBe(1024000);
      expect(file.type).toBe("application/pdf");
    });
  });
});
