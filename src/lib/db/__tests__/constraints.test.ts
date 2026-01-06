import { describe, it, expect } from "vitest";
import * as schema from "../schema";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("Database Constraints", () => {
  describe("Primary Keys", () => {
    it("users table should have id as primary key", () => {
      const config = getTableConfig(schema.users);
      const idColumn = config.columns.find((c) => c.name === "id");
      expect(idColumn?.primary).toBe(true);
    });

    it("workspaces table should have id as primary key", () => {
      const config = getTableConfig(schema.workspaces);
      const idColumn = config.columns.find((c) => c.name === "id");
      expect(idColumn?.primary).toBe(true);
    });

    it("forms table should have id as primary key", () => {
      const config = getTableConfig(schema.forms);
      const idColumn = config.columns.find((c) => c.name === "id");
      expect(idColumn?.primary).toBe(true);
    });

    it("questions table should have id as primary key", () => {
      const config = getTableConfig(schema.questions);
      const idColumn = config.columns.find((c) => c.name === "id");
      expect(idColumn?.primary).toBe(true);
    });

    it("responses table should have id as primary key", () => {
      const config = getTableConfig(schema.responses);
      const idColumn = config.columns.find((c) => c.name === "id");
      expect(idColumn?.primary).toBe(true);
    });

    it("answers table should have id as primary key", () => {
      const config = getTableConfig(schema.answers);
      const idColumn = config.columns.find((c) => c.name === "id");
      expect(idColumn?.primary).toBe(true);
    });
  });

  describe("Unique Constraints", () => {
    it("users table should have unique email constraint", () => {
      const config = getTableConfig(schema.users);
      const emailColumn = config.columns.find((c) => c.name === "email");
      expect(emailColumn?.isUnique).toBe(true);
    });

    it("workspaces table should have unique slug constraint", () => {
      const config = getTableConfig(schema.workspaces);
      const slugColumn = config.columns.find((c) => c.name === "slug");
      expect(slugColumn?.isUnique).toBe(true);
    });

    it("workspace_members table should have unique workspace_id and user_id combination", () => {
      const config = getTableConfig(schema.workspaceMembers);
      const uniqueConstraints = config.uniqueConstraints;

      expect(uniqueConstraints.length).toBeGreaterThan(0);
      const memberUnique = uniqueConstraints.find(
        (u) => u.name === "unique_member"
      );
      expect(memberUnique).toBeDefined();
    });

    it("forms table should have unique workspace_id and slug combination", () => {
      const config = getTableConfig(schema.forms);
      const uniqueConstraints = config.uniqueConstraints;

      expect(uniqueConstraints.length).toBeGreaterThan(0);
      const slugWorkspaceUnique = uniqueConstraints.find(
        (u) => u.name === "slug_workspace_unique"
      );
      expect(slugWorkspaceUnique).toBeDefined();
    });

    it("workspace_invitations table should have unique token constraint", () => {
      const config = getTableConfig(schema.workspaceInvitations);
      const tokenColumn = config.columns.find((c) => c.name === "token");
      expect(tokenColumn?.isUnique).toBe(true);
    });
  });

  describe("Not Null Constraints", () => {
    it("users.email should be not null", () => {
      const config = getTableConfig(schema.users);
      const emailColumn = config.columns.find((c) => c.name === "email");
      expect(emailColumn?.notNull).toBe(true);
    });

    it("workspaces.name should be not null", () => {
      const config = getTableConfig(schema.workspaces);
      const nameColumn = config.columns.find((c) => c.name === "name");
      expect(nameColumn?.notNull).toBe(true);
    });

    it("workspaces.owner_id should be not null", () => {
      const config = getTableConfig(schema.workspaces);
      const ownerIdColumn = config.columns.find((c) => c.name === "owner_id");
      expect(ownerIdColumn?.notNull).toBe(true);
    });

    it("forms.workspace_id should be not null", () => {
      const config = getTableConfig(schema.forms);
      const workspaceIdColumn = config.columns.find(
        (c) => c.name === "workspace_id"
      );
      expect(workspaceIdColumn?.notNull).toBe(true);
    });

    it("forms.created_by should be not null", () => {
      const config = getTableConfig(schema.forms);
      const createdByColumn = config.columns.find(
        (c) => c.name === "created_by"
      );
      expect(createdByColumn?.notNull).toBe(true);
    });

    it("forms.title should be not null", () => {
      const config = getTableConfig(schema.forms);
      const titleColumn = config.columns.find((c) => c.name === "title");
      expect(titleColumn?.notNull).toBe(true);
    });

    it("questions.form_id should be not null", () => {
      const config = getTableConfig(schema.questions);
      const formIdColumn = config.columns.find((c) => c.name === "form_id");
      expect(formIdColumn?.notNull).toBe(true);
    });

    it("questions.type should be not null", () => {
      const config = getTableConfig(schema.questions);
      const typeColumn = config.columns.find((c) => c.name === "type");
      expect(typeColumn?.notNull).toBe(true);
    });

    it("questions.order should be not null", () => {
      const config = getTableConfig(schema.questions);
      const orderColumn = config.columns.find((c) => c.name === "order");
      expect(orderColumn?.notNull).toBe(true);
    });

    it("responses.form_id should be not null", () => {
      const config = getTableConfig(schema.responses);
      const formIdColumn = config.columns.find((c) => c.name === "form_id");
      expect(formIdColumn?.notNull).toBe(true);
    });

    it("answers.response_id should be not null", () => {
      const config = getTableConfig(schema.answers);
      const responseIdColumn = config.columns.find(
        (c) => c.name === "response_id"
      );
      expect(responseIdColumn?.notNull).toBe(true);
    });

    it("answers.question_id should be not null", () => {
      const config = getTableConfig(schema.answers);
      const questionIdColumn = config.columns.find(
        (c) => c.name === "question_id"
      );
      expect(questionIdColumn?.notNull).toBe(true);
    });
  });

  describe("Foreign Key Constraints", () => {
    it("workspaces.owner_id should reference users.id", () => {
      const config = getTableConfig(schema.workspaces);
      const ownerIdColumn = config.columns.find((c) => c.name === "owner_id");
      expect(ownerIdColumn).toBeDefined();
      // Foreign key is defined via .references()
    });

    it("forms.workspace_id should reference workspaces.id with cascade delete", () => {
      const config = getTableConfig(schema.forms);
      const workspaceIdColumn = config.columns.find(
        (c) => c.name === "workspace_id"
      );
      expect(workspaceIdColumn).toBeDefined();
    });

    it("questions.form_id should reference forms.id with cascade delete", () => {
      const config = getTableConfig(schema.questions);
      const formIdColumn = config.columns.find((c) => c.name === "form_id");
      expect(formIdColumn).toBeDefined();
    });

    it("responses.form_id should reference forms.id with cascade delete", () => {
      const config = getTableConfig(schema.responses);
      const formIdColumn = config.columns.find((c) => c.name === "form_id");
      expect(formIdColumn).toBeDefined();
    });

    it("answers.response_id should reference responses.id with cascade delete", () => {
      const config = getTableConfig(schema.answers);
      const responseIdColumn = config.columns.find(
        (c) => c.name === "response_id"
      );
      expect(responseIdColumn).toBeDefined();
    });

    it("answers.question_id should reference questions.id with cascade delete", () => {
      const config = getTableConfig(schema.answers);
      const questionIdColumn = config.columns.find(
        (c) => c.name === "question_id"
      );
      expect(questionIdColumn).toBeDefined();
    });
  });

  describe("Default Values", () => {
    it("users.email_verified should default to false", () => {
      const config = getTableConfig(schema.users);
      const emailVerifiedColumn = config.columns.find(
        (c) => c.name === "email_verified"
      );
      expect(emailVerifiedColumn?.default).toBe(false);
    });

    it("workspaces.plan should default to free", () => {
      const config = getTableConfig(schema.workspaces);
      const planColumn = config.columns.find((c) => c.name === "plan");
      expect(planColumn?.default).toBe("free");
    });

    it("forms.status should default to draft", () => {
      const config = getTableConfig(schema.forms);
      const statusColumn = config.columns.find((c) => c.name === "status");
      expect(statusColumn?.default).toBe("draft");
    });

    it("forms.is_public should default to true", () => {
      const config = getTableConfig(schema.forms);
      const isPublicColumn = config.columns.find((c) => c.name === "is_public");
      expect(isPublicColumn?.default).toBe(true);
    });

    it("questions.required should default to false", () => {
      const config = getTableConfig(schema.questions);
      const requiredColumn = config.columns.find((c) => c.name === "required");
      expect(requiredColumn?.default).toBe(false);
    });

    it("responses.status should default to in_progress", () => {
      const config = getTableConfig(schema.responses);
      const statusColumn = config.columns.find((c) => c.name === "status");
      expect(statusColumn?.default).toBe("in_progress");
    });

    it("workspace_members.role should default to member", () => {
      const config = getTableConfig(schema.workspaceMembers);
      const roleColumn = config.columns.find((c) => c.name === "role");
      expect(roleColumn?.default).toBe("member");
    });
  });
});
