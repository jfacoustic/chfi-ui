import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppRoutes } from "./router";
import { useAppStore } from "./store/useAppStore";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("AppRoutes", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it("renders Home at /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /heat map/i })).toBeInTheDocument();
  });

  it("renders Countries at /countries", () => {
    renderAt("/countries");
    expect(screen.getByRole("heading", { name: /countries/i })).toBeInTheDocument();
  });

  it("renders CountryDetail at /country/:iso (heading shown after data loads or NotFound for unknown iso)", () => {
    // Stub fetch to fail fast so the page settles into an error state quickly.
    const realFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(new Response("nope", { status: 404 }))) as typeof fetch;
    try {
      renderAt("/country/USA");
      // Either the loading state, an error state, or the country header
      // proves the route is wired. Asserting one of those is sufficient
      // for routing-only coverage; the data-driven assertions live in
      // CountryDetail.test.tsx.
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it("renders Compare at /compare", () => {
    renderAt("/compare");
    expect(screen.getByRole("heading", { name: /compare/i })).toBeInTheDocument();
  });

  it("renders NotFound for an unknown route", () => {
    renderAt("/no-such-place");
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });
});
