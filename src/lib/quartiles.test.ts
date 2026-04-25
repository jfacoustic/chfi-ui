import { describe, expect, it } from "vitest";
import type { YearRecord } from "../data/types";
import { computeQuartiles } from "./quartiles";

function rec(iso: string, value: number | null, quartile: number | null = null): YearRecord {
  return {
    iso,
    country: iso,
    region: "Western Europe",
    year: 2023,
    hf_score: value,
    hf_rank: null,
    hf_quartile: quartile,
    pf_score: value,
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

describe("computeQuartiles", () => {
  it("uses hf_quartile directly for hf_score", () => {
    const data = [
      rec("A", 9, 1),
      rec("B", 7, 2),
      rec("C", 5, 3),
      rec("D", null, null),
    ];
    const q = computeQuartiles(data, "hf_score");
    expect(q.get("A")).toBe(1);
    expect(q.get("B")).toBe(2);
    expect(q.get("C")).toBe(3);
    expect(q.get("D")).toBe(null);
  });

  it("buckets pf_score by descending rank into quartiles", () => {
    const data = [
      rec("A", 10),
      rec("B", 9),
      rec("C", 8),
      rec("D", 7),
      rec("E", 6),
      rec("F", 5),
      rec("G", 4),
      rec("H", 3),
    ];
    const q = computeQuartiles(data, "pf_score");
    expect(q.get("A")).toBe(1);
    expect(q.get("B")).toBe(1);
    expect(q.get("C")).toBe(2);
    expect(q.get("D")).toBe(2);
    expect(q.get("E")).toBe(3);
    expect(q.get("F")).toBe(3);
    expect(q.get("G")).toBe(4);
    expect(q.get("H")).toBe(4);
  });

  it("returns null quartile for records with null metric value", () => {
    const data = [rec("A", 10), rec("B", null), rec("C", 5)];
    const q = computeQuartiles(data, "pf_score");
    expect(q.get("B")).toBe(null);
  });
});
