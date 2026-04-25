import { useEffect, useState } from "react";
import {
  asIso3,
  type AsyncResult,
  type CountryTimeseries,
  type Iso3,
} from "../data/types";

const cache = new Map<string, CountryTimeseries>();
const inflight = new Map<string, Promise<CountryTimeseries>>();

const url = (iso: string) => `/data/timeseries/${iso}.json`;

function load(iso: string): Promise<CountryTimeseries> {
  const hit = cache.get(iso);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(iso);
  if (pending) return pending;
  const p = fetch(url(iso))
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to load timeseries from ${url(iso)}: HTTP ${res.status}`,
        );
      }
      const json = (await res.json()) as CountryTimeseries;
      cache.set(iso, json);
      return json;
    })
    .finally(() => {
      inflight.delete(iso);
    });
  inflight.set(iso, p);
  return p;
}

function initialState(
  isos: readonly Iso3[],
): AsyncResult<CountryTimeseries[]> {
  if (isos.length === 0) return { status: "success", data: [] };
  const cached = isos.map((i) => cache.get(i.toUpperCase()));
  if (cached.every((v): v is CountryTimeseries => !!v)) {
    return { status: "success", data: cached };
  }
  return { status: "loading" };
}

/**
 * Loads timeseries for many ISO3 codes in parallel. Shares the module-scope
 * cache with `useTimeseries(iso)` so duplicate fetches across the two hooks
 * are deduplicated.
 */
export function useTimeseriesMany(
  isos: readonly Iso3[],
): AsyncResult<CountryTimeseries[]> {
  const key = isos.map((i) => i.toUpperCase()).join(",");
  const [trackedKey, setTrackedKey] = useState(key);
  const [state, setState] = useState<AsyncResult<CountryTimeseries[]>>(() =>
    initialState(isos),
  );

  // Synchronously reset state when the key changes so we don't have a
  // setState-in-effect warning for cache hits.
  let current = state;
  if (key !== trackedKey) {
    current = initialState(isos);
    setTrackedKey(key);
    setState(current);
  }

  useEffect(() => {
    if (isos.length === 0) return;
    const cached = isos.map((i) => cache.get(i.toUpperCase()));
    if (cached.every((v): v is CountryTimeseries => !!v)) return;
    let active = true;
    Promise.all(isos.map((i) => load(asIso3(i.toUpperCase())))).then(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return current;
}
