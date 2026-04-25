# Spec 07 — Countries List Feature (`/countries`)

## Purpose

Sortable, filterable, searchable, paginated table of every country for a given year — the data-dense counterpart to the heat map.

## Scope

- `src/pages/Countries.tsx` replacing spec 04 placeholder.
- Data source: `useYearData(year)` from spec 03.
- Toolbar:
  - Year selector (reuses `<YearSlider>` or a compact `<YearSelect>` dropdown — choose dropdown for precision in this view).
  - `<RegionFilter>` for region narrowing.
  - Search input (`q`) — case-insensitive substring match on country name.
- Table via `@tanstack/react-table`:
  - Columns: `Rank` (HF rank), `Country` (with `<CountryFlag>` + name), `Region` (badge), `HF Score`, `PF Score`, `EF Score`, `Quartile` (`<ScoreBadge>`).
  - Default sort: `hf_rank` ascending; null ranks sink to bottom.
  - All score/rank columns sortable; click toggles asc/desc.
  - Pagination: 25 / 50 / 100 page sizes (selector); page navigation controls.
  - Row click → navigates to `/country/:iso`.
- All toolbar/table state is URL-synced (`year`, `region`, `q`, `sort`, `dir`, `page`, `pageSize`) per spec 04.
- Empty state when filters return zero rows: `<EmptyState message="No countries match your filters" />`.

## Non-goals

- Multi-column sort.
- Column show/hide controls.
- Export CSV.
- Sub-category columns (kept off to limit width; available on detail page).

## Inputs

- Year data and types/constants from spec 03.
- Store `year`, `region` selectors and URL sync from spec 04.
- Primitives from spec 05.

## Outputs

- `src/pages/Countries.tsx`.
- `src/components/CountriesTable.tsx`, `src/components/CountriesToolbar.tsx`, `src/components/YearSelect.tsx` (compact variant).

## Acceptance criteria

1. Visiting `/countries` shows 165 rows for year 2023, sorted by HF rank ascending, paginated 25 per page.
2. Typing in search filters rows live; URL updates `?q=...`; clearing restores all rows.
3. Region filter narrows to that region; counts in pagination footer update.
4. Clicking a sortable header toggles direction; URL `?sort=...&dir=...` reflects state.
5. Changing page size resets to page 1.
6. Row click navigates to `/country/{ISO3}` and the back button restores the exact list state (URL preserved).
7. Year selector switches dataset; null-score countries still render with `—` placeholders.
8. Empty result set renders the empty state, not a blank table.
9. Loading and error states render via shared primitives.

## Test plan (TDD)

- `CountriesTable.test.tsx`:
  - Render with 5-country fixture; assert default sort and rendered cells.
  - Click column header → asserts re-sorted order.
  - Pagination: with 30 rows, asserts page 1 has 25 and page 2 has 5.
- `CountriesToolbar.test.tsx`:
  - Typing in search debounces (or applies immediately — simplest: immediate) and emits `onChange`.
  - Region chip click toggles selection.
- `Countries.test.tsx` integration:
  - URL `?q=can&region=North%20America&sort=pf_score&dir=desc` → table reflects filter, sort, and persists to store.
  - Row click navigates with preserved query string.

## Dependencies

- Spec 01, 03, 04, 05.

## Open questions

- Search debounce? **Resolved: immediate** (165-row dataset is tiny).
