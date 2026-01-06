import { faker } from "@faker-js/faker";

export const userFactory = {
  build: (
    overrides: Partial<{
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image: string | null;
      createdAt: Date;
      updatedAt: Date;
    }> = {}
  ) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    emailVerified: true,
    image: faker.image.avatar(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  buildMany: (count: number, overrides = {}) =>
    Array.from({ length: count }, () => userFactory.build(overrides)),
};
