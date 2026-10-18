# Bubba Beep Beep

A personal HIIT / interval timer web app, built as a gift. Single static page, no build step, no backend. Hosted on GitHub Pages from the repo root.

## Files
- `index.html` — the whole app (markup, CSS, JS in one file). Edit this for any feature or copy change.
- `icon.svg` — source for the app icon (Bubba the stopwatch). Re-render `icon-180/192/512.png` from it with headless Chrome `--screenshot` after editing.
- `manifest.webmanifest`, `sw.js`, `icon-*.png` — installable web app bits (Add to Home Screen, offline cache). Bump the cache name in `sw.js` (`bubba-v5` → `bubba-v6`) whenever any app file changes. The page is fetched network-first, other files cache-first.
- `README.md` — install/hosting notes.

## How the app works
- Screens, all in one page driven by `S.screen`: `welcome` (first run only: step 1 name, default Bubba; step 2 pick equipment; `cadence.onboarded` is false until Continue, true after, and set true for existing users) → `home` (4 most recently used or saved workouts via `lastUsed`, "See all" sheet; 3 most recent history sessions with a "See all" sheet) → … `summary` (completed workouts get falling hearts plus a time-based confetti burst) → `quick` (work/rest/intervals/rounds) or `builder` (named exercises with time per set, sets, set rest, reps label) → `run` → `summary`.
- Data model: `Workout {name, color, prep, rounds, restBetweenExercises, restBetweenRounds, exercises:[{name, dur, sets, reps, restBetweenSets}]}`. `compile(workout)` flattens it to an interval sequence `{kind: prep|work|rest|round, label, dur, set, sets, reps, round, next}`. Every step is time-based and fully hands-off; reps are a displayed/spoken label only.
- Timer engine uses absolute deadlines (`endAt`), ticks every 50 ms, carries overshoot so drift doesn't accumulate.
- Cues: Web Audio beeps (3-2-1 countdown plays an embedded recorded "beep" clip, `BEEP_WAV`, scheduled on the AudioContext clock so each lands on the second; same pitch each second; chirp fallback until it decodes, two-tone on work start, low tone on rest, chime on finish) and `speechSynthesis` voice. `pickVoice()` prefers natural/premium, warm female English voices over male and novelty ones, spoken at a slightly raised pitch; the user can override in the gear menu. Voice lines are personalised with `settings.nick` (default "Bubba"); the start ("Buuubba, let's get ready!") and finish ("Great work, Buuubba!") lines stretch the first vowel via `aww()` and use the softer `SWEET` pitch/rate.
- Move tutorials: during rest, get-ready and round breaks the run screen shows the next exercise as a looping stick figure plus a one-line form cue. `MOVES` holds two poses per move (tweened, side view unless `front`), `MOVE_RULES` maps exercise names to moves by keyword (first match wins, fallback `march`). Add a move + rule when adding exercises that don't match.
- Exercise library: `LIB` lists 15 common exercises for each of Chest, Back, Shoulders, Arms, Core, Legs, Glutes, Full body (cardio), Pilates (classical mat) and Mobility (189 total, including equipment-specific moves for TRX, bands, kettlebell, cable/weight machines, pull-up bar, stability ball, medicine ball and cardio machines). The builder's exercise-name field opens a searchable dropdown of it (thumbnail via `figSVG`), "Browse library" opens a sheet with body-part filters, and each exercise card shows its move's thumbnail. New library names need a matching `MOVE_RULES` entry (or a new move).
- Equipment: `EQUIP` lists 14 equipment types; `EQ` tags each library exercise with what it needs (space = all of, `|` = any of; untagged = bodyweight). Settings → My equipment (`settings.equip`, defaults to everything) filters the library sheet and the name dropdown; the sheet notes how many are hidden.
- Background: the timer runs off absolute deadlines, so time keeps passing when the app is backgrounded; on return, `tick` skips fully elapsed intervals silently and announces only the current one. With Settings → "Notification when you leave" (`settings.notify`, asks permission), leaving mid-workout shows a notification with the current step, its end clock time and what's next (tag `bubba-run`, cleared on return; `sw.js` handles notificationclick). iOS freezes the page in the background, so cues don't play there and the notification is a snapshot; it needs the Home Screen install.
- Run screen extras: "+10s rest" during rest/get-ready/round breaks (extends that interval, repeatable) and "Restart exercise" during work (restarts the interval via `skip(0)`).
- Audio session: `setSession()` uses `'ambient'` so iOS mixes cues with Spotify/other music (but follows the silent switch); the "Sound on silent" setting (`settings.loud`) switches to `'playback'`, which plays on silent but pauses music. If the AudioContext isn't running when a countdown beep is due, it's spoken instead.
- Encouragement: halfway through each work set of 20s+, a line from `CHEERS` is spoken (shuffled deck, no repeats until exhausted).
- Seed presets: Full Body Circuit, a Pilates-strength set (Full Upper Body, Chest, Back, Core & Abs Burn, Legs) and Mat Pilates Flow (classical mat order). New seed presets reach existing devices via `cadence.seedIds`; deleted ones aren't revived. Retired seeds (`RETIRED`: Classic Tabata, Kettlebell Strength) are removed once via `cadence.retired`.
- Ending a workout takes two taps: the first arms "End workout" for 3s (`data-armed`, timeout on `S.endArm`), the second within that window calls `finishRun(false)`.
- Session duration excludes paused time: `togglePause` tracks `R.pausedAt`/`R.pausedMs`, and `finishRun` also subtracts a pause still open when the workout is ended.
- Previous works like a music player: more than 3s into the interval (or on the first interval) it restarts the current one (`skip(0)`), otherwise it goes back one (`skip(-1)`).
- Haptics: `vib()` buzzes on work start, rest and finish (and on arming End). iOS Safari ignores `navigator.vibrate`, so this is Android only.
- Update toast: when a new service worker installs over an existing one, a persistent "New version ready · Tap to update" toast reloads the page. Bumping the cache name in `sw.js` is still what triggers it.
- Dumbbell weights: `usesDB(name)` (equipment tag, name, or a dumbbell drawn on a non-bodyweight move) decides which exercises log weight. During a rest after one, the run screen asks for the kg used (`R.weights`; focusing the box auto-pauses the timer and blur resumes it via `R.autoPaused`), prefilled from this session or `lastWeight()` (same workout id, else name). History entries store `wid` and `weights` (null = not entered, shown as –); the summary screen lets you fill in or fix them. History → "Weight progress" charts one exercise's weight over time (single-series SVG line, tap a point for its value, table below).
- Muscle focus: during each work interval the run screen shows a flat 2D front/back body map (`bodyMap`) with main muscles in the phase colour and supporting ones lighter, plus their names and the move's cue. `MOVE_MUSCLES` maps each move to muscles; `MUSCLE_RULES` overrides by exercise name where the drawn move differs (pull-ups, pushdowns, leg curls…).
- Form tips: `TIPS` holds 3 researched tips per movement (97 movements; first source per movement in `TIP_SRC`). `tipsFor(name)` picks them via `TIP_RULES` (first match; `null` = no sourced tip fits, so none shown rather than a near-miss; a third value skips tips, e.g. bodyweight squats drop the weight tip), else the move's tips (never the `march` fallback). The Focus card rotates tips every 6s; on sets of 30s+ the voice reads one at the 25% mark. Add sourced tips when adding exercises, don't invent them.
- Settings → Test sounds plays the 3-2-1 countdown, to check the silent switch / Sound on silent.
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
