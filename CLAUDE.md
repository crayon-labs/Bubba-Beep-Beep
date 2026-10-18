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
- Timer engine uses absolute deadlines (`endAt`), ticks every 50 ms, carries overshoot so drift doesn't accumulate.
- Cues: Web Audio beeps (3-2-1 countdown plays an embedded recorded "beep" clip, `BEEP_WAV`, scheduled on the AudioContext clock so each lands on the second; higher on the last second; chirp fallback until it decodes, two-tone on work start, low tone on rest, chime on finish) and `speechSynthesis` voice. `pickVoice()` prefers natural/premium, warm female English voices over male and novelty ones, spoken at a slightly raised pitch; the user can override in the gear menu. Voice lines are personalised with `settings.nick` (default "Bubba"); the start ("Buuubba, let's get ready!") and finish ("Great work, Buuubba!") lines stretch the first vowel via `aww()` and use the softer `SWEET` pitch/rate.
- Move tutorials: during rest, get-ready and round breaks the run screen shows the next exercise as a looping stick figure plus a one-line form cue. `MOVES` holds two poses per move (tweened, side view unless `front`), `MOVE_RULES` maps exercise names to moves by keyword (first match wins, fallback `march`). Add a move + rule when adding exercises that don't match.
- Audio session: `setSession()` uses `'ambient'` so iOS mixes cues with Spotify/other music (but follows the silent switch); the "Sound on silent" setting (`settings.loud`) switches to `'playback'`, which plays on silent but pauses music. If the AudioContext isn't running when a countdown beep is due, it's spoken instead.
- Encouragement: halfway through each work set of 20s+, a line from `CHEERS` is spoken (shuffled deck, no repeats until exhausted).
- Seed presets: Full Body Circuit plus a Pilates-strength set (Full Upper Body, Chest, Back, Core & Abs Burn, Legs). New seed presets reach existing devices via `cadence.seedIds`; deleted ones aren't revived. Retired seeds (`RETIRED`: Classic Tabata, Kettlebell Strength) are removed once via `cadence.retired`.
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
