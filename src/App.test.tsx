import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("mounts the shell with the report title and home page heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", {
        name: /2025 Human Freedom Index Report \(2023 data\)/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /heat map/i }),
    ).toBeInTheDocument();
  });
});
