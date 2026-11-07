# Cozy Stitch modification implementation

The shared page header and library cards now provide consistent spacing, typography, image sizing, and card bodies. Back controls use the same accessible left arrow with a 44-point minimum target.

Home opens the Projects tab directly. Continue opens the selected counter with its Home origin, uses centered text without an arrow, and fills the card width. The pattern shelf fits two complete cards at rest and scrolls horizontally.

The counter exposes Minus and Undo, retains counts when revisiting rows, guards rapid row completion, and keeps explicit project finishing. The Stitch Guide and Project Tools panels have been removed. Patterns and completed projects remain independent records.

New patterns use rows. Legacy rounds, difficulty metadata, and existing project snapshots are retained without exposing difficulty controls. Saved rows start collapsed; new and duplicated rows expand. Duplicate copies all row details below the original with a fresh ID and sequential numbering. Ready-save validation expands the first empty instruction.

The import modal offers Paste Text and Import PDF, local extraction, editable review, replacement confirmation, loading, review-ready feedback, and errors. Import never automatically saves. PDF limits are 20 MB, 100 pages, and 200,000 characters; image-only PDFs require pasted instructions. PDF.js is loaded on demand on web and uses a locally generated worker. Native extraction uses the installed native module and needs a development build; Expo Go retains Paste Text and displays an explanation. Development build profiles are in `eas.json`.

## Verification

- Unit tests: 20 passing, including row duplication, imported text validation, rapid counts, Undo, snapshots, and persistence.
- TypeScript: passed.
- ESLint with zero warnings: passed.
- iOS, Android, and web JavaScript exports: passed.
- Chrome at 390 and 320 px: passed Home origin and browser Back, full-width Continue, counter increments/decrement/target cap, Undo after reload, library search/favorites, glossary navigation, editor save/reopen, duplication with materials, collapsed rows, reviewed imports, deletion, unsaved-edit cancellation, and retained pattern/completed project. No page errors occurred.
- Browser PDF import: the supplied modification PDF extracted successfully into editable review. Corrupt, image-only, over-100-page, and over-20 MB fixtures were rejected without saving or replacing rows. Text size validation is also covered by unit tests.
- Native compilation, device extraction, VoiceOver/TalkBack, and large system text still require the device checks in [TESTING.md](TESTING.md). No native device execution is claimed by JavaScript export success.
