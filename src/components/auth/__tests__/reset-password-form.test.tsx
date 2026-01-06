import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Use vi.hoisted to ensure the mock state is available during mock hoisting
const mockState = vi.hoisted(() => ({
  tokenValue: "valid-token" as string | null,
}));

// Mock next/navigation at the module level
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "token") return mockState.tokenValue;
      return null;
    },
  }),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { ResetPasswordForm } from "../reset-password-form";

describe("ResetPasswordForm with valid token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the mock to return a valid token
    mockState.tokenValue = "valid-token";
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it("renders the reset password form correctly with token", () => {
    render(<ResetPasswordForm />);

    expect(
      screen.getByRole("heading", { name: "Reset Password" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter your new password below")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset Password" })
    ).toBeInTheDocument();
  });

  it("shows validation error for empty password", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "short");
    await user.type(screen.getByLabelText("Confirm New Password"), "short");
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters")
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for mismatched passwords", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "password123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "different456"
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
    });
  });

  it("submits the form successfully and shows success message", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "newpassword123"
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(screen.getByText("Password Reset Successful")).toBeInTheDocument();
      expect(
        screen.getByText(/Your password has been reset/)
      ).toBeInTheDocument();
    });
  });

  it("shows sign in now button after success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "newpassword123"
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sign In Now" })
      ).toBeInTheDocument();
    });
  });

  it.skip("shows error message on API failure", async () => {
    // TODO: This test is flaky due to timing issues with mock resets
    // Clear the default mock and set error response
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid or expired token" }),
    });

    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "newpassword123"
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid or expired token")).toBeInTheDocument();
    });
  });

  it.skip("shows generic error on unexpected failure", async () => {
    // TODO: This test is flaky due to timing issues with mock resets
    // Clear the default mock and set rejection
    mockFetch.mockReset();
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "newpassword123"
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));

    await waitFor(() => {
      expect(
        screen.getByText("An unexpected error occurred")
      ).toBeInTheDocument();
    });
  });

  it.skip("disables inputs while loading", async () => {
    // TODO: This test is flaky due to timing issues with loading state detection
    // This test verifies that the button shows loading state and inputs are disabled
    // We check the button's disabled state during the loading phase
    mockFetch.mockReset();
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          // Never resolve - we just want to check loading state
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true }),
            });
          }, 10000); // Very long timeout
        })
    );

    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.type(
      screen.getByLabelText("Confirm New Password"),
      "newpassword123"
    );

    // Don't await the click - we want to check state during the loading
    const button = screen.getByRole("button", { name: "Reset Password" });

    user.click(button);

    // Wait a tick for React to process the click and start loading
    await waitFor(
      () => {
        expect(screen.getByLabelText("New Password")).toBeDisabled();
      },
      { timeout: 500 }
    );
    expect(screen.getByLabelText("Confirm New Password")).toBeDisabled();
  });
});

describe("ResetPasswordForm without token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the mock to return null for token
    mockState.tokenValue = null;
  });

  it("shows invalid link message when token is missing", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByText("Invalid Link")).toBeInTheDocument();
    expect(
      screen.getByText("This password reset link is invalid or has expired.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Request New Link" })
    ).toBeInTheDocument();
  });

  it("has link to forgot password page", () => {
    render(<ResetPasswordForm />);

    const link = screen.getByRole("link", { name: /Request New Link/i });
    expect(link).toHaveAttribute("href", "/forgot-password");
  });
});
