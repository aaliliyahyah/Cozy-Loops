
# Cozy Loops

Your cozy crochet companion. An offline-first React Native / Expo SDK 58 application for iOS and Android.

## Run

```sh
npm install
npx expo start
```

Use a matching Expo Go client where supported by the installed native modules, or an Expo development build. Scan the QR code from a physical phone on the same network. On Windows, use a physical iPhone for iOS testing, or a cloud development build; a local iOS simulator requires macOS. Core offline testing requires an installed build with its JavaScript and assets bundled, rather than a dependency on Metro.

```sh
npx expo lint
npx tsc --noEmit
npm test
npx expo-doctor
npx expo export --platform all
```

## Project structure

The app uses a feature-first structure with thin Expo Router routes:

- `src/app`: route exports, parameter adapters, and legacy redirects.
- `src/features/<feature>`: feature screens, components, domain models, and bundled feature data.
- `src/components`: reusable UI primitives, screen layouts, and library components.
- `src/navigation`: root and five-tab navigator configuration.
- `src/providers`: application initialization, shared state, hydration, and save status.
- `src/services/storage`: validation, migration, and serialized persistence.
- `src/theme`, `src/types`, and `src/utils`: design tokens/fonts, shared contracts, and helpers.
- `tests/unit` and `tests/helpers`: progress/storage suites and shared fixtures.

See [the architecture guide](docs/ARCHITECTURE.md) for the folder tree, placement rules, and import conventions.

React state drives what you see. A synchronous reference stores the newest data before React renders, so rapid taps cannot calculate from an old count. Every change is enqueued for persistence. A single queue writes in order; its revision tracking shows Saved only when the newest change has finished writing. Screens never call AsyncStorage directly.

Each project copies its pattern when it starts. Editing the original changes future projects, while an ongoing project keeps its own instructions. Per-row count and completion records let you revisit rows without resetting them. Up to 100 previous progress snapshots implement repeated Undo and are saved alongside the project. Counting stops at an explicit stitch target; rows without targets remain unrestricted.

## Features

Create and search patterns, save incomplete drafts, paste and manually review instructions, attach local photos, start independent projects, count stitches, complete rows, undo the latest supported action after reopening, resume saved progress, finish projects, and browse 12 glossary guides with US/UK naming preferences. Patterns support favorites, yarn colors, multiple hook sizes, other tools, and part labels with per-row material choices. The Projects tab provides searchable active and finished libraries, with counters nested beneath it.

Patterns use explicit row or round instructions; no notation is interpreted automatically. Search is local. No account or network service is used by the app.

## Storage and known limits

Data is stored locally using AsyncStorage and is not a cloud backup. Removing the app or clearing its data can remove your projects. Saves are asynchronous: only successfully saved progress is guaranteed after a restart. Failure is shown with a Retry action. Invalid stored data is preserved and blocks editing rather than silently replacing it with empty data.

Glossary guides explicitly state that illustrations are pending; see [the asset checklist](docs/ASSET_CHECKLIST.md). Text instructions are bundled. No placeholder is presented as a verified stitch diagram. Font packages bundle their font files; license copies are in `assets/fonts`.

Photos are copied to persistent document storage on native platforms. Browser previews store selected images as data URIs. Photos are kept conservatively because existing project snapshots may still reference them.

See [manual acceptance checks](docs/TESTING.md) for device, accessibility, restart, and offline scenarios. Automated pure-domain tests cover counting, Undo, independent projects, snapshot isolation, corrupted storage, ordering, failure, and interrupted saves; they do not replace native device testing.

## Redesign

See [design sources and verification](docs/UI_REDESIGN.md) and the [shared design system](docs/DESIGN_SYSTEM.md). Existing storage is backed up under `cozy-stitch:data:v1:before-redesign` before migrated data can be written. Active legacy counts and Undo snapshots are capped to explicit row targets; completed records are preserved.
