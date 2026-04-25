import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { KNOWN_ISO3 } from "../data/iso3-set";
import {
  ALL_METRICS,
  asIso3,
  type MetricKey,
  type Region,
} from "../data/types";
import { useAppStore, type RegionFilterValue } from "../store/useAppStore";

const REGIONS: readonly Region[] = [
  "North America",
  "Caucasus & Central Asia",
  "East Asia",
  "South Asia",
  "Oceania",
  "Latin America & the Caribbean",
  "Western Europe",
  "Eastern Europe",
  "Sub-Saharan Africa",
  "Middle East & North Africa",
];

const METRIC_SET = new Set<string>(ALL_METRICS);
const REGION_SET = new Set<string>(REGIONS);

const isMetric = (s: string | null): s is MetricKey =>
  !!s && METRIC_SET.has(s);
const isRegion = (s: string | null): s is RegionFilterValue =>
  s === "all" || (s !== null && REGION_SET.has(s));

// Note: only ISO3 codes present in the dataset are accepted. The set is
// generated from the manifest so URL hydration is synchronous (no network).

export interface UrlSyncConfig {
  year?: boolean;
  metric?: boolean;
  region?: boolean;
  iso?: boolean;
}

/**
 * Bidirectional sync between the Zustand store and `useSearchParams`.
 *
 * - On mount: URL is the source of truth — hydrates the store, ignoring
 *   invalid values silently.
 * - After mount: store changes write to URL with `replace: true` so the
 *   user's history doesn't fill up while sliding/typing.
 *
 * Pass a config of which params this route owns; everything else is
 * untouched on both read and write.
 */
export function useUrlSync(config: UrlSyncConfig): void {
  const [searchParams, setSearchParams] = useSearchParams();

  // One-shot hydration from URL → store. Lazy state initializer runs exactly
  // once per mount and is allowed to perform side effects (mutating the
  // global store), avoiding the "ref/setState during render" lint warnings.
  useState(() => {
    const s = useAppStore.getState();
    if (config.year) {
      const raw = searchParams.get("year");
      if (raw !== null) {
        const n = Number(raw);
        if (Number.isFinite(n) && n >= 2000 && n <= 2023) s.setYear(n);
      }
    }
    if (config.metric) {
      const raw = searchParams.get("metric");
      if (isMetric(raw)) s.setMetric(raw);
    }
    if (config.region) {
      const raw = searchParams.get("region");
      if (isRegion(raw)) s.setRegion(raw);
    }
    if (config.iso) {
      const raw = searchParams.get("iso");
      if (raw !== null) {
        const list = raw
          .split(",")
          .map((p) => p.trim().toUpperCase())
          .filter((p) => KNOWN_ISO3.has(p))
          .map((p) => asIso3(p));
        s.setComparedFromList(list);
      }
    }
    return true;
  });

  // Store → URL. Subscribe and write back to search params.
  useEffect(() => {
    const writeAll = (state: ReturnType<typeof useAppStore.getState>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (config.year) next.set("year", String(state.year));
          if (config.metric) next.set("metric", state.metric);
          if (config.region) {
            if (state.region === "all") next.delete("region");
            else next.set("region", state.region);
          }
          if (config.iso) {
            if (state.comparedIsos.length === 0) next.delete("iso");
            else next.set("iso", state.comparedIsos.join(","));
          }
          return next;
        },
        { replace: true },
      );
    };

    const unsubscribe = useAppStore.subscribe(
      (s) => ({
        year: s.year,
        metric: s.metric,
        region: s.region,
        comparedIsos: s.comparedIsos,
      }),
      (slice) => writeAll({ ...useAppStore.getState(), ...slice }),
      {
        equalityFn: (a, b) =>
          a.year === b.year &&
          a.metric === b.metric &&
          a.region === b.region &&
          a.comparedIsos.length === b.comparedIsos.length &&
          a.comparedIsos.every((iso, i) => iso === b.comparedIsos[i]),
      },
    );
    return unsubscribe;
    // setSearchParams is stable from react-router; config is shallow-treated
    // as immutable for the lifetime of the component (one config per route).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearchParams]);
}
