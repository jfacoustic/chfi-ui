import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CountryHeader } from "./CountryHeader";

describe("CountryHeader", () => {
  it("renders flag, name, region, and ISO", () => {
    render(
      <MemoryRouter>
        <CountryHeader iso="USA" name="United States" region="North America" />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /united states/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("North America")).toBeInTheDocument();
    expect(screen.getByText("USA")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /USA flag/i })).toBeInTheDocument();
  });

  it("renders the back link with provided label", () => {
    render(
      <MemoryRouter>
        <CountryHeader
          iso="USA"
          name="United States"
          region="North America"
          backTo="/countries"
          backLabel="Back to list"
        />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /back to list/i });
    expect(link).toHaveAttribute("href", "/countries");
  });
});
