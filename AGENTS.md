# AGENTS.md

## Repo state

Pre-implementation. Only the source dataset, README, and a planning spec exist. No `package.json`, no build tooling, no `src/` yet. Treat `specs/initial_agent_plan.md` as the source of truth for stack and architecture decisions before scaffolding.

## Workflow

- **Spec-driven agentic development.** Every non-trivial change starts with a spec in `specs/`. Read the relevant spec before coding; if one doesn't exist for the work, write or update it first and confirm before implementing. `specs/` is the source of truth — code follows spec, not the other way around.
- **Test-driven development.** Write failing tests before implementation. Don't add code without a test driving it.

## Read first

- `specs/` — current and historical specs. Start with `specs/initial_agent_plan.md` for stack, dataset facts, phased build plan, project layout. Don't reinvent these.
- `README.md` — one-line product description and link to the Cato source.

## Dataset gotchas (`2025-human-freedom-index.json`)

- 8.4 MB, **column-oriented** (Pandas `to_json` default — not a row array). Anything that loads it must transpose columns → rows.
- Filename says 2025 but **data ends in 2023**; "2025" is the report year. UI label must read "2025 Human Freedom Index Report (2023 data)".
- 3,960 rows = 165 countries × 24 years (2000–2023), 155 columns.
- Join key for maps is **ISO3** (`iso` column).
- Default year for UI = **2023**.

## Planned data pipeline (do not ship the raw 8.4 MB to the client)

Per the plan, `scripts/transform.mjs` should split the source into:
- `public/data/years/{2000..2023}.json` — trimmed to ~20 fields per record
- `public/data/timeseries/{ISO}.json` — lazy-loaded on country detail
- `public/data/index.json` — `{iso, country, region}` manifest for search

Lazy-load per year/country; never import the source JSON into the bundle.

## Stack constraints (locked in plan)

Vite + React + TS + Tailwind, react-router-dom, **react-simple-maps + TopoJSON** (ISO3 join), recharts, @tanstack/react-table, zustand. Global state (`year`, `metric`, `comparedIsos`) is synced to URL search params — keep it that way so views are shareable.

## Domain field groups

- 7 PF categories: `pf_rol, pf_ss, pf_movement, pf_religion, pf_assembly, pf_expression, pf_identity`
- 5 EF categories: `ef_government, ef_legal, ef_money, ef_trade, ef_regulation`
- Compare view caps at **5 countries**.

## Commands

None yet. After scaffolding, add the real commands here (install, dev, build, test, transform script) so future sessions don't guess.
