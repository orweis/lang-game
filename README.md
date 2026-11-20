# לומדים עברית · Let's Learn Hebrew

A small, colourful web game that helps toddlers and young children learn the
Hebrew alphabet. Big touch targets, spoken feedback and no reading required
from the child. The whole interface is in Hebrew and laid out right-to-left.

It is a [Next.js](https://nextjs.org) App Router app that runs entirely in the
browser: there is no backend, no account, no tracking, and nothing is stored.

## Game modes

| Route       | Mode                         | What the child does                                                                                                                       |
| ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/alphabet` | **אָלֶף-בֵּית** (Alphabet)  | Tap any of the 22 letters to hear its name, or press "play all" to hear them in order.                                                    |
| `/match`    | **הַתְאֵם** (Match)          | Drag each letter onto the picture-word that starts with it. Rounds of four pairs, with a celebration between rounds.                       |
| `/quiz`     | **חִידוֹן** (Quiz)           | 15 questions, three kinds: pick a letter's name, pick the word for an emoji, and pick the letter whose name is spoken. Shows a score at the end. |

"Play again" in the match game and the quiz starts a newly shuffled session.

### Sound

Speech uses the browser's built-in
[Web Speech API](https://developer.mozilla.org/docs/Web/API/SpeechSynthesis)
(`speechSynthesis`), so it needs no network and no API key. For it to sound
right, the device needs a **Hebrew (he-IL) text-to-speech voice**:

- iOS / iPadOS and macOS include one (Carmit).
- Android: install Hebrew for the Google text-to-speech engine.
- Windows: add the Hebrew language pack with speech.

Without a Hebrew voice the browser falls back to its default voice, which may
mispronounce or skip the Hebrew text. Without `speechSynthesis` at all, the
games still work, silently.

### Accessibility

- Every control has a Hebrew label; progress is exposed as a progress bar.
- The match game can be played with a keyboard: focus a letter and press
  Enter or Space to select it, then focus a word and press Enter or Space.
- Correct and wrong answers in the match game are announced through a live
  region.

## Requirements

- Node.js **22.12 or newer** (see `.nvmrc`; CI tests Node 22 and 24)
- npm 10+
- Network access to Google Fonts **at build time only**: `next/font`
  downloads the Heebo font during `npm run build` and serves it from the app.

## Getting started

```bash
npm ci          # install exact dependency versions from package-lock.json
npm run dev     # start the dev server on http://localhost:3000
```

### Scripts

| Script               | What it does                                                       |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | Development server with hot reload.                                |
| `npm run build`      | Production build (all routes are pre-rendered as static pages).    |
| `npm start`          | Serve the production build (`npm run build` first).               |
| `npm run lint`       | ESLint (flat config in `eslint.config.mjs`).                       |
| `npm run typecheck`  | TypeScript type check without emitting files.                      |
| `npm test`           | Run the unit and component tests once (Vitest + Testing Library). |
| `npm run test:watch` | Run tests in watch mode.                                           |
| `npm run coverage`   | Run tests with a V8 coverage report in `coverage/`.                |
| `npm run check`      | Lint, typecheck, test and build: the same steps CI runs.           |

## Project layout

```
src/
  app/                 Routes (App Router). Pages are thin server components.
    layout.tsx         Root layout: Hebrew/RTL, Heebo font, viewport.
    alphabet|match|quiz/page.tsx
  components/
    game/              Game screens and pieces (AlphabetGrid, MatchGame,
                       MatchBoard, QuizGame, QuizQuestion, ...)
    layout/            GameShell (page frame + home button), HomeScreen
    ui/                Generic UI: BigButton, ProgressBar, CelebrationOverlay,
                       ResultScreen, BackButton
  data/                The 22 letters (alphabet.ts) and the word list (words.ts)
  hooks/               useAudio (speech), useDragTouch (pointer drag & drop),
                       useIsClient (hydration-safe client check)
  lib/                 Game logic with no React: buildMatchRounds (rounds.ts),
                       buildQuizQuestions (questions.ts), shuffle helpers
                       (utils.ts), shared constants, timings and UI strings
  types/               Shared TypeScript types
test/                  Test setup and helpers (fake speechSynthesis, seeded RNG)
```

The game logic in `src/lib` takes an optional random-number generator, so the
tests can run it with a fixed seed.

## Adding words or changing content

1. Add an entry to `src/data/words.ts`. `firstLetter` must be one of the
   letter ids from `src/data/alphabet.ts`; TypeScript rejects anything else.
2. Run `npm test`. The data tests check that ids are unique, that
   `firstLetter` really is the first letter of the word (niqqud ignored), and
   that every field is filled in.

Each letter in `alphabet.ts` has a Tailwind background class (`color`).
`tailwind.config.ts` scans `src/data`, so any standard Tailwind colour class
works there.

## Testing

```bash
npm test
```

The suite (Vitest, jsdom, Testing Library) covers:

- **Data integrity**: the alphabet and the word list.
- **Game logic**: shuffling, distractor choice, match-round building (every
  letter reachable, leftovers merged), quiz building (right mix of types, one
  correct answer, no same-sounding letters together).
- **Hooks**: speech synthesis with a fake `speechSynthesis`, including voice
  selection, errors and cleanup; pointer drag and drop including cancel.
- **Components and games**: quiz and match flows end to end with fake timers,
  scoring, restart, keyboard matching, and that no timer fires after unmount.

## Deployment

`npm run build` produces a standard Next.js build; every route is static.
Deploy it to any Node.js host (`npm start`) or a platform that supports
Next.js.

`next.config.mjs` sets security headers on every response: a Content Security
Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a strict
`Referrer-Policy` and a `Permissions-Policy` that turns off camera, microphone
and location. It also removes the `X-Powered-By` header and disables the image
optimizer, which the app does not use. If you host the app behind a CDN that
adds its own headers, check that the two sets do not conflict. See
[SECURITY.md](SECURITY.md).

## Upgrading from 0.1.x

Version 1.0.0 moved to new major versions of the framework and tooling. The
game itself behaves the same, but your development setup has to change:

- **Node.js 22.12+** is required (was 18.17+). The floor comes from the dev
  tooling (Vitest); Next.js 16 itself only needs Node 20.9+, so a pre-built app
  can still run on Node 20.9+ if you need it to.
- **Next.js 16 and React 19** (were Next 14 and React 18). Custom code that
  relied on React 18-only APIs needs updating.
- **ESLint 9 flat config**: `.eslintrc.json` is replaced by
  `eslint.config.mjs`, and `npm run lint` now runs `eslint .` (Next 16 removed
  `next lint`).
- `src/hooks/useGameState.ts` was removed (nothing used it). The page files no
  longer contain game logic; it lives in `src/components/game/*Game.tsx` and
  `src/lib`.

Run `rm -rf node_modules .next && npm ci` after pulling. See
[CHANGELOG.md](CHANGELOG.md) for the full list.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

No license has been chosen for this project yet. Until one is added, all
rights are reserved by the author. The Heebo font is licensed under the SIL
Open Font License.
