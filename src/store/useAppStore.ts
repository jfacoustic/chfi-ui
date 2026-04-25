import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  DEFAULT_YEAR,
  MAX_YEAR,
  MIN_YEAR,
  type Iso3,
  type MetricKey,
  type Region,
} from "../data/types";

const MAX_COMPARED = 5;

export type RegionFilterValue = Region | "all";

export interface AppState {
  year: number;
  metric: MetricKey;
  region: RegionFilterValue;
  comparedIsos: Iso3[];
  setYear: (year: number) => void;
  setMetric: (metric: MetricKey) => void;
  setRegion: (region: RegionFilterValue) => void;
  addCompared: (iso: Iso3) => boolean;
  removeCompared: (iso: Iso3) => void;
  clearCompared: () => void;
  setComparedFromList: (isos: Iso3[]) => void;
  reset: () => void;
}

const clampYear = (y: number): number => {
  if (Number.isNaN(y)) return DEFAULT_YEAR;
  if (y < MIN_YEAR) return MIN_YEAR;
  if (y > MAX_YEAR) return MAX_YEAR;
  return y;
};

const initialState = {
  year: DEFAULT_YEAR,
  metric: "hf_score" as MetricKey,
  region: "all" as RegionFilterValue,
  comparedIsos: [] as Iso3[],
};

/**
 * Single global store. Per spec 04, no provider is used; consumers import
 * directly. `subscribeWithSelector` keeps fine-grained subscriptions cheap
 * for components that only care about a slice (e.g., year-only listeners).
 */
export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    setYear: (year) => set({ year: clampYear(year) }),
    setMetric: (metric) => set({ metric }),
    setRegion: (region) => set({ region }),
    addCompared: (iso) => {
      const upper = iso.toUpperCase() as Iso3;
      const list = get().comparedIsos;
      if (list.length >= MAX_COMPARED) return false;
      if (list.includes(upper)) return false;
      set({ comparedIsos: [...list, upper] });
      return true;
    },
    removeCompared: (iso) => {
      const upper = iso.toUpperCase() as Iso3;
      set({
        comparedIsos: get().comparedIsos.filter((c) => c !== upper),
      });
    },
    clearCompared: () => set({ comparedIsos: [] }),
    setComparedFromList: (isos) => {
      const seen = new Set<string>();
      const next: Iso3[] = [];
      for (const raw of isos) {
        const upper = raw.toUpperCase() as Iso3;
        if (seen.has(upper)) continue;
        seen.add(upper);
        next.push(upper);
        if (next.length >= MAX_COMPARED) break;
      }
      set({ comparedIsos: next });
    },
    reset: () => set({ ...initialState }),
  })),
);
