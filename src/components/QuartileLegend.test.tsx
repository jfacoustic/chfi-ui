import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuartileLegend } from "./QuartileLegend";

describe("QuartileLegend", () => {
  it("renders 5 swatches: Q1-Q4 plus No data", () => {
    render(<QuartileLegend />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Q4")).toBeInTheDocument();
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});
