# Spec 06 — Heat Map Feature (`/`)

## Purpose

Deliver the headline view: an interactive world choropleth colored by the selected metric and year, with a year slider (with play/pause), metric switcher, region filter, hover tooltip, and click-through to country detail.

## Scope

### Map

- `src/components/HeatMap.tsx` using `react-simple-maps`:
  - `<ComposableMap projection="geoEqualEarth">` with a TopoJSON world atlas (vendored under `public/topo/world-110m.json`, ~100 KB).
  - `<Geographies>` joins on `properties.iso_a3` (ISO3) to the year data from `useYearData(year)`.
  - Color via `getQuartileColor(quartile)`; null score → neutral gray with hatched/striped pattern.
  - Region filter dims (opacity 0.25) non-matching countries.
  - Hover: cursor pointer, stroke highlight, `<Tooltip>`-style floating panel with: flag, country name, region, rank, score, quartile.
  - Click: navigate to `/country/:iso`.

### Controls (top of page)

- `<MetricPicker>` from spec 05, bound to store.
- `<RegionFilter>` from spec 05, bound to store.

### Year control (bottom of page)

- `<YearSliderControls>` wraps spec 05's `<YearSlider>` and adds:
  - Play/Pause button. Playing advances `year` by 1 every **1000 ms**; loops 2023 → 2000.
  - Auto-pause on user manual slider input.
  - Display label: e.g., "Year: 2010 (2025 Report data)".
- Animation uses `setInterval` cleared on unmount and on pause; tested with fake timers.

### Legend

- `<QuartileLegend>` showing 4 color swatches + "No data" swatch, with score range hints if available.

## Non-goals

- Country detail view (spec 08).
- List view (spec 07).
- Dark mode styling (spec 10).
- Globe / 3D view.

## Inputs

- `useYearData(year)` from spec 03.
- `useAppStore` selectors for `year`, `metric`, `region` from spec 04.
- TopoJSON atlas at `public/topo/world-110m.json`.

## Outputs

- `src/pages/Home.tsx` (real implementation replacing spec 04 placeholder).
- `src/components/HeatMap.tsx`, `src/components/HeatMapTooltip.tsx`, `src/components/YearSliderControls.tsx`, `src/components/QuartileLegend.tsx`.

## Acceptance criteria

1. Loading the page at `/` (no params) renders the world map colored for HF score in 2023.
2. Changing metric in `<MetricPicker>` recolors the map within one render frame and updates URL `?metric=...`.
3. Sliding the year updates the map and URL `?year=...`.
4. Clicking Play advances the year by 1 every ~1s; clicking Pause halts; advancing past 2023 wraps to 2000.
5. Manual slider drag pauses the animation.
6. Region filter dims non-matching countries; quartile colors of matching countries unchanged.
7. Hovering a country shows the tooltip with correct rank/score; missing-data countries show "No data".
8. Clicking a country navigates to `/country/{ISO3}`.
9. Page renders `<LoadingState>` while year data is fetching, `<ErrorState>` on fetch failure with retry.
10. No crashes on countries present in TopoJSON but absent from dataset (e.g., very small territories).

## Test plan (TDD)

- `HeatMap.test.tsx`:
  - Render with mocked `useYearData` returning a 3-country fixture; assert SVG paths colored per quartile.
  - Hover triggers tooltip with expected text.
  - Click dispatches `navigate('/country/USA')` (mock router).
  - Country with `hf_score: null` gets the "no-data" class.
- `YearSliderControls.test.tsx`:
  - Play → vi.fake timers advance 1s → year increments.
  - Reaching 2023 wraps to 2000.
  - Manual onChange while playing pauses.
- `QuartileLegend.test.tsx`: renders 5 swatches with correct labels.
- `Home.test.tsx`: integration — initial URL `?year=2010&metric=pf_score&region=Western%20Europe` reflects in store and visible UI.

## Dependencies

- Spec 01, 03, 04, 05.
- TopoJSON atlas asset committed under `public/topo/`.

## Open questions

- TopoJSON source: world-atlas npm package vs. vendored file? **Resolved: vendored** (`world-atlas/countries-110m.json`) to avoid runtime dep churn.
