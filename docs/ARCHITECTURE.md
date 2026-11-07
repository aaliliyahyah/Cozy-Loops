# Project structure

Cozy Loops uses a feature-first Expo Router structure. Routes describe navigation; features own screens and domain behavior; shared modules provide presentation, state, and persistence.

```text
src/
  app/                    Expo Router routes and route parameter adapters
  navigation/             Root and tab navigator configuration
  providers/              Application initialization and shared state
  features/
    home/
      components/         Home header
      screens/            Home screen
    patterns/
      model/              Pure pattern validation
      screens/            Library, details, and editor screens
    projects/
      components/         Project card
      model/              Pure project progress and Undo rules
      screens/            Library, counter, and completion screens
    glossary/
      data/               Bundled stitch guides and terminology
      screens/            Glossary and guide screens
    settings/
      screens/            Preference screen
  components/
    ui/                   Small reusable presentation components
    layout/               Safe-area and keyboard-aware screen wrapper
    library/              Reusable library grids, cards, search, and controls
  services/
    storage/              Stored-data validation, migration, write queue
  theme/                  Tokens, bundled font configuration, font readiness
  types/                  Shared persisted-data contracts
  utils/                  Small shared helpers
tests/
  helpers/                TypeScript registration and domain fixtures
  unit/                   Progress and storage test suites
assets/                   Bundled artwork and font licenses
docs/                     Architecture, design references, acceptance checks
```

## Placement and imports

- Files in `src/app` export screens/navigators or adapt route parameters and redirects. Add stateful UI and domain logic under the relevant feature. ESLint prevents routes from importing shared UI, providers, storage, theme, or data types directly.
- Screens compose feature components and shared UI. Feature-specific components stay inside their feature; reusable controls belong in `components`. Do not add shared helpers to a feature simply because that feature used them first.
- Navigators own shared chrome and screen relationships. `AppProviders` loads fonts and installs safe-area, font-readiness, and application-state providers before navigation renders.
- `AppProvider` owns shared state, storage hydration, backup orchestration, and save status. Features update it through `useApp`; the storage service supplies validation, migration, and the serialized write queue. The storage key, migration backup, and data shape are unchanged by this reorganization.
- Domain models are plain TypeScript, independent of React and native runtimes. ID generation lives in `utils/id.ts`; pattern readiness lives with patterns, while progress and Undo live with projects.
- Use the configured `@/` alias for app-wide imports and `@/assets/` for bundled assets. Relative imports are appropriate for nearby shared components and pure model dependencies that also run in Node tests. Import shared components directly instead of through a growing barrel module.
- Use descriptive PascalCase screen/component filenames; keep hooks/utilities/domain modules descriptive and local to their purpose. Add new folders only when their contents justify them.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm test`. The existing 18 domain tests are split into progress and storage suites, with shared fixtures and TypeScript setup under `tests/helpers`. Export all platforms after route or asset moves: `npx expo export --platform all`.

Route URLs and legacy redirects remain unchanged. Native device checks still require an available device or emulator; exports alone verify bundling.
