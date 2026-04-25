# Cato Human Freedom Index Explorer — Initial Plan

## Confirmed decisions

- **Stack:** Vite + React + TypeScript + Tailwind
- **Map:** react-simple-maps + TopoJSON
- **Year handling:** Year slider on heat map & list; time-series on detail page; default 2023
- **Data delivery:** One JSON file per year, lazy-loaded on demand
- **Heat map slider:** Includes play/pause animation (~1s per year)
- **Comparison limit:** Up to 5 countries
- **Branding:** "2025 Human Freedom Index Report (2023 data)" with explanatory tooltip
- **Deploy:** Skip for now

## Dataset facts (verified)

- File: `2025-human-freedom-index.json`, 8.4 MB, column-oriented (Pandas `to_json` format).
- 3,960 rows = 165 countries × 24 years (**2000–2023**); the "2025" in the filename is the *report* year, not the latest data year.
- 155 columns; high-level fields: `year`, `iso`, `countries`, `region`, `hf_score`, `hf_rank`, `hf_quartile`, `pf_score`, `pf_rank`, `ef_score`, `ef_rank`.
- 7 Personal Freedom categories: `pf_rol`, `pf_ss`, `pf_movement`, `pf_religion`, `pf_assembly`, `pf_expression`, `pf_identity`.
- 5 Economic Freedom categories: `ef_government`, `ef_legal`, `ef_money`, `ef_trade`, `ef_regulation`.
- 10 regions for filtering: North America, Caucasus & Central Asia, East Asia, South Asia, Oceania, Latin America & the Caribbean, Western Europe, Eastern Europe, Sub-Saharan Africa, Middle East & North Africa.

## Functional requirements

1. **Heat map** of countries by their freedom index (with year slider and metric switcher).
2. **Paginated list** of countries with custom sorting, filtering, and search.
3. **Country search & detail view** with the freedom index broken down into sub-components.
4. **Side-by-side comparison** of multiple countries.

## Implementation phases

### Phase 1 — Scaffold & data pipeline

- `npm create vite@latest` (React + TS) → install Tailwind, react-router-dom, react-simple-maps, recharts, @tanstack/react-table, zustand.
- `scripts/transform.mjs` reads `2025-human-freedom-index.json` and writes:
  - `public/data/years/2000.json` … `public/data/years/2023.json` — one array per year, 165 records each. Trim to ~20 UI-needed fields per record (iso, country, region, hf_score, hf_rank, hf_quartile, pf_score, pf_rank, ef_score, ef_rank, plus the 12 category scores). Estimate ~50–80 KB per file.
  - `public/data/timeseries/{ISO}.json` — per-country file with arrays for hf/pf/ef + 12 category scores across 2000–2023. Lazy-loaded only on country detail page. ~5–10 KB each.
  - `public/data/index.json` — light manifest: `[{ iso, country, region }]` for global search and country picker autocomplete.
- `src/data/types.ts` — TypeScript schemas mirroring the trimmed shape.
- `src/hooks/useYearData.ts`, `src/hooks/useTimeseries.ts` — fetch + cache (in-memory `Map<year, data>`).
- Global state via Zustand: `{ year, metric, comparedIsos[] }` synced to URL search params.

### Phase 2 — Heat map (`/`)

- World choropleth via react-simple-maps with a TopoJSON world atlas; ISO3 join.
- Quartile-based color scale (green → red), with a legend.
- **Year slider** (2000–2023) at the bottom + Play/Pause button (~1s per year).
- **Metric switcher** (HF / PF / EF / 12 sub-categories) top-right.
- Hover tooltip: country, rank, score, quartile.
- Click country → `/country/:iso`.
- Region filter chips (dim non-matching).
- URL state: `?year=2015&metric=pf_score`.

### Phase 3 — Countries list (`/countries`)

- TanStack Table: sortable columns, paginated (25/50/100), region filter, country search input.
- Year selector at the top (synced with global state).
- Columns: Rank, Country, Region, HF, PF, EF, Quartile.
- Row click → `/country/:iso`.

### Phase 4 — Country detail (`/country/:iso`)

- Header: flag (flagcdn.com), name, region, HF rank/score/quartile.
- Three score gauges (HF / PF / EF).
- Radar chart of all 12 category scores.
- Bar charts: PF sub-categories (7) + EF sub-categories (5).
- Time-series line chart (2000–2023) for HF/PF/EF, with a vertical marker at the globally-selected year.
- "Add to compare" button.

### Phase 5 — Compare (`/compare?iso=USA,CAN,GBR`)

- Multi-select picker (max 5), search-as-you-type using `index.json`.
- Side-by-side score cards.
- Overlaid radar chart for 12 categories.
- Grouped bar charts per category.
- Multi-line time-series chart.
- Fully URL-driven and shareable.

### Phase 6 — Polish

- Header with site title "2025 Human Freedom Index Report (2023 data)" + info tooltip linking to cato.org.
- Global `Cmd+K` country search.
- Responsive layout (mobile-friendly).
- Optional dark mode.
- README with run instructions and data attribution.

## Project structure

```
freedom_index/
├── 2025-human-freedom-index.json       # source data (untouched)
├── public/data/
│   ├── index.json                      # country manifest
│   ├── years/2000.json … 2023.json     # one file per year
│   └── timeseries/{ISO}.json           # per-country trends
├── scripts/transform.mjs               # one-time data prep
├── src/
│   ├── data/types.ts
│   ├── store/useAppStore.ts            # zustand: year, metric, compared isos
│   ├── hooks/                          # useYearData, useTimeseries, useManifest
│   ├── components/                     # HeatMap, YearSlider, MetricPicker, ScoreGauge, RadarBreakdown, CompareTable, CountryPicker, etc.
│   ├── pages/                          # Home, Countries, CountryDetail, Compare
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Open questions resolved during planning

- **Stack:** Vite + React + TS + Tailwind.
- **Map library:** react-simple-maps + TopoJSON.
- **Data scope:** All 24 years (2000–2023) with year slider on heat map + list, plus time-series on detail page.
- **Year labeling:** "2025 Report (2023 data)" everywhere a year is shown.
- **Data delivery:** One JSON file per year, lazy-loaded.
- **Slider animation:** Play/pause button at ~1s per year.
- **Comparison limit:** Up to 5 countries.
- **Deployment:** Local only / not yet decided.
