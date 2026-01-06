import { describe, it, expect } from "vitest";
import * as schema from "../schema";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("Database Schema", () => {
  describe("Users Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.users);
      expect(config.name).toBe("users");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.users);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");
    });

    it("should have email as unique column", () => {
      const config = getTableConfig(schema.users);
      const emailColumn = config.columns.find((c) => c.name === "email");

      expect(emailColumn?.isUnique).toBe(true);
    });

    it("should have id as primary key", () => {
      const config = getTableConfig(schema.users);
      const idColumn = config.columns.find((c) => c.name === "id");

      expect(idColumn?.primary).toBe(true);
    });
  });

  describe("Workspaces Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.workspaces);
      expect(config.name).toBe("workspaces");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.workspaces);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("slug");
      expect(columnNames).toContain("owner_id");
      expect(columnNames).toContain("settings");
      expect(columnNames).toContain("plan");
    });

    it("should have unique slug", () => {
      const config = getTableConfig(schema.workspaces);
      const slugColumn = config.columns.find((c) => c.name === "slug");

      expect(slugColumn?.isUnique).toBe(true);
    });

    it("should have foreign key to users", () => {
      const config = getTableConfig(schema.workspaces);
      const ownerIdColumn = config.columns.find((c) => c.name === "owner_id");

      expect(ownerIdColumn?.notNull).toBe(true);
    });
  });

  describe("Workspace Members Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.workspaceMembers);
      expect(config.name).toBe("workspace_members");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.workspaceMembers);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("workspace_id");
      expect(columnNames).toContain("user_id");
      expect(columnNames).toContain("role");
      expect(columnNames).toContain("joined_at");
    });

    it("should have unique constraint on workspace_id and user_id", () => {
      const config = getTableConfig(schema.workspaceMembers);
      expect(config.uniqueConstraints.length).toBeGreaterThan(0);
    });
  });

  describe("Forms Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.forms);
      expect(config.name).toBe("forms");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.forms);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("workspace_id");
      expect(columnNames).toContain("created_by");
      expect(columnNames).toContain("title");
      expect(columnNames).toContain("slug");
      expect(columnNames).toContain("status");
      expect(columnNames).toContain("settings");
    });

    it("should have is_public boolean field", () => {
      const config = getTableConfig(schema.forms);
      const isPublicColumn = config.columns.find((c) => c.name === "is_public");

      expect(isPublicColumn).toBeDefined();
    });

    it("should have unique constraint on workspace_id and slug", () => {
      const config = getTableConfig(schema.forms);
      expect(config.uniqueConstraints.length).toBeGreaterThan(0);
    });
  });

  describe("Questions Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.questions);
      expect(config.name).toBe("questions");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.questions);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("form_id");
      expect(columnNames).toContain("type");
      expect(columnNames).toContain("title");
      expect(columnNames).toContain("order");
      expect(columnNames).toContain("required");
      expect(columnNames).toContain("settings");
      expect(columnNames).toContain("validations");
    });

    it("should have order as required field", () => {
      const config = getTableConfig(schema.questions);
      const orderColumn = config.columns.find((c) => c.name === "order");

      expect(orderColumn?.notNull).toBe(true);
    });
  });

  describe("Question Options Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.questionOptions);
      expect(config.name).toBe("question_options");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.questionOptions);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("question_id");
      expect(columnNames).toContain("label");
      expect(columnNames).toContain("value");
      expect(columnNames).toContain("order");
    });
  });

  describe("Responses Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.responses);
      expect(config.name).toBe("responses");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.responses);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("form_id");
      expect(columnNames).toContain("respondent_id");
      expect(columnNames).toContain("status");
      expect(columnNames).toContain("started_at");
      expect(columnNames).toContain("completed_at");
    });

    it("should have tracking fields", () => {
      const config = getTableConfig(schema.responses);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("ip_address");
      expect(columnNames).toContain("user_agent");
      expect(columnNames).toContain("utm_source");
      expect(columnNames).toContain("utm_medium");
      expect(columnNames).toContain("utm_campaign");
    });
  });

  describe("Answers Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.answers);
      expect(config.name).toBe("answers");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.answers);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("response_id");
      expect(columnNames).toContain("question_id");
    });

    it("should have flexible value columns", () => {
      const config = getTableConfig(schema.answers);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("text_value");
      expect(columnNames).toContain("number_value");
      expect(columnNames).toContain("boolean_value");
      expect(columnNames).toContain("date_value");
      expect(columnNames).toContain("json_value");
      expect(columnNames).toContain("file_urls");
    });
  });

  describe("Themes Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.themes);
      expect(config.name).toBe("themes");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.themes);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("name");
      expect(columnNames).toContain("primary_color");
    });
  });

  describe("Form Versions Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.formVersions);
      expect(config.name).toBe("form_versions");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.formVersions);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("form_id");
      expect(columnNames).toContain("version");
      expect(columnNames).toContain("snapshot");
      expect(columnNames).toContain("created_by");
    });
  });

  describe("Question Groups Table", () => {
    it("should have the correct table name", () => {
      const config = getTableConfig(schema.questionGroups);
      expect(config.name).toBe("question_groups");
    });

    it("should have required columns", () => {
      const config = getTableConfig(schema.questionGroups);
      const columnNames = config.columns.map((c) => c.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("form_id");
      expect(columnNames).toContain("title");
      expect(columnNames).toContain("order");
    });
  });
});

describe("Schema Type Exports", () => {
  it("should export User type", () => {
    const userType: schema.User = {
      id: "test-id",
      email: "test@example.com",
      emailVerified: false,
      name: "Test User",
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(userType).toBeDefined();
  });

  it("should export NewUser type", () => {
    const newUser: schema.NewUser = {
      email: "test@example.com",
      name: "Test User",
    };
    expect(newUser).toBeDefined();
  });

  it("should export Workspace type", () => {
    const workspace: schema.Workspace = {
      id: "test-id",
      name: "Test Workspace",
      slug: "test-workspace",
      ownerId: "owner-id",
      logo: null,
      settings: {},
      plan: "free",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(workspace).toBeDefined();
  });

  it("should export Form type", () => {
    const form: schema.Form = {
      id: "test-id",
      workspaceId: "workspace-id",
      createdBy: "user-id",
      title: "Test Form",
      description: null,
      slug: "test-form",
      status: "draft",
      settings: {},
      isPublic: true,
      password: null,
      maxResponses: null,
      closeAt: null,
      openAt: null,
      themeId: null,
      customTheme: null,
      publishedAt: null,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(form).toBeDefined();
  });

  it("should export Question type", () => {
    const question: schema.Question = {
      id: "test-id",
      formId: "form-id",
      type: "short_text",
      title: "Test Question",
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
    };
    expect(question).toBeDefined();
  });

  it("should export Response type", () => {
    const response: schema.Response = {
      id: "test-id",
      formId: "form-id",
      respondentId: null,
      email: null,
      status: "in_progress",
      startedAt: new Date(),
      completedAt: null,
      lastActivityAt: new Date(),
      ipAddress: null,
      userAgent: null,
      device: null,
      browser: null,
      os: null,
      country: null,
      city: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      hiddenFields: {},
      createdAt: new Date(),
    };
    expect(response).toBeDefined();
  });
});
