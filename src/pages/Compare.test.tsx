import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { manifestFixture } from "../data/__fixtures__/manifest";
import { timeseriesFixtureUSA } from "../data/__fixtures__/timeseries";
import type { CountryTimeseries, YearRecord } from "../data/types";
import { AppRoutes } from "../router";
import { useAppStore } from "../store/useAppStore";

const realFetch = globalThis.fetch;

function ok<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const usaRec: YearRecord = {
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

const canRec: YearRecord = {
  ...usaRec,
  iso: "CAN",
  country: "Canada",
  region: "North America",
  hf_score: 8.85,
  hf_rank: 12,
};

const canTs: CountryTimeseries = {
  iso: "CAN",
  country: "Canada",
  region: "North America",
  series: timeseriesFixtureUSA.series,
};

describe("Compare page", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith("/data/index.json"))
        return Promise.resolve(ok(manifestFixture));
      if (url.includes("/years/"))
        return Promise.resolve(ok([usaRec, canRec]));
      if (url.includes("/timeseries/USA"))
        return Promise.resolve(ok(timeseriesFixtureUSA));
      if (url.includes("/timeseries/CAN")) return Promise.resolve(ok(canTs));
      return Promise.resolve(new Response("not found", { status: 404 }));
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
    useAppStore.getState().reset();
  });

  it("hydrates compared isos from the URL and renders the two countries", async () => {
    render(
      <MemoryRouter initialEntries={["/compare?iso=USA,CAN&year=2023"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getAllByText("United States").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Canada").length).toBeGreaterThan(0);
    });
    expect(useAppStore.getState().comparedIsos).toEqual(["USA", "CAN"]);
  });

  it("shows the empty state when no countries are selected", () => {
    render(
      <MemoryRouter initialEntries={["/compare"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/Use the search above to start comparing/i),
    ).toBeInTheDocument();
  });

  it("Clear all wipes the comparison list", async () => {
    render(
      <MemoryRouter initialEntries={["/compare?iso=USA,CAN"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getAllByText("Canada").length).toBeGreaterThan(0);
    });
    const clear = screen.getByRole("button", { name: /clear all/i });
    clear.click();
    await waitFor(() => {
      expect(useAppStore.getState().comparedIsos).toEqual([]);
    });
  });
});
