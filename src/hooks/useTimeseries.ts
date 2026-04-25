import { useEffect, useState } from "react";
import type { AsyncResult, CountryTimeseries, Iso3 } from "../data/types";

const isoUrl = (iso: string) => `/data/timeseries/${iso}.json`;

const cache = new Map<string, CountryTimeseries>();
const inflight = new Map<string, Promise<CountryTimeseries>>();

function loadTimeseries(iso: string): Promise<CountryTimeseries> {
  const hit = cache.get(iso);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(iso);
  if (pending) return pending;
  const url = isoUrl(iso);
  const p = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to load timeseries from ${url}: HTTP ${res.status}`,
        );
      }
      const json = (await res.json()) as CountryTimeseries;
      cache.set(iso, json);
      return json;
    })
    .catch((err: unknown) => {
      throw err instanceof Error
        ? err
        : new Error(`Failed to load timeseries from ${url}`);
    })
    .finally(() => {
      inflight.delete(iso);
    });
  inflight.set(iso, p);
  return p;
}

function initialState(key: string): AsyncResult<CountryTimeseries> {
  const hit = cache.get(key);
  return hit ? { status: "success", data: hit } : { status: "loading" };
}

/**
 * Loads the per-country timeseries (24 points per metric, 2000-2023).
 * Normalizes the ISO key to uppercase to match the on-disk filenames.
 */
export function useTimeseries(iso: Iso3): AsyncResult<CountryTimeseries> {
  const key = iso.toUpperCase();
  const [trackedKey, setTrackedKey] = useState(key);
  const [state, setState] = useState<AsyncResult<CountryTimeseries>>(() =>
    initialState(key),
  );

  // Recompute synchronously when the ISO changes so cache hits don't bounce
  // through a loading state in an effect.
  let current = state;
  if (key !== trackedKey) {
    current = initialState(key);
    setTrackedKey(key);
    setState(current);
  }

  useEffect(() => {
    if (cache.has(key)) return;
    let active = true;
    loadTimeseries(key).then(
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
  }, [key]);

  return current;
}
