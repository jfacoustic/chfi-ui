# Spec 10 — Polish (Search Palette, Responsive, Dark Mode, Docs)

## Purpose

Final-pass quality items that aren't required for any single feature but elevate the whole app: global keyboard search, mobile responsiveness, optional dark mode, and a real README.

## Scope

### Cmd+K country search

- Global keyboard shortcut `Cmd+K` / `Ctrl+K` opens a modal.
- Modal contains a search input, list of matches from `useManifest()` (max 10 visible), arrow-key navigation, Enter to navigate to `/country/:iso`, Esc to close.
- Trapped focus while open; closes on outside click.
- Accessible: `role="dialog"`, `aria-modal`, label.

### Responsive layout

- Audit each page at breakpoints `sm`, `md`, `lg`, `xl`.
- Heat map: controls collapse into a sticky bottom bar on mobile.
- Countries table: horizontal scroll on narrow viewports; flag column sticky-left.
- Country detail: 1-column stack on mobile; multi-column on `md+`.
- Compare: cards wrap; charts use full width.
- Picker / nav drawer behavior on mobile.

### Dark mode (optional toggle)

- Tailwind `darkMode: 'class'`.
- Toggle in header; preference persisted to `localStorage` (single allowed exception to spec 04's "no persistence").
- Defaults to `prefers-color-scheme` on first load.
- Quartile palette has a dark variant maintaining WCAG AA contrast.
- All primitives audited for dark mode.

### Docs

- Real `README.md` with: project description, dataset attribution, install/run/build/test commands, `npm run transform` step, screenshot, deploy notes (deferred).
- Update `AGENTS.md` Commands section if anything changed.
- Add data attribution and license note ("Source data © Cato Institute").

## Non-goals

- New features.
- Performance work beyond what dark mode / responsive incidentally requires.
- I18n.

## Inputs

- Everything from specs 01–09.

## Outputs

- `src/components/SearchPalette.tsx`, `src/hooks/useHotkey.ts`.
- `src/components/ThemeToggle.tsx`, `src/hooks/useTheme.ts`.
- Updated Tailwind config with dark variants.
- Updated `README.md`, `AGENTS.md`.

## Acceptance criteria

1. `Cmd+K` opens the palette from any page; Esc closes; arrows + Enter navigate.
2. Search palette matches by country name or ISO3; case-insensitive; limited to 10 results.
3. Each page renders without horizontal overflow at viewport widths 360, 768, 1024, 1440 px.
4. Theme toggle switches all primitives and pages without contrast regressions; choice persists across reloads.
5. README has working commands; a fresh clone can go from zero to `npm run dev` using only the README.

## Test plan (TDD)

- `SearchPalette.test.tsx`: hotkey opens; arrow keys move highlight; Enter navigates; Esc closes; outside click closes.
- `useHotkey.test.ts`: registers and unregisters listeners; no leaks.
- `useTheme.test.ts`: defaults to media query; toggle updates `localStorage` and `<html>` class.
- Visual / responsive checks via Playwright or manual screenshots — automated test optional.
- README link-checker: simple script asserting the Cato URL returns 200 (skippable in offline CI).

## Dependencies

- Specs 01–09 (all). This is the last spec.

## Open questions

- Add Playwright for true responsive/E2E coverage? **Resolved: defer**; rely on RTL + manual sweep for v1.
