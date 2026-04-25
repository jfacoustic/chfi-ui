# Spec 01 — Project Scaffold

## Purpose

Stand up the Vite + React + TypeScript + Tailwind project skeleton, install all locked-in dependencies, configure tooling (TS, Tailwind, ESLint, Prettier, Vitest + React Testing Library), and produce a runnable empty app. This unblocks every other spec.

## Scope

- Initialize project with `npm create vite@latest` (React + TS template) at the repo root.
- Install runtime deps: `react`, `react-dom`, `react-router-dom`, `react-simple-maps`, `topojson-client`, `recharts`, `@tanstack/react-table`, `zustand`.
- Install dev deps: `tailwindcss`, `postcss`, `autoprefixer`, `@types/react-simple-maps`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `eslint`, `prettier`, `@typescript-eslint/*`, `eslint-plugin-react`, `eslint-plugin-react-hooks`.
- Configure Tailwind (`tailwind.config.js`, `postcss.config.js`, `src/index.css` with `@tailwind` directives).
- Configure Vitest (`vite.config.ts` with `test` block, jsdom env, `setupTests.ts` registering `@testing-library/jest-dom`).
- Add `tsconfig.json` strict mode, `tsconfig.node.json` for scripts.
- Wire ESLint + Prettier so `npm run lint` and `npm run format` work.
- Replace boilerplate `App.tsx` with a placeholder `<main>` rendering the report title from spec 05's eventual shell — for this spec, just a static `<h1>` is fine.
- Update `AGENTS.md` Commands section with the real install/dev/build/test/lint commands once they exist.

## Non-goals

- Routing (spec 04), state management (spec 04), data fetching (spec 03), data transform (spec 02), any feature pages (specs 06–09).
- CI / deploy config.

## Inputs

- `2025-human-freedom-index.json` (untouched — only relevant in that `.gitignore` and `tsconfig` shouldn't choke on it).

## Outputs

- `package.json` with scripts: `dev`, `build`, `preview`, `test`, `test:watch`, `lint`, `format`.
- `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `.eslintrc.cjs`, `.prettierrc`, `.gitignore`.
- `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/setupTests.ts`.
- Empty directories (with `.gitkeep` if needed) for `src/components/`, `src/pages/`, `src/hooks/`, `src/store/`, `src/data/`, `scripts/`, `public/data/years/`, `public/data/timeseries/`.

## Acceptance criteria

1. `npm install` succeeds from a clean clone.
2. `npm run dev` serves a page at localhost showing the placeholder title without console errors.
3. `npm run build` produces a `dist/` with no TS errors.
4. `npm run test` runs Vitest and the smoke test passes.
5. `npm run lint` reports zero errors.
6. `tsconfig.json` has `"strict": true`, `"noUncheckedIndexedAccess": true`.
7. Tailwind utility classes render correctly (verified by smoke test or visual check).
8. `AGENTS.md` Commands section is updated with the real commands.

## Test plan (TDD)

- **Smoke test** (`src/App.test.tsx`): renders `<App />`, asserts the report title text is present. Written before `App.tsx` is finalized.
- **Tailwind sanity test**: render an element with `className="hidden"` and assert `display: none` via computed style (or skip if jsdom limits this; rely on visual check noted in PR).

## Dependencies

- None. This spec is the root of the dependency graph.

## Open questions

- None.
