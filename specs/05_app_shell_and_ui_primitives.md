# Spec 05 — App Shell & Shared UI Primitives

## Purpose

Build the persistent chrome (header, nav, footer, error boundary, loading/empty states) and the small set of reusable presentational primitives every feature reuses. Centralizing these prevents divergence across pages.

## Scope

### App shell

- `src/components/AppShell.tsx`: `<header>` + `<main>` + `<footer>` layout, Tailwind-based responsive container.
- Header: site title **"2025 Human Freedom Index Report (2023 data)"** with an info `Tooltip` linking to `https://www.cato.org/human-freedom-index/2025`. Primary nav links: Home, Countries, Compare.
- Footer: data attribution to Cato Institute + link to source.
- `<Outlet />` for nested route content.
- `ErrorBoundary` wrapping `<Outlet />` with a friendly fallback.

### Primitives

- `Tooltip` — accessible (role="tooltip", keyboard-triggerable).
- `Spinner` and `<LoadingState />` (full-block centered spinner + label).
- `<ErrorState message />` and `<EmptyState message />`.
- `<Card>`, `<Badge>` (used for region chips, quartile labels).
- `<MetricPicker value onChange />` — segmented control / dropdown over `ALL_METRICS`, grouped (Overall, PF categories, EF categories). Pure; reads/writes via props (parent wires to store).
- `<RegionFilter value onChange />` — chip row over the 10 regions plus "All".
- `<YearSlider value onChange min max />` — range input + labels; play/pause logic is **out of scope** (lives in spec 06's HeatMap controls but reuses this slider).
- `<ScoreBadge score quartile />` — colored badge based on quartile.
- `<CountryFlag iso size />` — `<img>` from `https://flagcdn.com/{iso2}.svg` with ISO3→ISO2 mapping helper.

### Theming

- Tailwind palette extension for quartile colors: Q1 (green), Q2 (yellow-green), Q3 (orange), Q4 (red), null (gray).
- `getQuartileColor(quartile: 1|2|3|4|null): string` exported from `src/components/quartile.ts`.

## Non-goals

- Heat map, list, detail, compare bodies.
- Dark mode (spec 10).
- Cmd+K palette (spec 10).

## Inputs

- Types/constants from spec 03.
- Routing pages from spec 04 (mounted via `<Outlet />`).

## Outputs

- `src/components/AppShell.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/ErrorBoundary.tsx`.
- `src/components/{Tooltip,Spinner,LoadingState,ErrorState,EmptyState,Card,Badge,MetricPicker,RegionFilter,YearSlider,ScoreBadge,CountryFlag}.tsx`.
- `src/components/quartile.ts` + `src/lib/iso.ts` (ISO3↔ISO2 map).

## Acceptance criteria

1. App renders shell on every route; nav links highlight the active route via `NavLink`.
2. Header tooltip is reachable by keyboard (focus → tooltip visible) and announces via `aria-describedby`.
3. `ErrorBoundary` catches a thrown render error and shows fallback without taking down the shell.
4. `MetricPicker` lists 15 options grouped into 3 sections; selecting fires `onChange` with the right key.
5. `RegionFilter` renders 11 chips (10 + "All"); clicking toggles selection.
6. `CountryFlag` falls back to a placeholder when ISO3 has no ISO2 mapping.
7. All primitives have basic a11y: focus rings, semantic elements, aria attributes where relevant.
8. No primitive reads from the Zustand store directly — all are pure/props-driven.

## Test plan (TDD)

- One `*.test.tsx` per primitive, asserting render + interaction (`user-event` for clicks/keyboard).
- `AppShell.test.tsx`: renders header/footer; nav links present; `<Outlet />` content renders via a `MemoryRouter` test rig.
- `ErrorBoundary.test.tsx`: child throws → fallback shows, error logged.
- `quartile.test.ts`: each quartile maps to expected color class.
- `iso.test.ts`: spot-check 5 ISO3→ISO2 conversions including a missing one.

## Dependencies

- Spec 01 (scaffold).
- Spec 03 (types).
- Spec 04 (routing — for `<Outlet />` and `NavLink` integration).

## Open questions

- Source for ISO3→ISO2 mapping: hand-curated minimal map vs. dependency? **Resolved: hand-curated** for the 165 dataset countries, generated as a one-shot export.
