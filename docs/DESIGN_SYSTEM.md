# Cozy Loops design system

The three requested skills guide the implementation: frontend-design for the visual direction, design-mobile-apps for the Sleek reference screens and native conversion, and tailwind-design-system for token hierarchy, reusable variants, and accessible states.

The existing React Native StyleSheet system is retained. Tailwind classes in the Sleek HTML are translated into native styles; Tailwind, NativeWind, and a web component library are not added.

## Tokens and components

`src/theme/index.ts` owns semantic colors, spacing, type sizes, fonts, radii, shadows, and motion durations. Cream and paper are the surfaces; olive identifies selection and primary progress; blush and sage identify secondary information; brown anchors readable text. Lora headings, Nunito body text, and the Caveat wordmark preserve the app's identity.

`cozy-ui` supplies text, buttons, fields, photos, screen wrappers and progress. `library-ui` supplies library screens, virtualized two-column grids, search, filter chips, favorite/icon controls, and image cards. Library cards retain half-width when filtering to one item. Controls expose names and selected/disabled states and have at least 44 dp touch areas.

The curved gingham ribbon is the primary decorative motif. Other structure comes from photographs, part labels, row order, and progress. Tab motion responds to interaction and respects reduced motion. Keyboard-visible native forms hide the custom navbar; screens inset only the edges not covered by navigation.

## Deliberate corrections to the mockups

The Sleek HTML refers to action/surface/paper colors without defining all their Tailwind aliases and uses Caveat without loading it. The native theme resolves these to the existing app palette and bundled font. Mockup content, images, counts, and completion states are replaced by local application data; no example patterns are inserted into users' storage. Unavailable stitch illustrations are identified as pending rather than replaced by invented diagrams.
