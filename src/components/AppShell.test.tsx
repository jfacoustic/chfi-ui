import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppShell from "./AppShell";
import { ErrorBoundary } from "./ErrorBoundary";

describe("AppShell", () => {
  it("renders header with site title and primary nav", () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>content</p>
        </AppShell>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: /2025 Human Freedom Index Report \(2023 data\)/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /countries/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /compare/i })).toBeInTheDocument();
  });

  it("renders footer with attribution to Cato", () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>content</p>
        </AppShell>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Cato Institute/i)).toBeInTheDocument();
  });

  it("renders children inside the main element", () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p data-testid="child">payload</p>
        </AppShell>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  function Boom(): ReactElement {
    throw new Error("kaboom");
  }

  it("catches a render error and shows fallback", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/kaboom/i);
    consoleError.mockRestore();
  });
});
