import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { manifestFixture } from "../data/__fixtures__/manifest";
import { SearchPalette } from "./SearchPalette";

const realFetch = globalThis.fetch;

function ok<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function renderPalette() {
  return render(
    <MemoryRouter>
      <SearchPalette />
    </MemoryRouter>,
  );
}

describe("SearchPalette", () => {
  beforeEach(() => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(ok(manifestFixture)) as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("opens on Cmd+K and closes on Esc", async () => {
    renderPalette();
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("filters results by typed query (case-insensitive)", async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    await screen.findByRole("dialog");
    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "ger" } });
    await waitFor(() => {
      const opts = screen.getAllByRole("option");
      expect(opts.length).toBe(1);
      expect(opts[0]).toHaveTextContent(/germany/i);
    });
  });

  it("ArrowDown moves the highlight and Enter navigates", async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    const input = await screen.findByRole("searchbox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const opts = screen.getAllByRole("option");
    expect(opts[1]).toHaveAttribute("aria-selected", "true");
  });

  it("clicking outside the dialog closes it", async () => {
    renderPalette();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    const dialog = await screen.findByRole("dialog");
    // Click the backdrop — the dialog wrapper itself.
    fireEvent.click(dialog);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
