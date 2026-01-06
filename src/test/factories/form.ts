import { faker } from "@faker-js/faker";
import type { FormSettings, CustomTheme } from "@/lib/db/schema/forms";

export const formFactory = {
  build: (
    overrides: Partial<{
      id: string;
      workspaceId: string;
      createdBy: string;
      title: string;
      description: string | null;
      slug: string;
      status: string;
      settings: FormSettings | null;
      isPublic: boolean;
      password: string | null;
      themeId: string | null;
      customTheme: CustomTheme | null;
      publishedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {}
  ) => ({
    id: faker.string.uuid(),
    workspaceId: faker.string.uuid(),
    createdBy: faker.string.uuid(),
    title: faker.lorem.sentence(3),
    description: faker.lorem.paragraph(),
    slug: faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
    status: "draft",
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true,
      shuffleQuestions: false,
      oneQuestionPerPage: true,
    },
    isPublic: true,
    password: null,
    themeId: null,
    customTheme: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  buildPublished: (overrides = {}) =>
    formFactory.build({
      status: "published",
      publishedAt: new Date(),
      ...overrides,
    }),

  buildMany: (count: number, overrides = {}) =>
    Array.from({ length: count }, () => formFactory.build(overrides)),
};
