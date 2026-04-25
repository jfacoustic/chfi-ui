# Spec 04 — Global State & Routing

## Purpose

Establish the Zustand store and the React Router routes that every feature plugs into. State must be URL-synchronized so any view is shareable.

## Scope

### Routing

- `react-router-dom` v6+ with `BrowserRouter`.
- Routes:
  - `/` → Home (heat map). Search params: `year`, `metric`, `region`.
  - `/countries` → Countries list. Search params: `year`, `region`, `q` (search), `sort`, `dir`, `page`, `pageSize`.
  - `/country/:iso` → Country detail. Search params: `year` (controls vertical marker on time-series).
  - `/compare` → Compare. Search params: `iso` (comma-separated, ≤5), `year`.
  - `*` → 404 page.
- Route placeholders only in this spec; feature specs (06–09) fill them in.

### Global store (`src/store/useAppStore.ts`)

- Zustand store with shape:
  - `year: number` (default 2023, clamped 2000–2023).
  - `metric: MetricKey` (default `'hf_score'`).
  - `comparedIsos: Iso3[]` (default `[]`, max 5).
  - `region: Region | 'all'` (default `'all'`).
- Actions: `setYear`, `setMetric`, `setRegion`, `addCompared(iso)`, `removeCompared(iso)`, `clearCompared`, `setComparedFromList(isos)`.
- `addCompared` is a no-op when length === 5 (returns `false`).

### URL sync

- `src/hooks/useUrlSync.ts`: bidirectional sync between store and `useSearchParams`. URL is the source of truth on initial mount; subsequent store changes write to URL with `replace: true` (no history spam).
- Per-route: only relevant params are synced. E.g., `/compare` syncs `iso[]`, others do not.
- Validation: invalid year/metric/region in URL falls back to defaults silently; invalid iso codes are dropped from `comparedIsos`.

## Non-goals

- Page bodies (specs 06–09).
- Route-based code splitting (defer to polish).
- Persisted state in localStorage.

## Inputs

- `MetricKey`, `Region`, `Iso3`, `MIN_YEAR`, `MAX_YEAR`, `DEFAULT_YEAR` from spec 03.

## Outputs

- `src/store/useAppStore.ts`.
- `src/hooks/useUrlSync.ts`.
- `src/router.tsx` (or routes inline in `App.tsx`).
- `src/pages/{Home,Countries,CountryDetail,Compare,NotFound}.tsx` placeholders.

## Acceptance criteria

1. Navigating to `/?year=2010&metric=pf_score` and reading the store yields `{ year: 2010, metric: 'pf_score' }`.
2. Calling `setYear(2015)` updates the URL to `?year=2015` without adding a history entry.
3. `addCompared` rejects the 6th iso (returns false, store unchanged).
4. `/compare?iso=USA,CAN,FOO,GBR` results in `comparedIsos === ['USA','CAN','GBR']` (invalid iso filtered).
5. `?year=9999` is ignored; store stays at default 2023.
6. Each placeholder page renders an identifying `<h1>` so e2e/smoke tests can assert routing.
7. Zustand store is a single instance (no provider needed); HMR doesn't reset state mid-edit (use `subscribeWithSelector` middleware where helpful).

## Test plan (TDD)

- `useAppStore.test.ts`: action unit tests including the 5-cap and clamping behaviors.
- `useUrlSync.test.tsx`: render in a `MemoryRouter` with initial entries; assert store hydrates from URL; mutate store and assert URL updates.
- `router.test.tsx`: render at each route and assert the placeholder header.

## Dependencies

- Spec 01 (scaffold).
- Spec 03 (types/constants).

## Open questions

- Should `metric` differ per route (e.g., the list might want a different default than the map)? **Resolved: shared globally**, simpler and matches the plan.
