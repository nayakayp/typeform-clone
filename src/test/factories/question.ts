import { faker } from "@faker-js/faker";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "multiple_choice"
  | "rating"
  | "yes_no"
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

  buildMany: (count: number, type: QuestionType = "short_text", overrides = {}) =>
    Array.from({ length: count }, (_, i) =>
      questionFactory.build(type, { order: i, ...overrides })
    ),
};
