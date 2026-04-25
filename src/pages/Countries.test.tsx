import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { YearRecord } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { AppRoutes } from "../router";

const realFetch = globalThis.fetch;

function rec(
  iso: string,
  country: string,
  region: YearRecord["region"],
  rank: number | null,
  score: number | null,
  quartile: number | null,
): YearRecord {
  return {
    iso,
    country,
    region,
    year: 2023,
    hf_score: score,
    hf_rank: rank,
    hf_quartile: quartile,
    pf_score: score,
    pf_rank: null,
    ef_score: score,
    ef_rank: null,
    pf_rol: null,
    pf_ss: null,
    pf_movement: null,
    pf_religion: null,
    pf_assembly: null,
    pf_expression: null,
    pf_identity: null,
    ef_government: null,
    ef_legal: null,
    ef_money: null,
    ef_trade: null,
    ef_regulation: null,
  };
}

const DATA: YearRecord[] = [
  rec("USA", "United States", "North America", 17, 8.7, 1),
  rec("CAN", "Canada", "North America", 12, 8.85, 1),
  rec("DEU", "Germany", "Western Europe", 25, 8.5, 2),
  rec("ZWE", "Zimbabwe", "Sub-Saharan Africa", 150, 5.2, 4),
];

function ok<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Countries page", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
    globalThis.fetch = vi.fn().mockResolvedValue(ok(DATA)) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
    useAppStore.getState().reset();
  });

  it("hydrates filters from URL and renders matching rows", async () => {
    render(
      <MemoryRouter
        initialEntries={[
          "/countries?q=can&region=North%20America",
        ]}
      >
        <AppRoutes />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Canada/i })).toBeInTheDocument();
    });
    // United States is in North America too but filtered out by q=can.
    expect(screen.queryByRole("link", { name: /United States/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Germany/i })).toBeNull();
  });

  it("shows the empty state when filters return zero matches", async () => {
    render(
      <MemoryRouter initialEntries={["/countries?q=zzznomatchzzz"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(
        screen.getByText(/No countries match your filters/i),
      ).toBeInTheDocument();
    });
  });

  it("renders a row per record at the default URL", async () => {
    render(
      <MemoryRouter initialEntries={["/countries"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() => {
      // header + 4 records
      expect(screen.getAllByRole("row").length).toBe(5);
    });
    // Default sort: by hf_rank asc. Canada (12) comes first.
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Canada");
  });

  it("typing in search filters rows live", async () => {
    render(
      <MemoryRouter initialEntries={["/countries"]}>
        <AppRoutes />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(screen.getAllByRole("row").length).toBeGreaterThan(1),
    );
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "germ" },
    });
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Germany/i })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /Canada/i })).toBeNull();
    });
  });
});
