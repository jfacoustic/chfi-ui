import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeseriesFixtureUSA } from "../data/__fixtures__/timeseries";
import { asIso3 } from "../data/types";

async function loadHook() {
  vi.resetModules();
  const mod = await import("./useTimeseries");
  return mod.useTimeseries;
}

function okResponse<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useTimeseries", () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse(timeseriesFixtureUSA),
    ) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("loads the requested ISO timeseries", async () => {
    const useTimeseries = await loadHook();
    const { result } = renderHook(() => useTimeseries(asIso3("USA")));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual(timeseriesFixtureUSA);
    expect(globalThis.fetch).toHaveBeenCalledWith("/data/timeseries/USA.json");
  });

  it("dedupes parallel requests for the same ISO", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okResponse(timeseriesFixtureUSA));
    globalThis.fetch = fetchSpy as typeof fetch;
    const useTimeseries = await loadHook();

    const a = renderHook(() => useTimeseries(asIso3("USA")));
    const b = renderHook(() => useTimeseries(asIso3("USA")));

    await waitFor(() => {
      expect(a.result.current.status).toBe("success");
      expect(b.result.current.status).toBe("success");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("uppercases ISO codes in the URL", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okResponse(timeseriesFixtureUSA));
    globalThis.fetch = fetchSpy as typeof fetch;
    const useTimeseries = await loadHook();

    const { result } = renderHook(() => useTimeseries(asIso3("usa")));
    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(fetchSpy).toHaveBeenCalledWith("/data/timeseries/USA.json");
  });

  it("reports an error result on 404 with the URL in the message", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response("nope", { status: 404 })) as typeof fetch;
    const useTimeseries = await loadHook();
    const { result } = renderHook(() => useTimeseries(asIso3("ZZZ")));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.message).toContain("/data/timeseries/ZZZ.json");
  });
});
