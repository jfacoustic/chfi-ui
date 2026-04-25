import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeseriesFixtureUSA } from "../data/__fixtures__/timeseries";
import type { YearRecord } from "../data/types";
import { AppRoutes } from "../router";
import { useAppStore } from "../store/useAppStore";

const realFetch = globalThis.fetch;

function ok<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const usaRecord: YearRecord = {
  iso: "USA",
  country: "United States",
  region: "North America",
  year: 2023,
  hf_score: 8.71,
  hf_rank: 17,
  hf_quartile: 1,
  pf_score: 8.85,
  pf_rank: 25,
  ef_score: 8.56,
  ef_rank: 5,
  pf_rol: 7.5,
  pf_ss: 9,
  pf_movement: 9,
  pf_religion: 9,
  pf_assembly: 9,
  pf_expression: 9,
  pf_identity: 9,
  ef_government: 7,
  ef_legal: 7.5,
  ef_money: 9.2,
  ef_trade: 8.7,
  ef_regulation: 8.3,
};

describe("CountryDetail", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/years/")) return Promise.resolve(ok([usaRecord]));
      if (url.includes("/timeseries/USA"))
        return Promise.resolve(ok(timeseriesFixtureUSA));
      return Promise.resolve(new Response("not found", { status: 404 }));
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
    useAppStore.getState().reset();
  });

  it("renders country header, score cards, and chart sections for /country/USA", async () => {
    render(
      <MemoryRouter initialEntries={["/country/USA"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /united states/i }),
      ).toBeInTheDocument(),
    );
    // Score appears once in the headline and once in the ScoreBadge.
    expect(screen.getAllByText("8.71").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("8.85")).toBeInTheDocument();
    expect(screen.getByText("8.56")).toBeInTheDocument();
    expect(screen.getByText(/Rank 17/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add to compare/i }),
    ).toBeInTheDocument();
  });

  it("normalizes lowercase ISO to uppercase", async () => {
    render(
      <MemoryRouter initialEntries={["/country/usa"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /united states/i }),
      ).toBeInTheDocument(),
    );
  });

  it("renders the 404 page for an unknown ISO3", () => {
    render(
      <MemoryRouter initialEntries={["/country/XYZ"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });
});
