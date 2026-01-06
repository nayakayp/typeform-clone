import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../use-auth";

// Mock the useSession hook from auth client
vi.mock("@/lib/auth/client", () => ({
  useSession: vi.fn(),
}));

describe("useAuth hook", () => {
  it("returns user data when authenticated", async () => {
    const { useSession } = await import("@/lib/auth/client");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
        },
        session: {
          id: "session-1",
          expiresAt: new Date().toISOString(),
        },
      },
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    });
    expect(result.current.session).toEqual({
      id: "session-1",
      expiresAt: expect.any(String),
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns null user when not authenticated", async () => {
    const { useSession } = await import("@/lib/auth/client");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns loading state when session is pending", async () => {
    const { useSession } = await import("@/lib/auth/client");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns error when session fetch fails", async () => {
    const { useSession } = await import("@/lib/auth/client");
    const error = new Error("Session fetch failed");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isPending: false,
      error,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.error).toBe(error);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("handles session with user but no session object", async () => {
    const { useSession } = await import("@/lib/auth/client");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
        },
        session: null,
      },
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeTruthy();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("isAuthenticated is false when data exists but user is null", async () => {
    const { useSession } = await import("@/lib/auth/client");
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        user: null,
        session: null,
      },
      isPending: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });
});
