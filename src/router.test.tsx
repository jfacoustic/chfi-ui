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

  it("renders CountryDetail at /country/:iso with the iso uppercased", () => {
    renderAt("/country/usa");
    expect(
      screen.getByRole("heading", { name: /country: USA/i }),
    ).toBeInTheDocument();
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
