import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { manifestFixture } from "../data/__fixtures__/manifest";
import { asIso3, type Iso3 } from "../data/types";
import { CountryPicker } from "./CountryPicker";

const realFetch = globalThis.fetch;

function ok<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("CountryPicker", () => {
  beforeEach(() => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(ok(manifestFixture)) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("filters matches by country name", async () => {
    const onAdd = vi.fn().mockReturnValue(true);
    render(
      <CountryPicker
        selected={[]}
        onAdd={onAdd}
        onRemove={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "ger" },
    });
    await waitFor(() => {
      expect(screen.getByRole("option")).toHaveTextContent(/germany/i);
    });
  });

  it("matches by ISO3 code", async () => {
    const onAdd = vi.fn().mockReturnValue(true);
    render(
      <CountryPicker
        selected={[]}
        onAdd={onAdd}
        onRemove={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "usa" },
    });
    await waitFor(() => {
      expect(screen.getByRole("option")).toHaveTextContent(/united states/i);
    });
  });

  it("calls onAdd with the chosen ISO3 and clears the query", async () => {
    const onAdd = vi.fn().mockReturnValue(true);
    render(
      <CountryPicker
        selected={[]}
        onAdd={onAdd}
        onRemove={() => {}}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "can" },
    });
    await waitFor(() => screen.getByRole("option"));
    fireEvent.click(screen.getByRole("option"));
    expect(onAdd).toHaveBeenCalledWith("CAN");
  });

  it("disables the input and hides results when limit is reached", async () => {
    const selected: Iso3[] = ["USA", "CAN", "DEU", "FRA", "GBR"].map((s) =>
      asIso3(s),
    );
    render(
      <CountryPicker
        selected={selected}
        onAdd={() => true}
        onRemove={() => {}}
        max={5}
      />,
    );
    expect(screen.getByRole("searchbox")).toBeDisabled();
  });

  it("renders a chip per selected country with a remove button", () => {
    const onRemove = vi.fn();
    render(
      <CountryPicker
        selected={[asIso3("USA")]}
        onAdd={() => true}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith("USA");
  });
});
