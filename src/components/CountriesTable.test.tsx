import type { SortingState } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { YearRecord } from "../data/types";
import { CountriesTable } from "./CountriesTable";

function rec(
  iso: string,
  country: string,
  region: YearRecord["region"],
  rank: number | null,
  hf: number | null,
  quartile: number | null,
): YearRecord {
  return {
    iso,
    country,
    region,
    year: 2023,
    hf_score: hf,
    hf_rank: rank,
    hf_quartile: quartile,
    pf_score: hf,
    pf_rank: null,
    ef_score: hf,
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

const FIXTURE: YearRecord[] = [
  rec("USA", "United States", "North America", 17, 8.7, 1),
  rec("CAN", "Canada", "North America", 12, 8.85, 1),
  rec("DEU", "Germany", "Western Europe", 25, 8.5, 2),
  rec("FRA", "France", "Western Europe", 30, 8.4, 2),
  rec("ZWE", "Zimbabwe", "Sub-Saharan Africa", 150, 5.2, 4),
];

interface HarnessProps {
  data: YearRecord[];
  initialSorting?: SortingState;
  initialPageSize?: number;
}

function Harness({ data, initialSorting, initialPageSize = 25 }: HarnessProps) {
  const [sorting, setSorting] = useState<SortingState>(
    initialSorting ?? [{ id: "hf_rank", desc: false }],
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  return (
    <MemoryRouter>
      <CountriesTable
        data={data}
        sorting={sorting}
        onSortingChange={setSorting}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPageIndex(0);
        }}
      />
    </MemoryRouter>
  );
}

describe("CountriesTable", () => {
  it("renders one row per data record sorted by HF rank ascending by default", () => {
    render(<Harness data={FIXTURE} />);
    const rowEls = screen.getAllByRole("row");
    // header + 5 data rows
    expect(rowEls.length).toBe(6);
    // first data row should be Canada (rank 12).
    expect(rowEls[1]).toHaveTextContent("Canada");
    expect(rowEls[1]).toHaveTextContent("12");
  });

  it("toggles sorting direction on header click", () => {
    render(<Harness data={FIXTURE} />);
    const rankHeader = screen.getByRole("button", { name: /Rank/i });
    fireEvent.click(rankHeader); // asc → desc (enableSortingRemoval=false)
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Zimbabwe");
  });

  it("paginates: with 30 rows, page 1 shows 25 and page 2 shows 5", () => {
    const big: YearRecord[] = Array.from({ length: 30 }, (_, i) =>
      rec(
        `C${i.toString().padStart(2, "0")}`,
        `Country ${i.toString().padStart(2, "0")}`,
        "Western Europe",
        i + 1,
        9 - i * 0.1,
        1,
      ),
    );
    render(<Harness data={big} />);
    expect(screen.getAllByRole("row").length - 1).toBe(25);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getAllByRole("row").length - 1).toBe(5);
  });

  it("renders '—' for null rank/score values", () => {
    const data = [rec("XXX", "Mystery", "Oceania", null, null, null)];
    render(<Harness data={data} />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("country cell links to /country/:iso", () => {
    render(<Harness data={FIXTURE} />);
    const link = screen.getByRole("link", { name: /Canada/i });
    expect(link).toHaveAttribute("href", "/country/CAN");
  });
});
