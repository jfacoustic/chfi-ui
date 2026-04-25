/**
 * Branded ISO3 type. Strings tagged so we can't mix raw country names with codes.
 * Use `asIso3()` to construct one from a validated string.
 */
export type Iso3 = string & { readonly __brand: "Iso3" };

export const asIso3 = (s: string): Iso3 => s as Iso3;

export type Region =
  | "North America"
  | "Caucasus & Central Asia"
  | "East Asia"
  | "South Asia"
  | "Oceania"
  | "Latin America & the Caribbean"
  | "Western Europe"
  | "Eastern Europe"
  | "Sub-Saharan Africa"
  | "Middle East & North Africa";

export const PF_CATEGORIES = [
  "pf_rol",
  "pf_ss",
  "pf_movement",
  "pf_religion",
  "pf_assembly",
  "pf_expression",
  "pf_identity",
] as const;

export type PfCategory = (typeof PF_CATEGORIES)[number];

export const EF_CATEGORIES = [
  "ef_government",
  "ef_legal",
  "ef_money",
  "ef_trade",
  "ef_regulation",
] as const;

export type EfCategory = (typeof EF_CATEGORIES)[number];

export const ALL_METRICS = [
  "hf_score",
  "pf_score",
  "ef_score",
  ...PF_CATEGORIES,
  ...EF_CATEGORIES,
] as const;

export type MetricKey = (typeof ALL_METRICS)[number];

export interface YearRecord {
  iso: string;
  country: string;
  region: Region;
  year: number;
  hf_score: number | null;
  hf_rank: number | null;
  hf_quartile: number | null;
  pf_score: number | null;
  pf_rank: number | null;
  ef_score: number | null;
  ef_rank: number | null;
  pf_rol: number | null;
  pf_ss: number | null;
  pf_movement: number | null;
  pf_religion: number | null;
  pf_assembly: number | null;
  pf_expression: number | null;
  pf_identity: number | null;
  ef_government: number | null;
  ef_legal: number | null;
  ef_money: number | null;
  ef_trade: number | null;
  ef_regulation: number | null;
}

export interface CountryManifestEntry {
  iso: string;
  country: string;
  region: Region;
}

export interface TimeseriesPoint {
  year: number;
  value: number | null;
}

export interface CountryTimeseries {
  iso: string;
  country: string;
  region: Region;
  series: Record<MetricKey, TimeseriesPoint[]>;
}

export const MIN_YEAR = 2000 as const;
export const MAX_YEAR = 2023 as const;
export const DEFAULT_YEAR = 2023 as const;

/**
 * Discriminated union returned by every data hook.
 * Components narrow on `status` rather than juggling separate booleans.
 */
export type AsyncResult<T> =
  | { status: "idle"; data?: undefined; error?: undefined }
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "success"; data: T; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };
