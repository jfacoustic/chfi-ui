import { describe, expect, it } from "vitest";
import {
  ALL_METRICS,
  DEFAULT_YEAR,
  EF_CATEGORIES,
  MAX_YEAR,
  MIN_YEAR,
  PF_CATEGORIES,
  asIso3,
  type MetricKey,
} from "./types";

describe("data/types", () => {
  it("exposes the expected year range", () => {
    expect(MIN_YEAR).toBe(2000);
    expect(MAX_YEAR).toBe(2023);
    expect(DEFAULT_YEAR).toBe(2023);
  });

  it("exposes 7 PF categories and 5 EF categories", () => {
    expect(PF_CATEGORIES).toHaveLength(7);
    expect(EF_CATEGORIES).toHaveLength(5);
  });

  it("ALL_METRICS contains 15 metrics (3 scores + 7 PF + 5 EF)", () => {
    expect(ALL_METRICS).toHaveLength(15);
    expect(new Set(ALL_METRICS).size).toBe(15);
  });

  it("MetricKey is exhaustive across hf/pf/ef scores and category subkeys", () => {
    // Compile-time exhaustiveness check: removing a case must break the build.
    const label = (m: MetricKey): string => {
      switch (m) {
        case "hf_score":
        case "pf_score":
        case "ef_score":
          return "score";
        case "pf_rol":
        case "pf_ss":
        case "pf_movement":
        case "pf_religion":
        case "pf_assembly":
        case "pf_expression":
        case "pf_identity":
          return "pf";
        case "ef_government":
        case "ef_legal":
        case "ef_money":
        case "ef_trade":
        case "ef_regulation":
          return "ef";
        default: {
          const _exhaustive: never = m;
          return _exhaustive;
        }
      }
    };
    for (const m of ALL_METRICS) {
      expect(label(m)).toMatch(/^(score|pf|ef)$/);
    }
  });

  it("asIso3 brands a string without changing its value", () => {
    const iso = asIso3("USA");
    expect(iso).toBe("USA");
  });
});
