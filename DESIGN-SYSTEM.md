# Aramis design system

## Purpose and change policy
This is a codification of the existing Aramis aesthetic, not a redesign. Feature edits must reuse this system. Do not alter fonts, palette, radii, density, image framing, navigation placement or animation character incidentally. A deliberate visual change requires an explicit user request; update the relevant token and this document together.

## Sources of truth
- `src/index.css`: semantic colors, typography roles, radii, surfaces, shadows, gradients, motion and layout dimensions.
- `tailwind.config.ts`: token-backed utilities and the standard spacing/type/breakpoint scales.
- `src/components/ui/`: shared controls and accessible interaction primitives.
- `src/hooks/useStyleMode.ts`: device-persisted Modern/Editorial preference.
- `src/lib/designMotion.ts`: reads motion tokens for GSAP; respects reduced motion.
- `scripts/check-design-system.mjs`: blocks new off-system styling against an explicit legacy baseline.

## Identity and themes
Keep the current near-white light surfaces, burgundy text and muted gold accents. Dark mode uses near-black graphite surfaces, warm light text and gold accents. Use semantic roles, not literal colors or palette utilities. User-selected accent colors remain supported; do not hardcode gold as a replacement for a configurable primary action.

Modern and Editorial are independent of light/dark mode. Modern uses Instrument Sans display text, subtle grain gradients where already present and fluid entrance motion. Editorial uses Instrument Serif for H1/H2 and display text, Instrument Sans body text, flat backgrounds and restrained motion. Do not replace other existing type roles accidentally.

## Typography
| Role | Font | Usage |
| --- | --- | --- |
| Body / sans | Instrument Sans | Body, forms, reading |
| Display / serif utility | Instrument Sans in Modern; Instrument Serif in Editorial | H1/H2, greeting, prominent titles |
| Brand | Cinzel | Aramis wordmark only |
| UI | Bricolage Grotesque | Existing labels and compact UI |
| Emphasis | Cormorant Garamond italic | Existing quotation treatment |

Preserve the existing fixed Tailwind sizes: xs 12px, sm 14px, base 16px, lg 18px, xl 20px, 2xl 24px, 3xl 30px, 4xl 36px. Body is 14px. Use role utilities; do not introduce a new font or viewport-scaled type. Letter spacing is zero except the established spaced brand wordmark. Keep body text readable and let it wrap naturally.

## Geometry and layout
- Spacing uses Tailwind's stable 4px base scale: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 10=40px. Avoid one-off arbitrary spacing.
- Keep standard breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536px. Desktop first does not mean small screens may overflow.
- Content widths: reading 768px, desktop 896px, wide 1024px; Home composer 760px. Use the existing page layout, do not reposition it during feature work.
- Existing squircle geometry is authoritative: control 10px, field 12px, card/tool 16px, circle/pill 9999px. The current larger glass radius is intentional; do not flatten it to a generic 8px aesthetic.
- Left floating navigation, existing Cellar masonry and bottom Home composer remain structural invariants unless explicitly changed.
- Page sections stay unframed; glass surfaces belong to cards, floating navigation and actual tools, not every section.

## Color and surface roles
Use `background`/`foreground` for the page, `card` for solid cards, `popover` for menus, `muted` for subdued regions, `muted-foreground` for secondary text, `primary` for active/action emphasis, `destructive` for destructive operations, and `border`/`ring` for boundaries and keyboard focus.

Use `glass-liquid` for floating tools, `glass-card` for repeated raised items, and `thought-card` for Cellar items. They share glass fill, border, blur, saturation and inset-shadow tokens. Solid and glass surfaces must not acquire unrelated shadows. `grain-gradient` is optional in established Modern locations only; Editorial disables it. No decorative gradient blobs.

Sign-in media uses the original image, proportional `object-cover`, edge-to-edge within its panel, without stretched pixels or blurred filler. Its image-overlay colors are separate theme-invariant semantic tokens so the text remains legible in either theme.

## Controls and states
Use shared shadcn controls: Button, Input, Textarea, Select, Switch, Checkbox, Slider, Tabs, Dialog, Tooltip and menu primitives. Do not create a new raw button or styled form-control look per feature.

Button defaults remain backward-compatible. `ink` is the sign-in-style high-contrast action, `glass` is a floating tool, and `bare` is a text/icon-only command. `pill`, `provider`, and `inline` sizes preserve existing sign-in geometry. Existing default/secondary/outline/ghost/destructive/link variants remain available.

Use icons for tool commands, swatches for colors, segmented choices for modes, toggles for binary settings, numeric inputs or sliders for quantities. Existing icons use Phosphor through Iconify; do not mix new icon families. Icon-only controls require an accessible name and unfamiliar tools need a Tooltip. Preserve visible keyboard focus, disabled states, validation, loading indicators and stable control dimensions. Hover must not resize layout.

## Motion
Motion tokens live in CSS. Modern entrance: 700ms, expo out, back-out spring. Editorial entrance: 400ms, power2 out, no overshoot. Ordinary feedback: 200ms; surface feedback: 350ms; exit: 300ms. Keep existing page/panel transitions and small lift/press effects rather than adding new animation languages. Reduced-motion users receive immediate GSAP transitions through the shared helper and minimal CSS animation. Animations must not permanently hide content.

## Adding or editing a feature
1. Read this file and the shared control you will use.
2. Reuse an existing token, utility, component and layout pattern.
3. If a new role truly lacks a token, add a semantic token centrally; do not introduce a page-local palette.
4. Do not override established globals to solve a local layout issue.
5. Run `bun run design:check`; legacy exceptions are debt, not examples to copy. Never refresh its baseline merely to make a new violation pass.
6. Check the changed flow at its real viewport, in light/dark and Modern/Editorial when relevant, including keyboard focus and reduced motion.

## Legacy migration
The baseline records existing raw buttons, literal colors, custom type and arbitrary styling so they can be migrated incrementally without a risky all-page rewrite. New occurrences fail the check; deleted occurrences are allowed. The guard is a source-level aid, not a substitute for a visual review. Fix a legacy item by replacing it with the canonical role; do not redesign its appearance.