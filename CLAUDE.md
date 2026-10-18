# Bubba Beep Beep

A personal HIIT / interval timer web app, built as a gift. Single static page, no build step, no backend. Hosted on GitHub Pages from the repo root.

## Files
- `index.html` — the whole app (markup, CSS, JS in one file). Edit this for any feature or copy change.
- `icon.svg` — source for the app icon (Bubba the stopwatch). Re-render `icon-180/192/512.png` from it with headless Chrome `--screenshot` after editing.
- `manifest.webmanifest`, `sw.js`, `icon-*.png` — installable web app bits (Add to Home Screen, offline cache). Bump the cache name in `sw.js` (`bubba-v5` → `bubba-v6`) whenever any app file changes. The page is fetched network-first, other files cache-first.
- `README.md` — install/hosting notes.

## How the app works
- Screens, all in one page driven by `S.screen`: `home` (presets + history) → `quick` (work/rest/intervals/rounds) or `builder` (named exercises with time per set, sets, set rest, reps label) → `run` → `summary`.
- Data model: `Workout {name, color, prep, rounds, restBetweenExercises, restBetweenRounds, exercises:[{name, dur, sets, reps, restBetweenSets}]}`. `compile(workout)` flattens it to an interval sequence `{kind: prep|work|rest|round, label, dur, set, sets, reps, round, next}`. Every step is time-based and fully hands-off; reps are a displayed/spoken label only.
- Timer engine uses absolute deadlines (`endAt`), ticks every 100 ms, carries overshoot so drift doesn't accumulate.
- Cues: Web Audio beeps (3-2-1 cute "beep beep" chirps (higher on the last second), two-tone on work start, low tone on rest, chime on finish) and `speechSynthesis` voice. `pickVoice()` prefers natural/premium English voices; the user can override in the gear menu. Voice lines are personalised with `settings.nick` (default "Bubba").
- Persistence: `localStorage` keys `cadence.presets`, `cadence.history`, `cadence.settings`. Wrapped in try/catch; the app must work without storage.
- Theme: all colours are CSS tokens on `:root` with dark overrides via `prefers-color-scheme` and `[data-theme]`. Phase colours: prep amber, work green, rest blue, round-break purple.
- Fonts: Instrument Sans for UI, Inter (tabular nums) for every number via the `.num` class.

## Conventions
- Keep it a single `index.html`; don't introduce a bundler or framework.
- Mobile first (~390 px wide). Must work when added to the iPhone Home Screen.
- No external requests except Google Fonts. No analytics, no accounts.
- Test by opening `index.html` directly in a browser; the service worker only activates over HTTPS or localhost.

## Deploy
Push to `main`. GitHub Pages serves the root at https://crayon-labs.github.io/Bubba-Beep-Beep/ (Settings → Pages → Deploy from a branch → main / root).

## Roadmap ideas (from the original research)
Live Activities / Dynamic Island, Apple Watch, HealthKit — all need a native SwiftUI port; this web app is the spec for it.
