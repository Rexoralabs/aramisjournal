

# Aramis: Desktop-First Overhaul, Liquid Glass Design, AI Fixes, Rich Text, Timer Background Mode

---

## Overview

9 major changes, reorienting the app from mobile-first to a **desktop-first overlay/companion app** with premium Apple-inspired design.

---

## 1. Auth Image -- Full-Fit High Quality

**`src/pages/AuthPage.tsx`**: The left panel image uses `bg-cover bg-center` but may not fill properly. Fix:
- Add `object-cover w-full h-full` to ensure the image fills 100% of the panel
- Use a dedicated `<img>` element with `object-cover` instead of CSS `backgroundImage` for sharper rendering
- Remove the `hidden lg:flex` and ensure mobile also gets a compact version of the image

---

## 2. Splash Screen -- Show Only Once (First Visit)

**`src/App.tsx`**: Currently `showSplash` defaults to `true` every page load.

Fix:
- On mount, check `localStorage.getItem("aramis-splash-seen")`
- If set, skip splash entirely (`showSplash = false`)
- In `handleSplashComplete`, set `localStorage.setItem("aramis-splash-seen", "true")`
- This ensures the splash only shows on the very first visit

---

## 3. Rich Text Formatting (Markdown Rendering)

**Current**: Compose stores markdown (`**bold**`, `*italic*`) but renders as plain text. The toolbar inserts markdown syntax but users never see formatted output.

**Fix -- Render markdown in preview areas** (Cellar cards, AI summary, entry previews):
- Install and use a lightweight markdown renderer (`react-markdown` is not installed, but we can use a simple regex-based renderer or install it)
- Actually, the simpler approach: convert the `textarea` to use `contenteditable` with basic formatting commands (`document.execCommand`), or keep the textarea + markdown but add a **live preview pane** below.

**Recommended approach**: Keep `textarea` for input with markdown syntax, but in all **display** contexts (ThoughtCard, EntryPreview, AI Summary, Calendar preview), render the markdown to styled HTML using a small utility function that converts `**bold**` → `<strong>`, `*italic*` → `<em>`, `## heading` → `<h2>`, `- item` → `<li>`, `> quote` → `<blockquote>`.

Create `src/lib/markdown.ts`:
- `renderMarkdown(text: string): string` -- converts markdown syntax to HTML
- Uses regex replacements for bold, italic, headings, lists, blockquotes
- Sanitizes output (no script injection)

Update display components:
- `ThoughtCard.tsx` -- render preview with `dangerouslySetInnerHTML` using the markdown renderer
- `EntryPreview.tsx` -- same
- `WritePage.tsx` AI summary display -- same

---

## 4. Timer Background Mode + Ambient Chime

**Problem**: The `setInterval` in PomodoroTimer stops when the tab is hidden (browser throttles timers).

**Fix in `src/components/focus/PomodoroTimer.tsx`**:
- Replace `setInterval` countdown with a **target end time** approach:
  - When starting, calculate `endTime = Date.now() + timeLeft * 1000` and store it in a ref
  - Use `setInterval` at 1000ms that computes `remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))`
  - This way, even if the tab was backgrounded and the interval was throttled, when it fires again it calculates the correct remaining time
- Add `visibilitychange` event listener to immediately recalculate on tab return

**Ambient chime sound** in `src/lib/sounds.ts`:
- Add a new `SoundEffect` type: `'chime'`
- Synthesize a gentle ambient chime: two overlapping sine tones (C5 + G5) with longer duration (0.8s) and gentle fade
- Play `soundManager.play('chime')` when timer completes instead of the basic `success` sound

---

## 5. Fix Cellar AI Chat

**Root cause**: `supabase/config.toml` only has `project_id` -- the `[functions.chat]` and `[functions.categorize]` declarations are missing. Without these, the edge functions are never deployed.

**Fix**: The config.toml is auto-managed and cannot be edited directly. Instead, deploy the edge functions using the deploy tool.

**Action**: Deploy `chat` and `categorize` edge functions using the `supabase--deploy_edge_functions` tool.

Additionally, verify the `CellarAISidebar` correctly passes the `context` parameter (it does -- line 83-85 already pass `context` to `streamChat`).

---

## 6. Liquid Glass + Apple Premium Design with GSAP

Transform the UI components to have a frosted glass, depth-layered, Apple-inspired feel.

### Glass Effects (`src/index.css`):
- Update `.glass-card` to use stronger `backdrop-blur-2xl` (40px), subtler borders with `border-white/10` in dark mode, and inner glow via `box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05)`
- Add `.glass-liquid` class: `backdrop-blur-[40px] bg-white/[0.06] dark:bg-white/[0.04] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]`
- Add subtle gradient overlays for depth

### GSAP Micro-interactions:
- Cards: on hover, GSAP `scale(1.02)` + subtle `boxShadow` expansion + `y: -2`
- Navigation items: GSAP spring animation on active state change
- Page transitions: already using GSAP blur fade -- enhance with `scale: 0.98 → 1`
- Buttons: `scale: 0.95` on press via GSAP

### Component-level changes:
- All `glass-card` usages get the enhanced frosted treatment
- Navigation pill gets stronger blur + border glow on active
- Chat bubbles get subtle glass treatment
- Modal/sidebar overlays get stronger frosted backdrop

**No Lottie files** -- they would add significant bundle size and complexity. GSAP micro-animations achieve the same premium feel more efficiently.

---

## 7. Replace Serif Fonts with Instrument Sans

**Current**: Headings use `Instrument Serif` (`font-serif`). User wants all serif replaced with `Instrument Sans`.

### Changes:

**`src/index.css`**:
- Change `h1, h2, h3, h4, h5, h6` font-family from `'Instrument Serif'` to `'Instrument Sans'`
- Update `.font-serif` utility to use `'Instrument Sans'` (or remove the serif distinction entirely)
- Keep `font-brand` (Cinzel) for the "Aramis" logo only

**`tailwind.config.ts`**:
- Change `serif: ["Instrument Serif", "serif"]` to `serif: ["Instrument Sans", "sans-serif"]` (or create a new `heading` family)

This means all headings, timer displays, stat numbers, and section titles will use the clean sans-serif. The brand name "ARAMIS" keeps Cinzel.

---

## 8. Desktop-First App with Overlay Behavior

Transform from mobile-first to a **desktop productivity companion** that can overlay other apps.

### Layout Changes:

**Remove mobile optimizations**:
- Remove `touch-target` min-height constraints
- Remove `pb-safe`, `pt-safe` mobile padding
- Remove responsive breakpoints that prioritize mobile
- Set base container to desktop-comfortable widths

**Window-like feel**:
- Add a title bar area with window controls styling (drag area)
- Compact, information-dense layouts
- Smaller default font sizes suitable for desktop
- Hover states instead of touch targets

**Keyboard shortcuts** (new file `src/hooks/useKeyboardShortcuts.ts`):
- `Ctrl/Cmd + N` -- New note (navigate to `/compose` with new entry)
- `Ctrl/Cmd + K` -- Open search/command palette
- `Ctrl/Cmd + J` -- Open AI chat (navigate to `/` and focus input)
- `Ctrl/Cmd + F` -- Focus mode (navigate to `/focus`)
- `Ctrl/Cmd + ,` -- Settings
- `Escape` -- Close sidebars/modals
- Register via `useEffect` with `keydown` event listener

**Command Palette** (new component `src/components/CommandPalette.tsx`):
- Uses shadcn `Command` (cmdk, already installed)
- `Ctrl/Cmd + K` opens it
- Search entries by title/content
- Quick actions: New Note, Open AI, Focus Mode, Settings
- Navigate to results on select
- Glass overlay with strong blur backdrop

---

## 9. Floating Left Sidebar (Replace Bottom Nav)

Replace the bottom pill nav with a **vertical floating left sidebar**.

**`src/components/layout/SideNav.tsx`** (new file, replaces `BottomNav.tsx`):
- Fixed left position, centered vertically
- Narrow pill shape (width ~56px), rounded-2xl
- Same 7 nav items, displayed vertically as icon buttons
- Active item highlighted with primary background
- Tooltip on hover (right side) showing label
- Glass/frosted treatment matching the new design language
- GSAP entrance animation (slide in from left)
- Collapse on smaller viewports to a mini floating button that expands

**`src/App.tsx`**:
- Replace `<BottomNav />` with `<SideNav />`
- Adjust page container padding: remove `pb-20` (bottom nav space), add `pl-20` (left nav space)

**`src/components/layout/PageContainer.tsx`**:
- Change `pb-20` to `pl-20` for left sidebar clearance
- Remove mobile bottom padding

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/layout/SideNav.tsx` | Floating vertical left sidebar navigation |
| `src/hooks/useKeyboardShortcuts.ts` | Global keyboard shortcut handler |
| `src/components/CommandPalette.tsx` | Cmd+K search/action palette |
| `src/lib/markdown.ts` | Lightweight markdown-to-HTML renderer |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/AuthPage.tsx` | Full-fit image with `<img>` tag |
| `src/App.tsx` | Splash once-only logic, replace BottomNav with SideNav, register keyboard shortcuts |
| `src/components/focus/PomodoroTimer.tsx` | End-time based countdown, ambient chime |
| `src/lib/sounds.ts` | Add 'chime' sound effect |
| `src/index.css` | Liquid glass classes, sans-serif headings, desktop-first sizing |
| `tailwind.config.ts` | Update serif font family to sans |
| `src/components/layout/PageContainer.tsx` | Left padding instead of bottom |
| `src/components/cellar/ThoughtCard.tsx` | Render markdown preview |
| `src/components/cellar/CellarAISidebar.tsx` | Glass treatment |
| `src/pages/WritePage.tsx` | Markdown preview in summary, glass styling |
| `src/pages/HomePage.tsx` | Glass treatment, keyboard shortcut integration |
| `src/components/chat/ChatInput.tsx` | Glass styling |

### Edge Function Deployment
- Deploy `chat` and `categorize` functions to fix AI

### No Database Changes Required

---

## Implementation Order

1. Deploy edge functions (chat + categorize) -- fixes AI immediately
2. Splash screen once-only (localStorage)
3. Font swap (serif → Instrument Sans)
4. Liquid glass CSS system
5. Replace BottomNav with floating left SideNav
6. Desktop-first layout adjustments + PageContainer
7. Auth image full-fit
8. Markdown renderer + display updates
9. Timer background mode + ambient chime
10. Keyboard shortcuts + Command Palette
11. GSAP micro-interactions polish

