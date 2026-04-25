import { useEffect, useState } from "react";
import type { AsyncResult, YearRecord } from "../data/types";

const yearUrl = (year: number) => `/data/years/${year}.json`;

// One cache entry per year; one in-flight Promise per year for dedupe.
const cache = new Map<number, YearRecord[]>();
const inflight = new Map<number, Promise<YearRecord[]>>();

function loadYear(year: number): Promise<YearRecord[]> {
  const hit = cache.get(year);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(year);
  if (pending) return pending;
  const url = yearUrl(year);
  const p = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to load year data from ${url}: HTTP ${res.status}`,
        );
      }
      const json = (await res.json()) as YearRecord[];
      cache.set(year, json);
      return json;
    })
    .catch((err: unknown) => {
      throw err instanceof Error
        ? err
        : new Error(`Failed to load year data from ${url}`);
    })
    .finally(() => {
      inflight.delete(year);
    });
  inflight.set(year, p);
  return p;
}

function initialState(year: number): AsyncResult<YearRecord[]> {
  const hit = cache.get(year);
  return hit ? { status: "success", data: hit } : { status: "loading" };
}

/**
 * Loads the trimmed records for a given year. Caches per-year so all callers
 * share a single network request and the data is reused across renders.
 */
export function useYearData(year: number): AsyncResult<YearRecord[]> {
  const [trackedYear, setTrackedYear] = useState(year);
  const [state, setState] = useState<AsyncResult<YearRecord[]>>(() =>
    initialState(year),
  );

  // Recompute synchronously during render when the requested year changes.
  // Avoids the cascading-render warning from setState-in-effect.
  let current = state;
  if (year !== trackedYear) {
    current = initialState(year);
    setTrackedYear(year);
    setState(current);
  }

  useEffect(() => {
    if (cache.has(year)) return;
    let active = true;
    loadYear(year).then(
      (data) => {
        if (active) setState({ status: "success", data });
      },
      (error: Error) => {
        if (active) setState({ status: "error", error });
      },
    );
    return () => {
      active = false;
    };
  }, [year]);

  return current;
}
