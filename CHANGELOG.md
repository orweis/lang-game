# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-20

This release upgrades the framework to clear known security advisories. That
upgrade is a breaking change for the development setup, hence the major
version. The game plays the same as before, apart from the fixes listed
below. See "Upgrading from 0.1.x" in the README.

### Breaking

- Next.js 14.2.35 → 16.4.6 and React 18 → 19 (React DOM, types and
  `eslint-config-next` upgraded to match).
- Node.js 22.12 or newer is now required (`engines` field and `.nvmrc`).
- ESLint 8 → 9 with flat config: `.eslintrc.json` is replaced by
  `eslint.config.mjs`, and `npm run lint` runs `eslint .` instead of the
  removed `next lint`.
- Removed the unused `useGameState` hook and the unused exports
  `CARD_VARIANTS`, `SPRING`, `MODE_COLORS`, `GameState` and `MatchPair`.

### Security

- Fixed all 16 `npm audit` findings (1 critical, 8 high, 7 moderate), most
  importantly the Next.js advisories that affected every 14.x release.
  `npm audit` now reports 0 vulnerabilities.
- Added security headers to every response: Content Security Policy
  (`frame-ancestors 'none'`, no third-party origins), `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.
- Removed the `X-Powered-By` header and disabled the unused image optimizer
  endpoint.
- `.gitignore` now ignores every `.env` file, not only `.env*.local`.
- Added `SECURITY.md`, Dependabot for npm and GitHub Actions, and a CI
  workflow with read-only permissions and actions pinned to commit SHAs.

### Fixed

- Letter cards for 17 of the 22 letters (all except א, ד, ו, י, מ) had no
  background colour: their Tailwind classes live in `src/data`, which
  Tailwind did not scan. The cards were white text on a near-white tile.
- Quiz: a wrong answer started a timer that was never cleared, so leaving or
  restarting the quiz within a few seconds could skip a question. All game
  timers are now cleared on unmount and restart.
- Quiz: the number of questions was hard-coded (15) instead of taken from the
  question list.
- Quiz and match: "Play again" repeated exactly the same questions or rounds.
  It now builds a new, shuffled session.
- Quiz and match: questions and rounds were generated during server
  pre-rendering and again in the browser, causing a hydration mismatch. They
  are now generated in the browser only.
- Quiz: in "which letter is this?" questions, letters with the same sound
  (kaf/qof, tet/tav) are no longer offered together, and word questions never
  show two choices with the same emoji.
- Match: when the number of letters did not divide evenly, a final single
  pair was silently dropped. It now joins the previous round, so every letter
  that has a word can appear. The word shown for each letter now varies
  between sessions.
- Match: two quick drops could read stale state; a drag interrupted by the
  browser (pointer cancel) left the card stuck. Both fixed.
- Celebration overlay: its timer restarted whenever the parent re-rendered.
- Pinch-zoom is no longer blocked (`maximum-scale=1` removed; WCAG 1.4.4).
  The viewport is now set through Next's `viewport` export.

### Added

- Test suite (Vitest, jsdom, Testing Library) with 135 tests covering data
  integrity, game logic, hooks, components and full game flows. Scripts:
  `test`, `test:watch`, `coverage`, `typecheck`, `check`.
- Keyboard play for the match game, a live region announcing match results,
  progress bar semantics, and `aria-pressed` on letter tiles.
- Per-page titles for the alphabet, match and quiz pages.
- `LetterId` type: a word's `firstLetter` is now checked at compile time.
- README rewrite, `CONTRIBUTING.md`, `SECURITY.md`, `.editorconfig`.

### Changed

- Game logic moved out of the page files into `src/lib/rounds.ts`,
  `src/lib/questions.ts` and `src/components/game/{MatchGame,QuizGame}.tsx`.
  Shared end-of-game screen extracted to `ResultScreen`.
- Hebrew UI strings, timings and game sizes are centralised in
  `src/lib/strings.ts` and `src/lib/constants.ts`.
- Stricter TypeScript settings (`noUnusedLocals`, `noUnusedParameters`).
- Removed the unused Geist font files.
- Other dependency updates: framer-motion 14, Tailwind CSS 3.4.19,
  PostCSS 8.5, TypeScript 5.9.

## [0.1.0]

- Initial version: alphabet explorer, drag-and-drop match game and quiz.
