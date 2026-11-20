# Contributing

Thanks for helping! A few notes to keep the game simple and safe for small
children.

## Setup

```bash
nvm use        # Node 22 (see .nvmrc)
npm ci
npm run dev
```

## Before opening a pull request

```bash
npm run check  # lint + typecheck + tests + production build
```

CI runs the same steps on Node 22 and 24.

## Guidelines

- **Content**: words and letters live in `src/data`. Keep vocabulary simple
  and suitable for toddlers, add niqqud, and have a Hebrew speaker check new
  entries and their pronunciation with a Hebrew text-to-speech voice.
- **Logic** belongs in `src/lib` as plain functions that accept an optional
  `rng`, so it can be tested with a fixed seed. Components should stay thin.
- **Timers**: keep any `setTimeout` in a ref and clear it on unmount. The tests
  check that no game timer fires after a screen is closed.
- **UI text** goes in `src/lib/strings.ts`; timings and sizes in
  `src/lib/constants.ts`.
- **Accessibility**: every control needs a Hebrew `aria-label` or visible
  text; keep touch targets at least 64px.
- **Privacy**: do not add analytics, tracking, network calls or third-party
  scripts. The CSP in `next.config.mjs` blocks them anyway.
- Record user-visible changes in `CHANGELOG.md`.
