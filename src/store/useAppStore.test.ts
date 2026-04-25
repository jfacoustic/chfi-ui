import { beforeEach, describe, expect, it } from "vitest";
import { asIso3 } from "../data/types";
import { useAppStore } from "./useAppStore";

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it("has the documented defaults", () => {
    const s = useAppStore.getState();
    expect(s.year).toBe(2023);
    expect(s.metric).toBe("hf_score");
    expect(s.region).toBe("all");
    expect(s.comparedIsos).toEqual([]);
  });

  it("setYear clamps to [MIN_YEAR, MAX_YEAR]", () => {
    useAppStore.getState().setYear(1999);
    expect(useAppStore.getState().year).toBe(2000);
    useAppStore.getState().setYear(9999);
    expect(useAppStore.getState().year).toBe(2023);
    useAppStore.getState().setYear(2010);
    expect(useAppStore.getState().year).toBe(2010);
  });

  it("setMetric updates the metric", () => {
    useAppStore.getState().setMetric("pf_score");
    expect(useAppStore.getState().metric).toBe("pf_score");
  });

  it("setRegion updates the region", () => {
    useAppStore.getState().setRegion("Western Europe");
    expect(useAppStore.getState().region).toBe("Western Europe");
    useAppStore.getState().setRegion("all");
    expect(useAppStore.getState().region).toBe("all");
  });

  it("addCompared appends and dedupes up to 5", () => {
    const { addCompared } = useAppStore.getState();
    expect(addCompared(asIso3("USA"))).toBe(true);
    expect(addCompared(asIso3("CAN"))).toBe(true);
    expect(addCompared(asIso3("USA"))).toBe(false); // duplicate
    expect(useAppStore.getState().comparedIsos).toEqual(["USA", "CAN"]);
  });

  it("addCompared returns false when already at 5 entries", () => {
    const { addCompared } = useAppStore.getState();
    ["USA", "CAN", "DEU", "FRA", "GBR"].forEach((c) =>
      addCompared(asIso3(c)),
    );
    expect(useAppStore.getState().comparedIsos).toHaveLength(5);
    expect(addCompared(asIso3("ITA"))).toBe(false);
    expect(useAppStore.getState().comparedIsos).toHaveLength(5);
  });

  it("removeCompared deletes the iso", () => {
    const { addCompared, removeCompared } = useAppStore.getState();
    addCompared(asIso3("USA"));
    addCompared(asIso3("CAN"));
    removeCompared(asIso3("USA"));
    expect(useAppStore.getState().comparedIsos).toEqual(["CAN"]);
  });

  it("clearCompared empties the list", () => {
    const { addCompared, clearCompared } = useAppStore.getState();
    addCompared(asIso3("USA"));
    addCompared(asIso3("CAN"));
    clearCompared();
    expect(useAppStore.getState().comparedIsos).toEqual([]);
  });

  it("setComparedFromList caps at 5 and uppercases", () => {
    const { setComparedFromList } = useAppStore.getState();
    setComparedFromList(
      ["usa", "can", "deu", "fra", "gbr", "ita"].map((s) => asIso3(s)),
    );
    expect(useAppStore.getState().comparedIsos).toEqual([
      "USA",
      "CAN",
      "DEU",
      "FRA",
      "GBR",
    ]);
  });
});
