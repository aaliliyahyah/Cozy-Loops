# Manual acceptance checks

Run on both an iOS and Android device or simulator. Record device, OS, app build, result, and any issue. These are checks to perform, not claims of completed device testing.

1. Fresh installation: Home, Patterns, Add pattern, Projects, and Glossary tabs. Settings opens from Home. Projects opens a searchable In progress/Finished library. Continue opens the selected project counter within that tab; Back to library returns to the project list.
2. Add a pattern manually, with two or more rows. Required fields reject a ready save, while Save draft accepts incomplete content. Reopen the draft and finish it.
3. Paste multiline instructions. Review one row per nonempty line; correct, merge, split, reorder, remove, and add rows. Confirm replacement of existing rows. Save and edit again.
4. Attempt Back and Android system Back with unsaved changes. Cancel keeps edits; confirming discard exits. Browser refresh should also warn when applicable.
5. Attach a photo; deny or cancel picking. Verify friendly errors and persistent photos after a native restart.
6. Start a project. Tap + rapidly 100 times. Without a target, verify exactly 100 recorded stitches; with a target, verify the counter stops at that target. A zero target disables increment immediately. Decrement stops at zero. Repeated Undo restores the preceding actions until the saved history (maximum 100) is exhausted.
7. Complete a row, then Undo: previous row, count, and completion status return. Navigate backward and forward; each row keeps its count. Double tap row completion: only one row advances.
8. Wait for 'Saved', terminate the app, reopen, and Resume. Verify row, counts, flags, and Undo. Repeat with two projects and independent counts.
9. Edit or delete the source pattern. Ongoing projects retain their original instructions and photos.
10. Complete the last row: project stays active until Finish Project confirmation. Cancel leaves it active. Finish moves it to Completed Projects; details remain accessible.
11. Open a stitch lookup from Work Mode. Search names and US/UK abbreviations, open a guide, Back to lookup, Return to Work Mode. Progress is unchanged.
12. Change terminology and haptic preferences, restart, and verify persistence. Written patterns never change with the terminology setting.
13. Test airplane mode after installation. All counting, storage, fonts, local photos, and glossary text remain usable. Expo development mode still requires its JS bundle from Metro; use an installed build to establish offline behavior.
14. Check small screens, 390 px width, large accessibility text, VoiceOver/TalkBack, keyboard-visible forms, safe areas, and 48 dp controls. Counter controls should remain reachable.
15. Repository tests inject delayed and failed writes and malformed storage. On a native debug build, also simulate storage failure: the app must show failed saving, retain in-memory progress, and retry. Never show Saved for pending or failed changes.
16. Terminate during saving: expect restoration of the last successfully saved state, not a promise that pending writes survived.
17. Home shows only the most recently updated active project. Continue opens its recorded progress. View all projects opens the searchable library with In progress and Finished selectors; finished-only libraries remain accessible. Returning from a finished or unavailable project opens this list.
18. Home's pattern shelf scrolls horizontally, newest first. Ready patterns open details and drafts open their editor. View all patterns opens the library. Empty Home actions open the library or new-pattern editor.
19. Review Home at 320 and 390 px, with long titles, missing photos/descriptions, and large accessibility text. Confirm card actions remain reachable, pattern cards can be swiped, and the curved gingham header stays clear of content.



20. Save colors, multiple hooks, other tools, part labels and per-row color/hook selections. Reopen and restart; verify details and counters use the saved materials. Editing the source pattern must not change existing project snapshots.
21. Favorite and unfavorite patterns, restart, and combine favorites with title, draft/ready, and difficulty filters. Verify empty search results and a single grid item remain usable.
22. Open legacy `/projects`, `/project/[id]`, and `/pattern/new` links. Verify the corresponding library, selected counter, and Add tab.
23. Load a legacy active project with an over-target count and a single Undo snapshot. Confirm the original raw data is backed up before a new write, then verify clamped progress and repeated Undo after restart. Finished legacy projects remain unchanged.
24. Check reduced motion, tab animations, tab focus on web, native keyboard avoidance, and launcher/splash branding in an installed preview build.
