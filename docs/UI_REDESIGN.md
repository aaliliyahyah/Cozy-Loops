# Cozy Loops redesign

The implementation follows `modify.pdf` and the supplied yarn/checklist/heart logo. It preserves the app's local data, bundled fonts, original palette, and crochet identity.

## Design sources

[Sleek project](https://sleek.design/project/QcPXPQOiDyH): Home (`0jlas4crLEO`), Patterns library (`0VxByQMl8bN`), Pattern details (`9rNRUoqrGVi`), and Stitch counter (`FMNQvqYFkhq`), all version 1. Their HTML was fetched before native conversion. Phone previews and full-height review renders are saved in `docs/designs`; [combined overview](designs/all-phone.png).

Sleek exhausted its available credits before creating the other four screens. Add/Edit Pattern, Projects, Glossary, and Stitch Guide adapt the completed designs' shared layouts and native controls locally. No second design run completed and no additional generated screens are claimed.

See [design-system decisions](DESIGN_SYSTEM.md) for token mapping, component conventions, and corrections to unresolved mockup colors/fonts.

## Implemented behavior

- Five animated navbar destinations: Home, Patterns, Add pattern, Projects, Glossary. Settings is accessible from Home.
- Branded Home header, larger featured project image, project description, and horizontal pattern/glossary shelves.
- Two-column virtualized libraries with search; pattern status/difficulty filters and persisted favorites; active/finished project selection.
- Materials, colors, multiple hooks, tools, part labels, and row-specific selections in the editor, details, and project snapshots. Existing drafts, import review, row tools, and save-error recovery remain available.
- Projects opens a library; Continue opens its selected nested counter, and Back returns to that library. Legacy project and new-pattern links redirect to the new destinations.
- Target-limited counting and persisted repeated Undo (latest 100 supported actions). Legacy active counts and histories are normalized with an original-data backup before subsequent writes. Finished projects remain unchanged.
- The supplied artwork is bundled for Home, launcher, splash, and favicon. No example patterns or projects are inserted into initial app data.

## Verification

- Lint and typecheck passed.
- All 18 pure-domain tests passed, including targets, zero targets, repeated Undo, history limits, migration, materials, snapshot isolation, serialization, and failed/interrupted saves.
- iOS, Android, and web export passed. Export proves bundling, not native rendering or runtime interaction.
- Full browser checks passed for five tabs, favorites, pattern materials, selected nested counters, target limits, repeated Undo after reload, Back to library, and a 320 px counter layout. Project search, glossary search/guide navigation, editor save/reopen, per-row materials, reviewed import, row deletion, and draft saving passed with no page errors. Screenshot checks used isolated fixture data, never the user's browser profile.
- The final production-build pass also verified cancel/discard protection after saving, legacy project/new-pattern links, finishing a project, Finished filtering, Home-to-Settings access, and the original-storage backup. The production preview runs at http://localhost:8084.

The SDK 58 development renderer retained stale module IDs after hot updates during verification. The final checks used `npx expo export --platform all` followed by `npx expo serve --port 8084`, avoiding the development renderer's cache. A development server showing an unknown-module error should be restarted with `npx expo start --clear`.

## App screenshots

[Home](ui-home-mobile.png), [Patterns](ui-patterns-mobile.png), [Projects](ui-projects-mobile.png), [Counter](ui-count-mobile.png), [Editor](ui-editor-top.png), [Glossary](ui-glossary-mobile.png), and [Stitch guide](ui-stitch-guide.png).

Native iOS/Android devices, VoiceOver/TalkBack, system large text, keyboard/insets, photo permissions, and installed launcher/splash behavior require device verification. See [manual acceptance checks](TESTING.md).
