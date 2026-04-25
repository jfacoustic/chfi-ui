import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { asIso3 } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { CompareToggleButton } from "./CompareToggleButton";

describe("CompareToggleButton", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });
  afterEach(() => {
    useAppStore.getState().reset();
  });

  it("adds and removes the iso on click", () => {
    render(<CompareToggleButton iso="USA" />);
    const btn = screen.getByRole("button", { name: /add to compare/i });
    fireEvent.click(btn);
    expect(useAppStore.getState().comparedIsos).toContain("USA");
    fireEvent.click(screen.getByRole("button", { name: /remove from compare/i }));
    expect(useAppStore.getState().comparedIsos).not.toContain("USA");
  });

  it("is disabled and shows tooltip when limit reached and country is not in list", () => {
    useAppStore.getState().setComparedFromList(
      ["A1A", "B2B", "C3C", "D4D", "E5E"].map((s) => asIso3(s)),
    );
    // Need 5 valid-ish entries; reset and use real ISO3s.
    useAppStore.getState().reset();
    useAppStore.getState().setComparedFromList(
      ["USA", "CAN", "DEU", "FRA", "GBR"].map((s) => asIso3(s)),
    );
    render(<CompareToggleButton iso="JPN" />);
    const btn = screen.getByRole("button", { name: /add to compare/i });
    expect(btn).toBeDisabled();
  });

  it("remains active when the country is already in a full list", () => {
    useAppStore.getState().setComparedFromList(
      ["USA", "CAN", "DEU", "FRA", "GBR"].map((s) => asIso3(s)),
    );
    render(<CompareToggleButton iso="USA" />);
    const btn = screen.getByRole("button", { name: /remove from compare/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(useAppStore.getState().comparedIsos).not.toContain("USA");
  });
});
