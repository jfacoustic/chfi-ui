# Spec 09 — Compare Feature (`/compare`)

## Purpose

Side-by-side analysis of up to 5 countries: score cards, overlaid radar, grouped bars, multi-line time-series. Fully URL-driven so any comparison is shareable.

## Scope

- `src/pages/Compare.tsx` replacing spec 04 placeholder.
- URL: `/compare?iso=USA,CAN,GBR&year=2023`.
- `<CountryPicker>`:
  - Multi-select autocomplete fed by `useManifest()`.
  - Search-as-you-type matches country name or ISO3.
  - Selecting adds via `addCompared`; deselect removes.
  - Disabled / "Limit reached" message at 5 selections.
- Layout when ≥1 country selected:
  1. **Score cards row** — one card per country with HF/PF/EF for the current year.
  2. **Overlaid radar** — single `<RadarChart>` with one polygon per country (distinct colors), legend keyed to country.
  3. **Grouped bar charts** — for each of the 12 categories, a grouped bar with one bar per country. Two panels (PF / EF) to keep widths sane.
  4. **Multi-line time-series** — one chart with three sub-tabs (HF / PF / EF) — each tab has one line per selected country across 2000–2023, with a reference line at the selected year.
- Empty state when zero selected: prompt "Pick up to 5 countries to compare" with the picker prominent.
- Removing all selections clears `?iso` from URL.
- Color palette deterministic: assigned by stable hash of iso → palette slot, so colors don't shift when removing a country.

## Non-goals

- Saving/loading named comparison sets.
- Difference / delta tables.
- Greater than 5 countries.

## Inputs

- `useManifest`, `useTimeseries` (one per selected iso), `useYearData` from spec 03.
- Store from spec 04 (`comparedIsos`, `addCompared`, `removeCompared`, `clearCompared`, `setComparedFromList`, `year`).
- Primitives from spec 05; reuses radar/bar/timeseries components from spec 08 — **refactored to accept multi-country props** before this spec lands (or extracted alongside).

## Outputs

- `src/pages/Compare.tsx`.
- `src/components/CountryPicker.tsx`.
- `src/components/CompareScoreCards.tsx`, `src/components/CompareRadar.tsx`, `src/components/CompareBars.tsx`, `src/components/CompareTimeseries.tsx`.
- `src/lib/palette.ts` — stable iso→color mapping.

## Acceptance criteria

1. `/compare?iso=USA,CAN,GBR&year=2020` hydrates the store and renders score cards, radar, bars, and time-series for those three.
2. Adding a 6th country via the picker is blocked with a visible message; URL unchanged.
3. Removing a country updates URL and re-renders without remaining country's color shifting.
4. Changing year via the global slider updates score cards, radar, bars; time-series reference line moves; series data not re-fetched.
5. Time-series sub-tabs (HF / PF / EF) switch lines without losing year context.
6. Picker autocomplete matches both "United States" and "USA" for the same entry.
7. Empty state when `iso` param missing or empty.
8. Loading skeleton when any of the in-flight `useTimeseries(iso)` calls are pending.

## Test plan (TDD)

- `CountryPicker.test.tsx`: autocomplete matches by name and iso; cap at 5 enforced; deselect works.
- `CompareScoreCards.test.tsx`: null score → `—`; per-country card includes flag, name.
- `CompareRadar.test.tsx`: N polygons rendered with distinct colors from palette.
- `CompareBars.test.tsx`: 12 category groups, each with N bars.
- `CompareTimeseries.test.tsx`: N lines, reference line at selected year, tab switch updates lines.
- `palette.test.ts`: same iso always maps to same color slot regardless of input order.
- `Compare.test.tsx` integration: full URL hydration round-trip.

## Dependencies

- Spec 01, 03, 04, 05.
- Spec 08 (chart components) — must be authored with multi-country reuse in mind, or refactored as part of this spec. Recommend implementing 08 first with single-country API, then extracting/generalizing here.

## Open questions

- Color palette source (Tailwind colors vs. custom)? **Resolved: 5-slot custom palette** chosen for accessibility (WCAG AA on light bg).
