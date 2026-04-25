# Spec 02 — Data Pipeline (`scripts/transform.mjs`)

## Purpose

Convert the 8.4 MB column-oriented source JSON into the small, lazy-loadable per-year, per-country, and manifest files the UI consumes. This spec exists so the source file is **never imported into the client bundle**.

## Scope

- Implement `scripts/transform.mjs` (Node ESM, no TS — runs once via `npm run transform`).
- Read `2025-human-freedom-index.json` from repo root.
- Transpose Pandas column-oriented shape (`{ "col": { "0": v, "1": v, ... } }`) into row records `[{ col: v, ... }, ...]`.
- Validate: 3,960 rows, 165 unique `iso` values, years span 2000–2023 inclusive.
- Emit three artifact families under `public/data/`:
  - `public/data/index.json` — `[{ iso, country, region }]`, deduped, sorted by country name.
  - `public/data/years/{2000..2023}.json` — array of 165 trimmed records per year.
  - `public/data/timeseries/{ISO}.json` — `{ iso, country, region, series: { hf_score: [{year, value}], pf_score: [...], ef_score: [...], pf_rol: [...], pf_ss: [...], pf_movement: [...], pf_religion: [...], pf_assembly: [...], pf_expression: [...], pf_identity: [...], ef_government: [...], ef_legal: [...], ef_money: [...], ef_trade: [...], ef_regulation: [...] } }`.
- Trimmed per-record fields for `years/*.json`: `iso, country, region, year, hf_score, hf_rank, hf_quartile, pf_score, pf_rank, ef_score, ef_rank, pf_rol, pf_ss, pf_movement, pf_religion, pf_assembly, pf_expression, pf_identity, ef_government, ef_legal, ef_money, ef_trade, ef_regulation`. (Country name is normalized from source `countries` column to `country`.)
- Handle missing values: preserve `null` (do not coerce to 0 — distinguishes "no data" from "score of 0").
- Add `npm run transform` script to `package.json`.
- Add `public/data/` artifacts to `.gitignore` if their size or churn warrants it; otherwise commit them. **Decision**: commit them so the app runs without a build step. Document in spec.
- Pretty-print `index.json` (small, helpful for diffs); minify per-year and per-country files.

## Non-goals

- Runtime data fetching (spec 03).
- Schema generation for TS types — types are hand-written in spec 03 to mirror this output.
- Incremental/watch mode.

## Inputs

- `/2025-human-freedom-index.json` (column-oriented, 8.4 MB).

## Outputs

- `public/data/index.json` (~10 KB).
- `public/data/years/2000.json` … `public/data/years/2023.json` (24 files, ~50–80 KB each).
- `public/data/timeseries/{ISO}.json` (165 files, ~5–10 KB each).
- Console summary: row count, country count, year range, output file count and total bytes.

## Acceptance criteria

1. `npm run transform` exits 0 and prints the summary.
2. `public/data/index.json` has exactly 165 entries; each entry has non-empty `iso`, `country`, `region`.
3. `public/data/years/` contains 24 files, one per year 2000–2023; each file is a JSON array of exactly 165 objects.
4. `public/data/timeseries/` contains 165 files; filenames are uppercase ISO3 codes; each file's `series.hf_score` array has 24 entries spanning 2000–2023.
5. The 12 category fields plus `hf_score`/`pf_score`/`ef_score` are present (possibly null) in every per-year record.
6. No record contains the raw `countries` field — it is renamed to `country`.
7. Total `public/data/` size < 4 MB on disk; expected to compress to well under 1 MB on the wire (gzip/brotli at the static host). The cap is disk-only — runtime cost is dominated by the gzipped transfer, which is currently ~660 KB total across all artifacts.
8. Re-running the script is deterministic (byte-identical output for the same input).

## Test plan (TDD)

Add `scripts/transform.test.mjs` (Vitest, node env):

- **Shape test**: mock a tiny column-oriented input fixture (3 countries × 2 years) and assert the transposed records have the expected keys and values.
- **Validation test**: run the transposer on a fixture missing the `iso` column → expect a thrown error with a clear message.
- **Trimming test**: input fixture with extra columns (`pf_rol_procedural`, etc.) → output records contain only the 23 whitelisted fields.
- **Null preservation test**: fixture with `null` for `hf_score` → output retains `null`, not `0` or `undefined`.
- **End-to-end smoke test** (slow, run on CI but skippable locally): execute the real script against the real source file in a temp output dir, assert acceptance criteria 2–6.

## Dependencies

- Spec 01 (project scaffold) — needs `package.json` and Vitest configured.

## Open questions

- Should `public/data/` be committed or generated in CI? **Resolved: commit** for now; revisit if churn becomes an issue.
