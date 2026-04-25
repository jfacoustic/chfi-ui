# Spec 08 — Country Detail Feature (`/country/:iso`)

## Purpose

Deep-dive view for a single country: identity header, top-line scores, breakdown of all 12 sub-categories, time-series across 2000–2023, and an "Add to compare" action.

## Scope

- `src/pages/CountryDetail.tsx` replacing spec 04 placeholder.
- Route param `:iso` validated as ISO3 (3 uppercase letters); invalid → 404 page.
- Data sources: `useTimeseries(iso)` (spec 03) for charts; `useYearData(year)` for the year-specific top metrics; `useManifest()` to resolve country name/region quickly.
- Layout (top → bottom):
  1. **Header** — `<CountryFlag>` + country name + region badge + back link.
  2. **Score cards** — three large cards: HF score + rank + quartile, PF score + rank, EF score + rank, all for the globally-selected year.
  3. **Radar chart** — recharts `<RadarChart>` of all 12 category scores for the selected year (single ring).
  4. **Bar charts** — two `<BarChart>` panels: 7 PF categories, 5 EF categories, for the selected year.
  5. **Time-series** — recharts multi-line chart of `hf_score`, `pf_score`, `ef_score` across 2000–2023 with a `<ReferenceLine>` at the selected year. Tooltip shows the three values for the hovered year.
  6. **Add to compare** button — calls `addCompared(iso)`; disabled and tooltip "Limit reached (5)" when `comparedIsos.length === 5`; shows `Remove from compare` when already in list.
- Year changes (driven by global store / URL `?year=`) update score cards, radar, and bar charts; time-series re-renders the reference line only.

## Non-goals

- Sub-sub-category drilldown (the dataset's 100+ component fields are intentionally excluded).
- Compare view (spec 09).
- Historical metric switcher beyond HF/PF/EF on the time-series.

## Inputs

- `useTimeseries`, `useYearData`, `useManifest` from spec 03.
- `useAppStore` from spec 04 (`year`, `comparedIsos`, `addCompared`/`removeCompared`).
- Primitives from spec 05.

## Outputs

- `src/pages/CountryDetail.tsx`.
- `src/components/CountryHeader.tsx`, `src/components/ScoreCards.tsx`, `src/components/RadarBreakdown.tsx`, `src/components/CategoryBars.tsx`, `src/components/TimeseriesChart.tsx`, `src/components/CompareToggleButton.tsx`.

## Acceptance criteria

1. `/country/USA` renders the header, three score cards, radar, bar charts, time-series, and the compare button without errors.
2. `/country/usa` (lowercase) is normalized or 404s consistently — **resolved: normalize to uppercase and proceed**.
3. `/country/XYZ` (unknown ISO3) renders the 404 page.
4. Changing `?year=` updates score cards, radar, and bar charts; time-series reference line moves; underlying time-series data is **not** re-fetched.
5. Score cards display `—` for any null score and omit rank when null.
6. Radar and bar charts skip null values gracefully (gap in radar polygon, missing bar).
7. Time-series tooltip shows year and three values (or "—" for nulls).
8. Add to compare adds the iso to the store and to the URL on `/compare`; the button label flips to "Remove from compare".
9. Add to compare is disabled with tooltip when limit reached and the country is not already in the list.
10. Loading and error states render via shared primitives.

## Test plan (TDD)

- `CountryHeader.test.tsx`: renders flag, name, region.
- `ScoreCards.test.tsx`: null-handling shows `—`.
- `RadarBreakdown.test.tsx`: with fixture, asserts 12 axes labeled correctly; null values produce no point.
- `CategoryBars.test.tsx`: 7 PF bars + 5 EF bars rendered, sorted by category order.
- `TimeseriesChart.test.tsx`: 24 data points per series; reference line at `year` prop.
- `CompareToggleButton.test.tsx`:
  - Click adds; click again removes.
  - At 5 already, button is disabled and not in list → tooltip shown.
- `CountryDetail.test.tsx` integration: route param drives data fetch; unknown ISO renders 404.

## Dependencies

- Spec 01, 03, 04, 05.

## Open questions

- Show component-level metrics beyond the 12 categories? **Resolved: no** for v1.
