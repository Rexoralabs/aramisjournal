# Aramis: Sidebar Transition, Style Modes, Desktop Home Chat, Auth Image, Code ZIP

## 1. Chat side panel and left bar hand-off
- Pressing the menu icon opens the chat panel with a blur-and-fade entrance (blur 12px to 0, opacity 0 to 1, slight slide). The background gets a soft blurred overlay.
- At the same moment the floating left bar fades and blurs out and stops responding to clicks. It fades back in when the panel closes.
- A small shared "panel open" state lets the home page tell the left bar to hide.

## 2. Style mode in Settings: Modern or Editorial
- New "Style" choice in Appearance settings, saved on the device and applied across the app.
- **Modern** (default, current look): Instrument Sans throughout, plus extra polish: springier GSAP motion, staggered entrances, magnetic hover on buttons, soft press effects, and subtle grainy gradients behind the home greeting, side panel and cards.
- **Editorial**: the earlier mix of serif headlines (Instrument Serif) with sans body text, calmer motion, flat backgrounds, no gradients.
- Done by putting a style flag on the page root so fonts, gradients and motion switch together.

## 3. Home feels desktop-native and fluid
- Desktop layout: greeting sits optically centered, input moves down into a wide composer anchored near the bottom (max width ~760px), not floating high up.
- First message: greeting fades/lifts away and the composer glides to the bottom in one smooth motion instead of a jump.
- Your message appears instantly (shown before saving finishes); the reply streams in smoothly with a soft typing indicator, smooth auto-scroll, and no flicker when the reply is saved.
- Reply text rendered with formatting; wider reading column on large screens.

## 4. Auth image
- Show the image fully without cropping ("fit") on a matching dark backdrop, sharp at any size, so its quality is preserved. Text overlay stays readable.

## 5. Code ZIP download
- Bundle the project source (excluding dependencies, build output, git data and private env file) into a ZIP in your Files and give you a download link.

## Technical details
- `ChatSidebar`: GSAP timeline for panel + backdrop-filter overlay; `SideNav` reads a small context/store (`useUiChrome`) and animates `opacity/filter`, `pointer-events: none` when hidden.
- `useStyleMode` hook: `localStorage('aramis-style')`, sets `data-style="modern|editorial"` on `<html>`; CSS in `index.css` swaps `--font-display`, enables `.grain-gradient` (SVG noise + radial gradients using theme tokens) only in modern; motion helper reads mode for durations/eases.
- `HomePage`: flex column with `flex-1` messages area and sticky bottom composer; optimistic message list via react-query `setQueryData`; GSAP Flip-style transition from greeting to chat; streaming bubble kept mounted until saved message replaces it (same key) to avoid flicker.
- `AuthPage`: `object-contain` with `bg-background`/blurred copy of the image behind it to fill space.
- ZIP built in `/tmp`, entries inspected, then copied to `/mnt/documents/aramis-source.zip`.
