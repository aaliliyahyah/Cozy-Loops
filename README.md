
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
- `tests/unit` and `tests/helpers`: progress, storage, and row editing suites with shared fixtures.

See [the architecture guide](docs/ARCHITECTURE.md) for the folder tree, placement rules, and import conventions.

React state drives what you see. A synchronous reference stores the newest data before React renders, so rapid taps cannot calculate from an old count. Every change is enqueued for persistence. A single queue writes in order; its revision tracking shows Saved only when the newest change has finished writing. Screens never call AsyncStorage directly.

Each project copies its pattern when it starts. Editing the original changes future projects, while an ongoing project keeps its own instructions. Per-row count and completion records let you revisit rows without resetting them. Up to 100 previous progress snapshots implement repeated Undo and are saved alongside the project. Counting stops at an explicit stitch target; rows without targets remain unrestricted.

## Features

Create and search patterns, save incomplete drafts, paste text or import a local text PDF for review, duplicate and collapse instruction rows, attach local photos, start independent projects, count stitches, complete rows, undo the latest supported action after reopening, resume saved progress, finish projects, and browse 12 glossary guides with US/UK naming preferences. Patterns support favorites, yarn colors, multiple hook sizes, other tools, and part labels with per-row material choices. The Projects tab provides searchable active and finished libraries, with counters nested beneath it.

New patterns use rows; saved round patterns and project snapshots retain their terminology. Patterns use explicit written instructions; no notation is interpreted automatically. Search is local. No account or network service is used by the app.

## Storage and known limits

Data is stored locally using AsyncStorage and is not a cloud backup. Removing the app or clearing its data can remove your projects. Saves are asynchronous: only successfully saved progress is guaranteed after a restart. Failure is shown with a Retry action. Invalid stored data is preserved and blocks editing rather than silently replacing it with empty data.

Glossary guides explicitly state that illustrations are pending; see [the asset checklist](docs/ASSET_CHECKLIST.md). Text instructions are bundled. No placeholder is presented as a verified stitch diagram. Font packages bundle their font files; license copies are in `assets/fonts`.

Photos are copied to persistent document storage on native platforms. Browser previews store selected images as data URIs. Photos are kept conservatively because existing project snapshots may still reference them.

See [manual acceptance checks](docs/TESTING.md) for device, accessibility, restart, and offline scenarios. Automated pure-domain tests cover counting, Undo, independent projects, snapshot isolation, corrupted storage, ordering, failure, and interrupted saves; they do not replace native device testing.

## Redesign

See [design sources and verification](docs/UI_REDESIGN.md) and the [shared design system](docs/DESIGN_SYSTEM.md). Existing storage is backed up under `cozy-stitch:data:v1:before-redesign` before migrated data can be written. Active legacy counts and Undo snapshots are capped to explicit row targets; completed records are preserved.

## Publish an iPhone preview

Publish a hosted update from this directory (Expo SDK 58 requires the environment flag):

```sh
npm run update:ios -- --message "Latest Cozy Loops preview"
```

Open the resulting update page on your iPhone and choose the Expo Go preview using an Expo Go version compatible with SDK 58. The hosted bundle does not need a running laptop. Custom development builds can also open compatible updates from their launcher.

Keep `'use dom'` at the start of `PdfTextReader.tsx`: it isolates PDF.js in a browser runtime. Removing it puts browser-only imports into the Hermes mobile bundle and breaks export. Web assets for this DOM component are still required when publishing only iOS.

## Publish a public web preview

Public preview: https://cozy-loops.expo.app

Export and deploy the browser version to Expo Hosting:

```sh
npx expo export --platform web --max-workers 2
npx eas-cli@latest deploy --prod --environment production
```

The deployment prints a public production URL that does not require a running development server or simulator session. Re-run both commands to publish changes. Browser data is saved separately in each visitor's browser.

## Share a public browser simulator preview

Build a standalone iOS Simulator app with its JavaScript and assets bundled:

```sh
npx eas-cli@latest build --platform ios --profile preview-simulator
```

After the build finishes, use its build ID to start a public Expo Simulators session:

```sh
npx eas-cli@latest simulator:start --platform ios --type web-preview-only --build-id <build-id> --public-link --name "Cozy Loops preview" --non-interactive
```

Share the preview URL printed by the command. Anyone with the link can use the same simulator without an Expo login. The app runs without a local development server. The link expires when the session stops or reaches the account plan's maximum session duration. Expo Simulators access must be enabled for the account.

Stop the session using the session ID printed by the start command:

```sh
npx eas-cli@latest simulator:stop --id <session-id> --non-interactive
```

See [Expo's simulator sharing guide](https://expo.dev/articles/cloud-simulators/share-a-simulator-link).

## PDF import

Open the editor import button, choose Paste Text or Import PDF, then review the extracted text. Each nonempty reviewed line becomes one row. Import asks before replacing written rows and never saves the pattern automatically. Text PDFs are processed locally, with no upload or OCR. Limits: 20 MB, 100 pages, and 200,000 characters. Locked, empty, scanned, and invalid PDFs show errors; use Paste Text when extraction is unavailable.

Native PDF import requires a development build because Expo Go does not include the PDF extraction module. Paste Text remains available in Expo Go. `eas.json` includes internal development and iOS simulator profiles:

```sh
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest build --profile development --platform ios
npx expo start --dev-client
```

EAS may first require account/project configuration and signing credentials. Native compilation and device PDF extraction still require verification; JavaScript exports do not establish that the native module works on a device. Browser imports use PDF.js with a local worker copied into `public/` during `npm install`; no CDN is used. Run `npm run postinstall` if that generated worker is missing.
