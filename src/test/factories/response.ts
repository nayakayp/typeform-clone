import { faker } from "@faker-js/faker";

export const responseFactory = {
  build: (
    overrides: Partial<{
      id: string;
      formId: string;
      respondentId: string | null;
      email: string | null;
      status: string;
      startedAt: Date;
      completedAt: Date | null;
      lastActivityAt: Date;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
    }> = {}
  ) => ({
    id: faker.string.uuid(),
    formId: faker.string.uuid(),
    respondentId: faker.string.uuid(),
    email: faker.internet.email(),
    status: "in_progress",
    startedAt: new Date(),
    completedAt: null,
    lastActivityAt: new Date(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    createdAt: new Date(),
    ...overrides,
  }),

  buildCompleted: (overrides = {}) =>
    responseFactory.build({
      status: "completed",
      completedAt: new Date(),
      ...overrides,
    }),

  buildMany: (count: number, overrides = {}) =>
    Array.from({ length: count }, () => responseFactory.build(overrides)),
};

export const answerFactory = {
  build: (
    overrides: Partial<{
      id: string;
      responseId: string;
      questionId: string;
      textValue: string | null;
      numberValue: string | null;
      booleanValue: boolean | null;
      dateValue: Date | null;
      jsonValue: unknown | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {}
  ) => ({
    id: faker.string.uuid(),
    responseId: faker.string.uuid(),
    questionId: faker.string.uuid(),
    textValue: faker.lorem.sentence(),
    numberValue: null,
    booleanValue: null,
    dateValue: null,
    jsonValue: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  buildMany: (count: number, overrides = {}) =>
    Array.from({ length: count }, () => answerFactory.build(overrides)),
};
