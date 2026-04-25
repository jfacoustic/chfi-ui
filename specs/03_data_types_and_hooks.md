# Spec 03 — Data Types & Data-Access Hooks

## Purpose

Provide the typed, cached client-side data layer that every feature page reads from. Defines the TS schemas mirroring spec 02's output, and the React hooks that lazy-fetch and cache them.

## Scope

- `src/data/types.ts`:
  - `Iso3 = string` branded type alias.
  - `Region = 'North America' | 'Caucasus & Central Asia' | 'East Asia' | 'South Asia' | 'Oceania' | 'Latin America & the Caribbean' | 'Western Europe' | 'Eastern Europe' | 'Sub-Saharan Africa' | 'Middle East & North Africa'`.
  - `MetricKey` union: `'hf_score' | 'pf_score' | 'ef_score' | 'pf_rol' | 'pf_ss' | 'pf_movement' | 'pf_religion' | 'pf_assembly' | 'pf_expression' | 'pf_identity' | 'ef_government' | 'ef_legal' | 'ef_money' | 'ef_trade' | 'ef_regulation'`.
  - `YearRecord` interface with all 23 trimmed fields (`hf_score`/`pf_score`/`ef_score` and the 12 categories typed as `number | null`; ranks `number | null`).
  - `CountryManifestEntry { iso, country, region }`.
  - `TimeseriesPoint { year: number; value: number | null }`.
  - `CountryTimeseries { iso; country; region; series: Record<MetricKey, TimeseriesPoint[]> }`.
  - `MIN_YEAR = 2000`, `MAX_YEAR = 2023`, `DEFAULT_YEAR = 2023` constants.
  - `PF_CATEGORIES`, `EF_CATEGORIES`, `ALL_METRICS` arrays.
- `src/hooks/useManifest.ts`: fetches `/data/index.json` once, caches in module-scope `Promise<CountryManifestEntry[]>`, returns `{ data, isLoading, error }`.
- `src/hooks/useYearData.ts`: takes `year: number`, fetches `/data/years/{year}.json` lazily, caches in `Map<number, YearRecord[]>`, dedupes in-flight requests.
- `src/hooks/useTimeseries.ts`: takes `iso: Iso3`, fetches `/data/timeseries/{iso}.json`, caches in `Map<Iso3, CountryTimeseries>`.
- All hooks throw a typed error on 404 / parse failure; never silently return stale data.
- Hooks return discriminated union `{ status: 'idle' | 'loading' | 'success' | 'error'; data?; error? }` (or use a tiny in-house pattern — no react-query dependency).

## Non-goals

- Global app state (spec 04).
- Any rendering.
- Server-side fetching / SSR.

## Inputs

- Files produced by spec 02 under `public/data/`.

## Outputs

- `src/data/types.ts`, `src/data/constants.ts` (if split out).
- `src/hooks/useManifest.ts`, `src/hooks/useYearData.ts`, `src/hooks/useTimeseries.ts`.
- A test double / fixture utility under `src/data/__fixtures__/` for downstream specs to reuse.

## Acceptance criteria

1. Types compile under strict TS with `noUncheckedIndexedAccess`.
2. Hook tests pass with mocked `fetch`.
3. Repeated calls to `useYearData(2023)` from different components issue **one** network request.
4. Hook returns `error` state on HTTP 404 with a message containing the URL attempted.
5. Cache survives unmount/remount within the same SPA session.
6. Tree-shake check: importing `useYearData` does not pull `useTimeseries` into the chunk.

## Test plan (TDD)

- `useManifest.test.ts`: mock fetch with manifest fixture; render-hook; assert success state and that subsequent renders don't re-fetch.
- `useYearData.test.ts`:
  - 200 OK happy path.
  - 404 error path.
  - Parallel callers dedupe: spy on fetch, render two hooks for same year, assert fetch called once.
- `useTimeseries.test.ts`: same coverage as `useYearData`.
- `types.test-d.ts` (or similar) for compile-time checks: `MetricKey` exhaustive switch.

## Dependencies

- Spec 01 (scaffold).
- Spec 02 (data pipeline) — needed for integration tests against real files; unit tests only need fixtures.

## Open questions

- Adopt `@tanstack/react-query` instead of hand-rolled? **Resolved: no**, plan locks in Zustand only; data caches stay tiny and bespoke.
