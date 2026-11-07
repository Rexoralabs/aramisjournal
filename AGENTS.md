# Project rules
- Load remote fonts through document head links and Editorial's serif through the installed font package so the CSS compiler never resolves remote imports.
- Keep source exports portable with asset binaries and backend source; exclude repository metadata, dependencies, generated outputs and private credentials because they are not portable application source.
- Register the generated app-shell worker only through registerAppWorker, excluding editor/dev contexts and using network-first navigation so stale HTML cannot strand the app.
- Read DESIGN-SYSTEM.md before UI edits and reuse its CSS tokens, shared controls and motion helper; feature changes must not drift the established aesthetic.
- Run `bun run design:check` after UI edits; the legacy baseline may only shrink unless an explicitly requested design-system change requires a reviewed exception.
- Compose uses Tiptap with Markdown serialization, keeping journal content portable and existing entries compatible; never persist editor HTML or reset a live draft on same-entry save refetches.