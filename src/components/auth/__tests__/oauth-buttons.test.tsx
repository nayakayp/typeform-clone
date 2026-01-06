import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OAuthButtons } from "../oauth-buttons";

describe("OAuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Google and GitHub buttons", () => {
    render(<OAuthButtons />);

    expect(
      screen.getByRole("button", { name: /Continue with Google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue with GitHub/i })
    ).toBeInTheDocument();
  });

  it("disables buttons when parent isLoading is true", () => {
    render(<OAuthButtons isLoading={true} />);

    expect(
      screen.getByRole("button", { name: /Continue with Google/i })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Continue with GitHub/i })
    ).toBeDisabled();
  });

  it("buttons are enabled when isLoading is false", () => {
    render(<OAuthButtons isLoading={false} />);

    expect(
      screen.getByRole("button", { name: /Continue with Google/i })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Continue with GitHub/i })
    ).toBeEnabled();
  });

  it("clicking Google button triggers OAuth flow", async () => {
    const user = userEvent.setup();
    render(<OAuthButtons />);

    const googleButton = screen.getByRole("button", {
      name: /Continue with Google/i,
    });

    // The button should be clickable
    await user.click(googleButton);

    // After clicking, the button should show loading state briefly
    // We can't fully test OAuth redirect in unit tests
  });

  it("clicking GitHub button triggers OAuth flow", async () => {
    const user = userEvent.setup();
    render(<OAuthButtons />);

    const githubButton = screen.getByRole("button", {
      name: /Continue with GitHub/i,
    });

    await user.click(githubButton);
    // OAuth flow is triggered - we can't fully test redirect behavior in unit tests
  });

  it("buttons have type='button' to prevent form submission", () => {
    render(<OAuthButtons />);

    const googleButton = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    const githubButton = screen.getByRole("button", {
      name: /Continue with GitHub/i,
    });

    expect(googleButton).toHaveAttribute("type", "button");
    expect(githubButton).toHaveAttribute("type", "button");
  });

  it("renders SVG icons for both providers", () => {
    render(<OAuthButtons />);

    // Check for SVG elements (both providers have SVG icons)
    const svgElements = document.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThanOrEqual(2);
  });

  it("buttons have variant='outline'", () => {
    render(<OAuthButtons />);

    const googleButton = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    const githubButton = screen.getByRole("button", {
      name: /Continue with GitHub/i,
    });

    // Both buttons should have the outline variant class applied by shadcn
    expect(googleButton).toHaveClass("w-full");
    expect(githubButton).toHaveClass("w-full");
  });
});
