import { describe, expect, it } from "vitest";
import { COMPARE_PALETTE, colorForIso, paletteForIsos } from "./palette";

describe("palette", () => {
  it("colorForIso returns a value from the palette", () => {
    expect(COMPARE_PALETTE).toContain(colorForIso("USA"));
  });

  it("colorForIso is stable across calls", () => {
    expect(colorForIso("USA")).toBe(colorForIso("USA"));
    expect(colorForIso("USA")).toBe(colorForIso("usa"));
  });

  it("paletteForIsos assigns distinct colors when input order is rotated", () => {
    const isos = ["USA", "CAN", "GBR", "DEU", "FRA"];
    const a = paletteForIsos(isos);
    const b = paletteForIsos([...isos].reverse());
    // Each iso keeps its own color regardless of order.
    expect(a.get("USA")).toBe(b.get("USA"));
    expect(a.get("CAN")).toBe(b.get("CAN"));
    expect(new Set(a.values()).size).toBe(5);
    expect(new Set(b.values()).size).toBe(5);
  });

  it("paletteForIsos handles collisions by bumping to the next free slot", () => {
    const map = paletteForIsos(["USA", "CAN", "DEU"]);
    const colors = [...map.values()];
    expect(new Set(colors).size).toBe(colors.length);
  });
});
