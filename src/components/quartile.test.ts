import { describe, expect, it } from "vitest";
import {
  getQuartileColor,
  getQuartileFill,
  getQuartileLabel,
} from "./quartile";

describe("quartile helpers", () => {
  it("maps each quartile to a unique tailwind class", () => {
    const classes = [
      getQuartileColor(1),
      getQuartileColor(2),
      getQuartileColor(3),
      getQuartileColor(4),
      getQuartileColor(null),
    ];
    expect(new Set(classes).size).toBe(5);
    expect(classes[0]).toMatch(/emerald/);
    expect(classes[3]).toMatch(/red/);
    expect(classes[4]).toMatch(/gray/);
  });

  it("maps each quartile to a unique hex fill", () => {
    const fills = [1, 2, 3, 4, null].map((q) =>
      getQuartileFill(q as 1 | 2 | 3 | 4 | null),
    );
    expect(new Set(fills).size).toBe(5);
  });

  it("labels the quartile or 'No data' for null", () => {
    expect(getQuartileLabel(1)).toBe("Q1");
    expect(getQuartileLabel(4)).toBe("Q4");
    expect(getQuartileLabel(null)).toBe("No data");
  });
});
