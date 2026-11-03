# Aramis desktop conversion handoff

This is the complete portable application source, not a compiled Tauri application. No Rust/Tauri wrapper currently exists.

## Included
- All React/TypeScript pages, hooks, styles, UI controls, icons and original assets.
- Public files, PWA settings, generated-worker configuration and app-worker registration source.
- Package manifests, all existing lockfiles, TypeScript/Vite/Tailwind/test configuration and tests.
- Backend function source, database migrations and backend configuration.
- The public client connection configuration in `.env` (contains only browser-publishable values, not server secrets).
- Project notes, plans and a file inventory.
- The new Auth photo as both an asset pointer and a real portable image under `portable-assets/` in the archive.

## Local development
Install dependencies using `bun install`, then `bun run dev`. Run `bun run test` for tests and `bun run build` to generate `dist/` locally.

## Tauri integration
Add a Tauri v2 wrapper locally using the official Tauri initialization flow. Point its development URL at `http://localhost:8080`, its frontend distribution directory at `../dist`, and its commands at `bun run dev` / `bun run build`.

Before packaging, replace the Auth photo pointer import with the bundled portable image (copy it into `src/assets` and import it as an image). Lovable-hosted asset URLs are origin-relative and need this change outside Lovable hosting. Other existing project images are already included as binary files.

Use local fonts for a fully self-contained desktop experience; Instrument Serif is already imported from its installed font package. Other typefaces currently use Google Fonts. Iconify icons can fetch their glyphs online; bundle the icon data if the desktop app must work entirely offline.

The desktop app still connects to the existing hosted account, journal, storage and AI services. Backend source alone does not contain hosted user records, stored avatars or deployed credentials. To migrate those services, provision your own backend, apply the included migrations, deploy the functions, configure server-side AI credentials and update the client environment. Configure desktop OAuth redirects and permissions for your chosen Tauri origin before enabling social sign-in. Do not embed privileged server keys in a desktop binary.

## Explicit exclusions
Installed dependencies (`node_modules`), generated build output (`dist`, build caches), Git metadata at every depth, browser sessions, private server credentials and hosted user data are not included. Dependencies and build output are reproduced from the included manifests/lockfiles; neither is portable across desktop target platforms. Private Cloud credentials are not exportable from Lovable Cloud. The archive has everything available and needed from the portable source; it is not a copy of the sandbox machine or a backup of hosted data.