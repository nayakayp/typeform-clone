import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders a button with default variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with different variants", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-destructive");
  });

  it("renders with different sizes", () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByRole("button", { name: /small button/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("h-8");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  it("renders as a child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });
});
