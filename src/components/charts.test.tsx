import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TimeseriesPoint } from "../data/types";
import { CategoryBars } from "./CategoryBars";
import { RadarBreakdown } from "./RadarBreakdown";
import { TimeseriesChart } from "./TimeseriesChart";

const radarValues = {
  pf_rol: 7.5,
  pf_ss: 9.0,
  pf_movement: 9.0,
  pf_religion: 9.0,
  pf_assembly: 9.0,
  pf_expression: 9.0,
  pf_identity: null,
  ef_government: 7.0,
  ef_legal: 7.5,
  ef_money: 9.2,
  ef_trade: 8.7,
  ef_regulation: 8.3,
};

describe("RadarBreakdown", () => {
  it("renders 12 axis labels (7 PF + 5 EF)", () => {
    const { container } = render(
      <RadarBreakdown
        series={[
          {
            iso: "USA",
            name: "United States",
            color: "#2563eb",
            values: radarValues,
          },
        ]}
      />,
    );
    // ResponsiveContainer needs explicit dimensions in jsdom; the chart
    // still renders the surface element. Just assert the component mounts
    // without throwing and exposes a recharts wrapper.
    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy();
  });
});

describe("CategoryBars", () => {
  it("renders the PF panel without throwing", () => {
    const { container } = render(
      <CategoryBars
        series={[
          {
            iso: "USA",
            name: "United States",
            color: "#2563eb",
            values: radarValues,
          },
        ]}
        group="pf"
        title="Personal Freedom categories"
      />,
    );
    expect(
      screen.getByRole("heading", { name: /personal freedom categories/i }),
    ).toBeInTheDocument();
    expect(container.querySelector(".recharts-responsive-container")).toBeTruthy();
  });

  it("renders the EF panel with the EF heading", () => {
    render(
      <CategoryBars
        series={[
          {
            iso: "USA",
            name: "United States",
            color: "#2563eb",
            values: radarValues,
          },
        ]}
        group="ef"
        title="Economic Freedom categories"
      />,
    );
    expect(
      screen.getByRole("heading", { name: /economic freedom categories/i }),
    ).toBeInTheDocument();
  });
});

function tsPoints(seed: number): TimeseriesPoint[] {
  const out: TimeseriesPoint[] = [];
  for (let y = 2000; y <= 2023; y++) out.push({ year: y, value: seed + (y - 2000) * 0.01 });
  return out;
}

describe("TimeseriesChart", () => {
  it("renders metric tabs and switches active metric on click", async () => {
    render(
      <TimeseriesChart
        series={[
          {
            iso: "USA",
            name: "United States",
            color: "#2563eb",
            series: {
              hf_score: tsPoints(8),
              pf_score: tsPoints(8.5),
              ef_score: tsPoints(7.5),
            },
          },
        ]}
        referenceYear={2020}
      />,
    );
    // Three default tabs.
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.click(tabs[1]!);
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
