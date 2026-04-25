import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { YearRecord } from "../data/types";
import { HeatMap } from "./HeatMap";
import { topoTiny } from "./__fixtures__/topo-tiny";

function rec(
  iso: string,
  country: string,
  region: YearRecord["region"],
  hf_score: number | null,
  hf_quartile: number | null,
  hf_rank: number | null,
): YearRecord {
  return {
    iso,
    country,
    region,
    year: 2023,
    hf_score,
    hf_rank,
    hf_quartile,
    pf_score: hf_score,
    pf_rank: null,
    ef_score: null,
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

const RECORDS: YearRecord[] = [
  rec("USA", "United States", "North America", 8.7, 1, 17),
  rec("CAN", "Canada", "North America", 8.85, 1, 12),
  rec("DEU", "Germany", "Western Europe", 8.5, 2, 25),
];

describe("HeatMap", () => {
  it("renders one path per country with a fill from the quartile palette", () => {
    const { container } = render(
      <HeatMap
        records={RECORDS}
        metric="hf_score"
        region="all"
        onSelect={() => {}}
        geography={topoTiny as unknown as object}
      />,
    );
    const paths = container.querySelectorAll("path[data-iso]");
    expect(paths.length).toBe(3);
    paths.forEach((p) => {
      const iso = p.getAttribute("data-iso");
      expect(["USA", "CAN", "DEU"]).toContain(iso);
    });
  });

  it("dims countries that don't match the active region", () => {
    const { container } = render(
      <HeatMap
        records={RECORDS}
        metric="hf_score"
        region="Western Europe"
        onSelect={() => {}}
        geography={topoTiny as unknown as object}
      />,
    );
    const usa = container.querySelector('path[data-iso="USA"]') as SVGPathElement;
    const deu = container.querySelector('path[data-iso="DEU"]') as SVGPathElement;
    expect(usa.style.opacity).toBe("0.25");
    expect(deu.style.opacity).toBe("1");
  });

  it("shows a tooltip on hover with the country and rank", async () => {
    const { container } = render(
      <HeatMap
        records={RECORDS}
        metric="hf_score"
        region="all"
        onSelect={() => {}}
        geography={topoTiny as unknown as object}
      />,
    );
    const usa = container.querySelector('path[data-iso="USA"]') as SVGPathElement;
    fireEvent.mouseEnter(usa, { clientX: 10, clientY: 10 });
    expect(await screen.findByRole("tooltip")).toHaveTextContent("United States");
    expect(screen.getByRole("tooltip")).toHaveTextContent("17");
  });

  it("calls onSelect with the ISO3 when a country is clicked", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <HeatMap
        records={RECORDS}
        metric="hf_score"
        region="all"
        onSelect={onSelect}
        geography={topoTiny as unknown as object}
      />,
    );
    const can = container.querySelector('path[data-iso="CAN"]') as SVGPathElement;
    fireEvent.click(can);
    expect(onSelect).toHaveBeenCalledWith("CAN");
  });
});
