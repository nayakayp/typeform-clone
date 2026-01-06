import { http, HttpResponse } from "msw";

// Default mock user for authenticated tests
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  emailVerified: true,
  image: null,
};

export const mockSession = {
  id: "test-session-id",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const handlers = [
  // Auth endpoints
  http.get("/api/auth/session", () => {
    return HttpResponse.json({
      user: mockUser,
      session: mockSession,
    });
  }),

  // Sign up endpoint
  http.post("/api/auth/sign-up/email", async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };

    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        { error: { message: "User already exists" } },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      user: {
        id: "new-user-id",
        email: body.email,
        name: body.name,
        emailVerified: false,
      },
      session: mockSession,
    });
  }),

  // Sign in endpoint
  http.post("/api/auth/sign-in/email", async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === "wrong@example.com") {
      return HttpResponse.json(
        { error: { message: "Invalid credentials" } },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user: mockUser,
      session: mockSession,
    });
  }),

  // Sign out endpoint
  http.post("/api/auth/sign-out", () => {
    return HttpResponse.json({ success: true });
  }),

  // OAuth sign in endpoint
  http.post("/api/auth/sign-in/social", async ({ request }) => {
    const body = (await request.json()) as { provider: string };

    return HttpResponse.json({
      url: `https://oauth.example.com/${body.provider}/authorize`,
    });
  }),

  // Forgot password endpoint
  http.post("/api/auth/forget-password", async ({ request }) => {
    const body = (await request.json()) as { email: string };

    if (body.email === "error@example.com") {
      return HttpResponse.json(
        { message: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return HttpResponse.json({ success: true });
  }),

  // Reset password endpoint
  http.post("/api/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as {
      token: string;
      newPassword: string;
    };

    if (body.token === "invalid-token") {
      return HttpResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return HttpResponse.json({ success: true });
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
