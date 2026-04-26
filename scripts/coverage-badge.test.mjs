import { describe, it, expect } from "vitest";
import { pickColor, renderBadge, formatPct } from "./coverage-badge.mjs";

describe("pickColor", () => {
  it("returns brightgreen at or above 90%", () => {
    expect(pickColor(100)).toBe("#4c1");
    expect(pickColor(90)).toBe("#4c1");
  });

  it("returns green between 80% and 90%", () => {
    expect(pickColor(89.999)).toBe("#97CA00");
    expect(pickColor(80)).toBe("#97CA00");
  });

  it("returns yellowgreen between 70% and 80%", () => {
    expect(pickColor(79.5)).toBe("#a4a61d");
    expect(pickColor(70)).toBe("#a4a61d");
  });

  it("returns yellow between 60% and 70%", () => {
    expect(pickColor(69)).toBe("#dfb317");
    expect(pickColor(60)).toBe("#dfb317");
  });

  it("returns orange between 50% and 60%", () => {
    expect(pickColor(59)).toBe("#fe7d37");
    expect(pickColor(50)).toBe("#fe7d37");
  });

  it("returns red below 50%", () => {
    expect(pickColor(49.9)).toBe("#e05d44");
    expect(pickColor(0)).toBe("#e05d44");
  });
});

describe("formatPct", () => {
  it("rounds to a single decimal and appends %", () => {
    expect(formatPct(87.654)).toBe("87.7%");
    expect(formatPct(100)).toBe("100%");
    expect(formatPct(0)).toBe("0%");
  });

  it("drops trailing zero decimals", () => {
    expect(formatPct(80.0)).toBe("80%");
    expect(formatPct(80.05)).toBe("80.1%");
  });
});

describe("renderBadge", () => {
  it("returns an SVG string with the label, value, and color", () => {
    const svg = renderBadge({ label: "coverage", value: "87.7%", color: "#97CA00" });
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("coverage");
    expect(svg).toContain("87.7%");
    expect(svg).toContain("#97CA00");
    expect(svg).toMatch(/<\/svg>$/);
  });
});
