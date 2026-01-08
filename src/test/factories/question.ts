import { faker } from "@faker-js/faker";
import type { BuilderQuestion } from "@/types/builder";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "multiple_choice"
  | "rating"
  | "yes_no"
  | "number"
  | "phone"
  | "url"
  | "date"
  | "checkboxes"
  | "dropdown"
  | "opinion_scale"
  | "nps"
  | "welcome_screen"
  | "thank_you_screen";

export const questionFactory = {
  build: (
    type: QuestionType = "short_text",
    overrides: Partial<{
      id: string;
      formId: string;
      type: QuestionType;
      title: string;
      description: string | null;
      placeholder: string | null;
      order: number;
      required: boolean;
      validations: Record<string, unknown> | null;
      settings: Record<string, unknown> | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {}
  ) => ({
    id: faker.string.uuid(),
    formId: faker.string.uuid(),
    type,
    title: faker.lorem.sentence(),
    description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    placeholder: type === "short_text" ? faker.lorem.words(3) : null,
    order: 0,
    required: false,
    validations: null,
    settings: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  buildShortText: (overrides = {}) =>
    questionFactory.build("short_text", {
      placeholder: "Enter your answer...",
      ...overrides,
    }),

  buildMultipleChoice: (overrides = {}) =>
    questionFactory.build("multiple_choice", {
      settings: {
        allowOther: false,
        randomizeOptions: false,
      },
      ...overrides,
    }),

  buildRating: (overrides = {}) =>
    questionFactory.build("rating", {
      settings: {
        ratingScale: 5,
        ratingShape: "star",
      },
      ...overrides,
    }),

  buildMany: (
    count: number,
    type: QuestionType = "short_text",
    overrides = {}
  ) =>
    Array.from({ length: count }, (_, i) =>
      questionFactory.build(type, { order: i, ...overrides })
    ),
};

// Builder question factory for form builder tests
export const builderQuestionFactory = {
  build: (
    type: QuestionType = "short_text",
    overrides: Partial<BuilderQuestion> = {}
  ): BuilderQuestion => ({
    id: faker.string.uuid(),
    type: type as BuilderQuestion["type"],
    title: faker.lorem.sentence(),
    description: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    placeholder: type === "short_text" ? faker.lorem.words(3) : null,
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
    isNew: false,
    options: [],
    ...overrides,
  }),

  buildShortText: (overrides: Partial<BuilderQuestion> = {}) =>
    builderQuestionFactory.build("short_text", {
      placeholder: "Enter your answer...",
      ...overrides,
    }),

  buildMultipleChoice: (overrides: Partial<BuilderQuestion> = {}) =>
    builderQuestionFactory.build("multiple_choice", {
      settings: {
        allowOther: false,
        randomizeOptions: false,
      } as Record<string, unknown>,
      options: [
        { id: faker.string.uuid(), label: "Option 1", value: "option_1", order: 0, image: null, questionId: "" },
        { id: faker.string.uuid(), label: "Option 2", value: "option_2", order: 1, image: null, questionId: "" },
      ],
      ...overrides,
    }),

  buildRating: (overrides: Partial<BuilderQuestion> = {}) =>
    builderQuestionFactory.build("rating", {
      settings: {
        ratingScale: 5,
        ratingShape: "star",
      },
      ...overrides,
    }),

  buildMany: (
    count: number,
    type: QuestionType = "short_text",
    overrides: Partial<BuilderQuestion> = {}
  ) =>
    Array.from({ length: count }, (_, i) =>
      builderQuestionFactory.build(type, { order: i, ...overrides })
    ),
};
