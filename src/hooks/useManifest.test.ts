import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { manifestFixture } from "../data/__fixtures__/manifest";

// Each test gets a fresh module so the in-memory cache resets.
async function loadHook() {
  vi.resetModules();
  const mod = await import("./useManifest");
  return mod.useManifest;
}

function mockFetchOk<T>(payload: T) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

describe("useManifest", () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mockFetchOk(manifestFixture) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("loads the manifest and resolves to success", async () => {
    const useManifest = await loadHook();
    const { result } = renderHook(() => useManifest());

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual(manifestFixture);
  });

  it("issues a single network request even when called from multiple consumers", async () => {
    const fetchSpy = mockFetchOk(manifestFixture);
    globalThis.fetch = fetchSpy as typeof fetch;
    const useManifest = await loadHook();

    const a = renderHook(() => useManifest());
    const b = renderHook(() => useManifest());

    await waitFor(() => {
      expect(a.result.current.status).toBe("success");
      expect(b.result.current.status).toBe("success");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith("/data/index.json");
  });

  it("returns an error result when the manifest is missing", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response("not found", { status: 404 }),
    ) as typeof fetch;
    const useManifest = await loadHook();
    const { result } = renderHook(() => useManifest());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.message).toContain("/data/index.json");
  });
});
