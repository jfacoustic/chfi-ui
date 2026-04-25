import { describe, it, expect } from "vitest";
import {
  transpose,
  validate,
  trimYearRecord,
  buildIndex,
  buildTimeseries,
  TRIMMED_FIELDS,
  TIMESERIES_METRICS,
} from "./transform.mjs";

/**
 * Build a tiny column-oriented fixture mimicking the Pandas to_json default
 * shape: { col: { "0": v, "1": v, ... } }.
 */
function makeFixture(rows) {
  const out = {};
  rows.forEach((row, i) => {
    for (const [k, v] of Object.entries(row)) {
      if (!out[k]) out[k] = {};
      out[k][String(i)] = v;
    }
  });
  return out;
}

const baseRow = (overrides = {}) => ({
  year: 2023,
  iso: "AAA",
  countries: "Aaaland",
  region: "Test Region",
  hf_score: 7.5,
  hf_rank: 10,
  hf_quartile: 1,
  pf_score: 7.0,
  pf_rank: 12,
  ef_score: 8.0,
  ef_rank: 9,
  pf_rol: 6.5,
  pf_ss: 7.1,
  pf_movement: 8.2,
  pf_religion: 9.0,
  pf_assembly: 8.5,
  pf_expression: 7.7,
  pf_identity: 8.8,
  ef_government: 7.4,
  ef_legal: 6.9,
  ef_money: 9.2,
  ef_trade: 8.0,
  ef_regulation: 7.6,
  ...overrides,
});

describe("transpose", () => {
  it("converts column-oriented input into row records", () => {
    const fixture = makeFixture([
      { year: 2022, iso: "AAA", countries: "Aaaland", hf_score: 7.5 },
      { year: 2023, iso: "AAA", countries: "Aaaland", hf_score: 7.6 },
      { year: 2022, iso: "BBB", countries: "Bblandia", hf_score: 6.0 },
    ]);
    const rows = transpose(fixture);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      year: 2022,
      iso: "AAA",
      countries: "Aaaland",
      hf_score: 7.5,
    });
    expect(rows[2].iso).toBe("BBB");
  });

  it("preserves null values rather than coercing them", () => {
    const fixture = makeFixture([
      { year: 2023, iso: "AAA", countries: "Aaaland", hf_score: null },
    ]);
    const rows = transpose(fixture);
    expect(rows[0].hf_score).toBeNull();
  });
});

describe("validate", () => {
  it("throws a clear error when the iso column is missing", () => {
    const fixture = makeFixture([
      { year: 2023, countries: "Aaaland", hf_score: 7.5 },
    ]);
    const rows = transpose(fixture);
    expect(() => validate(rows)).toThrow(/iso/i);
  });

  it("throws when row count is unexpected", () => {
    const rows = [baseRow()];
    expect(() => validate(rows, { expectedRows: 3960 })).toThrow(/3960/);
  });

  it("passes for a well-formed dataset", () => {
    const rows = [baseRow()];
    expect(() =>
      validate(rows, { expectedRows: 1, expectedYears: [2023] })
    ).not.toThrow();
  });
});

describe("trimYearRecord", () => {
  it("keeps only whitelisted fields and renames `countries` to `country`", () => {
    const raw = baseRow({
      pf_rol_procedural: 0.5,
      pf_ss_homicide: 9.9,
      ef_regulation_business: 7.0,
    });
    const trimmed = trimYearRecord(raw);
    expect(trimmed).not.toHaveProperty("countries");
    expect(trimmed).not.toHaveProperty("pf_rol_procedural");
    expect(trimmed).not.toHaveProperty("pf_ss_homicide");
    expect(trimmed).not.toHaveProperty("ef_regulation_business");
    expect(trimmed.country).toBe("Aaaland");
    // All trimmed fields present (possibly null).
    for (const f of TRIMMED_FIELDS) {
      expect(trimmed).toHaveProperty(f);
    }
    expect(Object.keys(trimmed)).toHaveLength(TRIMMED_FIELDS.length);
  });

  it("preserves null in trimmed output", () => {
    const trimmed = trimYearRecord(baseRow({ hf_score: null, pf_rol: null }));
    expect(trimmed.hf_score).toBeNull();
    expect(trimmed.pf_rol).toBeNull();
  });
});

describe("buildIndex", () => {
  it("returns one entry per ISO sorted by country name", () => {
    const rows = [
      baseRow({ iso: "BBB", countries: "Bblandia", region: "R1", year: 2022 }),
      baseRow({ iso: "BBB", countries: "Bblandia", region: "R1", year: 2023 }),
      baseRow({ iso: "AAA", countries: "Aaaland", region: "R2", year: 2023 }),
    ];
    const index = buildIndex(rows);
    expect(index).toEqual([
      { iso: "AAA", country: "Aaaland", region: "R2" },
      { iso: "BBB", country: "Bblandia", region: "R1" },
    ]);
  });
});

describe("buildTimeseries", () => {
  it("groups by ISO and emits one entry per year for each metric", () => {
    const rows = [
      baseRow({ iso: "AAA", year: 2022, hf_score: 7.0, pf_rol: 6.0 }),
      baseRow({ iso: "AAA", year: 2023, hf_score: 7.5, pf_rol: 6.5 }),
      baseRow({ iso: "BBB", countries: "Bblandia", year: 2023, hf_score: 5.0 }),
    ];
    const ts = buildTimeseries(rows);
    expect(Object.keys(ts).sort()).toEqual(["AAA", "BBB"]);
    expect(ts.AAA.iso).toBe("AAA");
    expect(ts.AAA.country).toBe("Aaaland");
    expect(ts.AAA.region).toBe("Test Region");
    // Sorted by year ascending.
    expect(ts.AAA.series.hf_score).toEqual([
      { year: 2022, value: 7.0 },
      { year: 2023, value: 7.5 },
    ]);
    expect(ts.AAA.series.pf_rol).toEqual([
      { year: 2022, value: 6.0 },
      { year: 2023, value: 6.5 },
    ]);
    // All declared timeseries metrics exist.
    for (const m of TIMESERIES_METRICS) {
      expect(ts.AAA.series).toHaveProperty(m);
    }
  });

  it("preserves null entries in series", () => {
    const rows = [
      baseRow({ iso: "AAA", year: 2022, hf_score: null }),
      baseRow({ iso: "AAA", year: 2023, hf_score: 7.5 }),
    ];
    const ts = buildTimeseries(rows);
    expect(ts.AAA.series.hf_score).toEqual([
      { year: 2022, value: null },
      { year: 2023, value: 7.5 },
    ]);
  });
});
