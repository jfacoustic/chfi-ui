import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CountriesToolbar } from "./CountriesToolbar";

describe("CountriesToolbar", () => {
  it("emits onQueryChange immediately on input", () => {
    const onQueryChange = vi.fn();
    render(
      <CountriesToolbar
        year={2023}
        onYearChange={() => {}}
        region="all"
        onRegionChange={() => {}}
        query=""
        onQueryChange={onQueryChange}
      />,
    );
    const input = screen.getByRole("searchbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "canada" } });
    expect(onQueryChange).toHaveBeenCalledWith("canada");
  });

  it("emits onYearChange when the dropdown changes", () => {
    const onYearChange = vi.fn();
    render(
      <CountriesToolbar
        year={2023}
        onYearChange={onYearChange}
        region="all"
        onRegionChange={() => {}}
        query=""
        onQueryChange={() => {}}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "2010" },
    });
    expect(onYearChange).toHaveBeenCalledWith(2010);
  });

  it("emits onRegionChange when a region chip is clicked", () => {
    const onRegionChange = vi.fn();
    render(
      <CountriesToolbar
        year={2023}
        onYearChange={() => {}}
        region="all"
        onRegionChange={onRegionChange}
        query=""
        onQueryChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /North America/i }));
    expect(onRegionChange).toHaveBeenCalledWith("North America");
  });
});
