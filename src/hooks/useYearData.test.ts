import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { yearDataFixture2023 } from "../data/__fixtures__/yearData";

async function loadHook() {
  vi.resetModules();
  const mod = await import("./useYearData");
  return mod.useYearData;
}

function okResponse<T>(payload: T) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("useYearData", () => {
  const realFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      okResponse(yearDataFixture2023),
    ) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it("loads the requested year file", async () => {
    const useYearData = await loadHook();
    const { result } = renderHook(() => useYearData(2023));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toEqual(yearDataFixture2023);
    expect(globalThis.fetch).toHaveBeenCalledWith("/data/years/2023.json");
  });

  it("dedupes parallel requests for the same year", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okResponse(yearDataFixture2023));
    globalThis.fetch = fetchSpy as typeof fetch;
    const useYearData = await loadHook();

    const a = renderHook(() => useYearData(2023));
    const b = renderHook(() => useYearData(2023));

    await waitFor(() => {
      expect(a.result.current.status).toBe("success");
      expect(b.result.current.status).toBe("success");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fetches different years independently", async () => {
    const fetchSpy = vi.fn().mockImplementation((url: string) =>
      Promise.resolve(okResponse({ url })),
    );
    globalThis.fetch = fetchSpy as typeof fetch;
    const useYearData = await loadHook();

    const a = renderHook(() => useYearData(2023));
    const b = renderHook(() => useYearData(2022));

    await waitFor(() => {
      expect(a.result.current.status).toBe("success");
      expect(b.result.current.status).toBe("success");
    });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenCalledWith("/data/years/2023.json");
    expect(fetchSpy).toHaveBeenCalledWith("/data/years/2022.json");
  });

  it("reports an error result on 404 with the URL in the message", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response("nope", { status: 404 })) as typeof fetch;
    const useYearData = await loadHook();
    const { result } = renderHook(() => useYearData(1999));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.message).toContain("/data/years/1999.json");
  });

  it("preserves the cached value across remount", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okResponse(yearDataFixture2023));
    globalThis.fetch = fetchSpy as typeof fetch;
    const useYearData = await loadHook();

    const first = renderHook(() => useYearData(2023));
    await waitFor(() => expect(first.result.current.status).toBe("success"));
    first.unmount();

    const second = renderHook(() => useYearData(2023));
    await waitFor(() => expect(second.result.current.status).toBe("success"));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
