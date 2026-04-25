import { useEffect, useState } from "react";
import type { AsyncResult, CountryManifestEntry } from "../data/types";

const MANIFEST_URL = "/data/index.json";

// Module-scope cache. Single in-flight Promise dedupes parallel callers and
// the resolved result is reused for the rest of the SPA session.
let inflight: Promise<CountryManifestEntry[]> | null = null;
let cached: CountryManifestEntry[] | null = null;

function loadManifest(): Promise<CountryManifestEntry[]> {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch(MANIFEST_URL)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to load manifest from ${MANIFEST_URL}: HTTP ${res.status}`,
        );
      }
      const json = (await res.json()) as CountryManifestEntry[];
      cached = json;
      return json;
    })
    .catch((err: unknown) => {
      // Allow a retry after failure by clearing the inflight slot.
      inflight = null;
      throw err instanceof Error
        ? err
        : new Error(`Failed to load manifest from ${MANIFEST_URL}`);
    });
  return inflight;
}

/**
 * Loads the country manifest (`iso`, `country`, `region`) once per session.
 * Cached in module scope; survives unmount/remount.
 */
export function useManifest(): AsyncResult<CountryManifestEntry[]> {
  const [state, setState] = useState<AsyncResult<CountryManifestEntry[]>>(() =>
    cached ? { status: "success", data: cached } : { status: "loading" },
  );

  useEffect(() => {
    if (cached) return;
    let active = true;
    loadManifest().then(
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
  }, []);

  return state;
}
