import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth endpoints
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        emailVerified: true,
      },
      session: {
        id: "test-session-id",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),

  // Forms endpoints
  http.get("/api/forms", () => {
    return HttpResponse.json({
      forms: [],
      total: 0,
    });
  }),

  http.get("/api/forms/:id", ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: "Test Form",
      description: "A test form",
      status: "draft",
      questions: [],
    });
  }),

  http.post("/api/forms", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: "new-form-id",
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Workspaces endpoints
  http.get("/api/workspaces", () => {
    return HttpResponse.json({
      workspaces: [
        {
          id: "test-workspace-id",
          name: "Test Workspace",
          slug: "test-workspace",
        },
      ],
    });
  }),

  // Responses endpoints
  http.get("/api/forms/:formId/responses", () => {
    return HttpResponse.json({
      responses: [],
      total: 0,
    });
  }),

  http.post("/api/forms/:formId/responses", async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: "new-response-id",
        formId: params.formId,
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),
];
