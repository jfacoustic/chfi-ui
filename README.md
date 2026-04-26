# Cato Human Freedom Index

Interactive UI for the [2025 Cato Human Freedom Index](https://www.cato.org/human-freedom-index/2025) (latest data point: 2023).

## Note on AI Usage

This project is a Saturday experiment with "vibe driven spec driven development".  I used OpenCode with Opus 4.7.

Here's a high level log of my process:

1. Initialized an empty git repo and added a trivial readme and the public dataset json. 
2. I gave Opencode a list of features and had it generate a high level plan for the entire project [specs/initial_agent_plan.md](./specs/initial_agent_plan.md)
3. I created an AGENTS.md file, including directions to use spec driven development and write tests before implmenting code.
4. I had it break out the initial plan into more detailed specifications (also found under the specs folder).  I was curious about using an agentic team, so I generated a timeline with potential parallel processes, but ultimately decided against this approach.
5. I meant to do this earlier, but I added instructions to AGENTS.md to commit after every file was changed with a summary of those changes and which model was used.
6. I tried to "one-shot" the specs, but reverted back to the previous state after my internet dropped.
7. I used a separate context window for the first two specs.  This helped me catch npm auditing issues and using an old version of node.
8. I used the same context window ownward. My messages were: "Implement spec 3", "Implement specs 4 thru 7", and "Implement 8 thru 10".  It didn't encounter any issues.
9. I ran the local dev environment, and it worked and all of the tests pass.  

It's pretty cool how quickly this was built.  But it's definitely not a finished product.  The UI is sloppy and I'm sure that I'll find bugs if I poke it enough.  I'd like to run the same experiment with smaller models.

## Features

- **Heat map** — world choropleth colored by quartile, with a play/pause year animation across 2000–2023, region filter, hover tooltip, and click-through to country detail.
- **Countries list** — sortable, searchable, paginated table of all 165 countries; URL-synced state means any view is shareable.
- **Country detail** — flag, region, top-line scores, 12-axis radar, PF/EF bar charts, and a 24-year time series with a reference line at the selected year.
- **Compare** — pick up to 5 countries; overlaid radar, grouped bars, and multi-line time series with a deterministic color palette.
- **Cmd+K palette** — global keyboard search of all 165 countries.
- **Dark mode** — toggle in the header; preference persists to localStorage.

## Stack

Vite · React 19 · TypeScript · Tailwind v4 · react-router-dom · Zustand · @tanstack/react-table · react-simple-maps + TopoJSON · Recharts · Vitest + React Testing Library.

## Commands

```bash
npm install        # Install dependencies (uses --legacy-peer-deps via .npmrc)
npm run dev        # Start the Vite dev server on http://localhost:5173
npm run build      # Type-check (tsc -b) and bundle for production
npm run preview    # Preview the production build locally
npm run test       # Run the Vitest suite once
npm run test:watch # Vitest in watch mode
npm run lint       # ESLint (flat config)
npm run format     # Prettier format src + root configs
npm run transform  # Re-derive public/data/* from the source dataset (rare)
npm run topo       # Re-copy the world-atlas TopoJSON into public/topo (rare)
```

`public/data/` (manifest, per-year, per-country files) and `public/topo/world-110m.json` are committed so a fresh clone runs without the transform/topo steps. Re-run them only when the source dataset or world-atlas dependency changes.

## Quickstart

```bash
git clone <repo>
cd freedom_index
npm install
npm run dev
```

Then open http://localhost:5173.

## Project layout

```
public/
  data/                  # Generated artifacts consumed by the data hooks
    index.json           # 165-entry country manifest
    years/{2000..2023}.json
    timeseries/{ISO3}.json
  topo/world-110m.json   # Vendored world atlas (M49 country ids)
scripts/
  transform.mjs          # Splits the column-oriented source JSON into the per-year/per-country files
  copy-topo.mjs          # Copies node_modules/world-atlas/countries-110m.json into public/topo
src/
  components/            # Shell + primitives + feature components
  data/                  # TS types, constants, fixtures
  hooks/                 # useManifest, useYearData, useTimeseries, useTimeseriesMany, useUrlSync, useHotkey, useTheme
  lib/                   # iso (ISO3↔ISO2), m49, palette, quartiles
  pages/                 # Home / Countries / CountryDetail / Compare / NotFound
  store/                 # Zustand global store
  router.tsx             # Route definitions
  App.tsx                # BrowserRouter wrapper
specs/                   # Source-of-truth specs that drive implementation
```

## Data attribution

Source data © [Cato Institute — 2025 Human Freedom Index](https://www.cato.org/human-freedom-index/2025). The dataset's filename includes "2025" because that is the report year; the latest data point is 2023.

The vendored TopoJSON ships from the [world-atlas](https://github.com/topojson/world-atlas) package by Mike Bostock, MIT-licensed.

## Dev notes

- The app pins Node 24 via `.nvmrc` because Vite's bundler requires the newer `node:util` `styleText` shape.
- All filter / view state is URL-synchronized; `?year=`, `?metric=`, `?region=`, `?iso=` etc. round-trip through the Zustand store on every page.
- Charts and table cells render `—` for missing values rather than coercing to 0, so "no data" stays distinguishable from "score of 0".
