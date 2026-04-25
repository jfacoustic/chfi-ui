import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("mounts the router and renders the home page", () => {
    render(<App />);
    // Home page heading from the heat-map placeholder/feature.
    expect(
      screen.getByRole("heading", { name: /heat map/i }),
    ).toBeInTheDocument();
  });
});
