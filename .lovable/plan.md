

# Aramis Refinement Plan
## Page Transitions, Loading Screen, Cellar Fix, Desktop Responsiveness, Iconify Icons & Nav Polish

---

## Overview

This plan addresses 8 specific refinements:

1. **GSAP blurred page transitions** (0.5s blur fade between routes)
2. **Minimalist loading/splash screen** with Aramis logo on first load
3. **Cellar nav stays at bottom** (revert top nav behavior)
4. **Cellar populates from journal entries** (Write module data feeds into Cellar)
5. **Desktop responsiveness** with proper breakpoints (not everything centered in a narrow column)
6. **Iconify icons** for premium icon quality
7. **Notifications verification** and sound effects verification
8. **Tooltip and micro-interaction polish**
9. **All Motion Must Use GSAP Motion Libraries**
---

## 1. GSAP Blurred Page Transitions

### Current State
`PageContainer` uses Framer Motion with a simple opacity+y fade. No blur effect.

### Changes

**`src/components/layout/PageContainer.tsx`**
Replace Framer Motion with GSAP for a 0.5s blurred transition:

```tsx
export function PageContainer({ children, className }: PageContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, filter: "blur(8px)" },
      { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <main ref={ref} className={cn("min-h-screen pb-20 pt-6", className)} style={{ opacity: 0 }}>
      <div className="container mx-auto max-w-lg px-4 md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        {children}
      </div>
    </main>
  );
}
```

This removes the Framer Motion dependency from page containers while adding the luxury blur-in effect.

---

## 2. Minimalist Splash/Loading Screen

### Implementation
Add a splash screen component that shows on first app load with a blurred fade-out.

**New File: `src/components/layout/SplashScreen.tsx`**
- Full-screen overlay with `bg-background`
- Centered "Aramis" in `font-brand` (Cinzel), ultra-minimalist
- On mount, wait 1.5s then GSAP animate out with blur + opacity
- Uses a state flag in `App.tsx` to show/hide

**`src/App.tsx` Changes:**
- Add `showSplash` state (default `true`)
- Render `SplashScreen` over everything
- After splash animates out, set `showSplash = false`

---

## 3. Cellar Nav Stays at Bottom

### Current State
`BottomNav.tsx` has special logic: `isCellar ? "top-0 pt-safe pt-2" : "bottom-4 pb-safe"`.

### Changes
**`src/components/layout/BottomNav.tsx`**
- Remove the `isCellar` conditional logic entirely
- Nav always stays at the bottom on all pages
- Remove the top-nav GSAP animation variant
- Keep tooltips and all existing hover effects

---

## 4. Cellar Shows Journal Entries (Not Separate Thoughts)

### Current Behavior
The Cellar has its own `cellar_thoughts` table with separate CRUD. The user wants journal entries from the Write module to populate the Cellar instead.

### Changes

**`src/pages/CellarPage.tsx`**
- Import `useJournalEntries` from `@/hooks/useJournal` instead of `useCellarThoughts`
- Map journal entries into the masonry grid (each entry becomes a "thought card")
- Show entry title, a content preview (first ~100 chars), mood emoji, and date
- Remove the `AddThoughtDialog` FAB (entries are created in the Write module)
- Keep the AI sidebar -- pass journal entries as context instead of cellar thoughts

**`src/components/cellar/ThoughtCard.tsx`**
- Update to accept a journal entry shape (title, content preview, mood, date)
- Display as a card with title, snippet, mood indicator, and relative date

**`src/components/cellar/CellarAISidebar.tsx`**
- Update the `buildSystemPrompt` to use journal entry content instead of cellar thoughts
- Accept journal entries as the `thoughts` prop (update the interface)

The `cellar_thoughts` table and hooks remain in the database but are no longer used by the UI. The `AddThoughtDialog` component is kept but not rendered.

---

## 5. Desktop Responsiveness

### Current Problem
`PageContainer` constrains everything to `max-w-lg` (512px), making the app look tiny on desktop.

### Changes

**`src/components/layout/PageContainer.tsx`**
- Change container from `max-w-lg` to responsive: `max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl`
- This scales the content area from mobile (512px) to desktop (1024-1280px)

**`src/pages/HomePage.tsx`**
- Greeting section: center on mobile, left-align on desktop with larger text
- Chat messages area: wider on desktop (max-w-2xl centered)
- Header: add more horizontal padding on desktop

**`src/pages/InsightsPage.tsx`**
- Stats grid: `grid-cols-3` on mobile, `grid-cols-4` on desktop (featured card spans 2)
- Side-by-side cards: remain 2-col but with more breathing room
- Monthly progress: full-width with internal padding

**`src/pages/OrchardPage.tsx`**
- Fruit grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
- Hero section: larger text on desktop, more vertical padding
- Progress card: `max-w-md` centered

**`src/pages/CellarPage.tsx`**
- Masonry grid: `column-count: 2` on mobile, `3` on tablet, `4` on desktop

**`src/index.css` Masonry Update:**
```css
.masonry-grid { column-count: 2; column-gap: 1rem; }
@media (min-width: 768px) { .masonry-grid { column-count: 3; } }
@media (min-width: 1024px) { .masonry-grid { column-count: 4; } }
```

**`src/pages/CalendarPage.tsx`**
- Calendar grid scales naturally (7 columns)
- Entry preview sits beside the calendar on desktop (side-by-side layout)

**`src/pages/ProfilePage.tsx`**
- Profile card: `max-w-lg` centered on desktop (stays compact, doesn't stretch)
- Settings links: `max-w-lg` centered

**`src/components/layout/BottomNav.tsx`**
- Nav pill already floats centered -- works across viewports
- Add slightly larger icon sizes on desktop: `lg:w-12 lg:h-12`

---

## 6. Iconify Icons

### Approach
Install `@iconify/react` package to access premium icon sets (Material Symbols, Phosphor, Tabler, Solar, etc.).

### Icon Replacements

| Current (Lucide) | Replacement (Iconify) | Set |
|---|---|---|
| `Home` | `solar:home-2-bold-duotone` | Solar |
| `PenLine` | `solar:pen-new-square-bold-duotone` | Solar |
| `CalendarDays` | `solar:calendar-bold-duotone` | Solar |
| `TreeDeciduous` | `solar:tree-bold-duotone` | Solar |
| `Wine` | `solar:archive-bold-duotone` | Solar |
| `LayoutGrid` | `solar:chart-square-bold-duotone` | Solar |
| `User` | `solar:user-rounded-bold-duotone` | Solar |
| `Sparkles` | `solar:stars-bold-duotone` | Solar |
| `Send` | `solar:plain-bold` | Solar |
| `Menu` | `solar:hamburger-menu-linear` | Solar |
| `Moon` | `solar:moon-bold-duotone` | Solar |
| `Sun` | `solar:sun-bold-duotone` | Solar |

### Files to Update
- `src/components/layout/BottomNav.tsx` -- all nav icons
- `src/pages/HomePage.tsx` -- menu, theme toggle icons
- `src/components/chat/ChatInput.tsx` -- send icon
- `src/pages/CellarPage.tsx` -- AI button icon
- `src/components/cellar/CellarAISidebar.tsx` -- close/send icons

Lucide will remain available as a fallback for less critical icons (arrows, chevrons, etc.).

---

## 7. Notifications & Sound Verification

### Notifications
The current `src/lib/notifications.ts` implementation is solid. Will enhance:
- Use service worker registration (`navigator.serviceWorker.ready`) for notifications in PWA mode
- Add `tag: 'aramis-reminder'` to prevent duplicate notifications
- Verify `AppSettingsPage` toggle actually calls `requestNotificationPermission()`

### Sound Effects
The `src/lib/sounds.ts` uses Web Audio API with synthesized tones. Will verify:
- `AudioContext` is resumed on first user gesture (mobile Safari requirement)
- Add explicit `audioContext.resume()` call in sound initialization
- Ensure `soundManager.isEnabled()` is exposed and togglable from settings

---

## 8. Tooltip & Micro-Interaction Polish

### Already Working
- Bottom nav tooltips via Radix Tooltip (verified in code)
- Hover scale on nav icons: `hover:scale-110`
- Glass card hover lift: `translateY(-2px)`
- Button luxury hover: `translateY(-1px) scale(1.02)`

### Enhancements
- Ensure tooltip `side` is always `"top"` (remove the Cellar-specific "bottom" variant since nav stays at bottom now)
- Add `active:scale-95` on all interactive buttons for press feedback
- Ensure thought cards in masonry have the hover lift effect
- Profile settings links: add hover border glow

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/layout/SplashScreen.tsx` | Minimalist Aramis logo splash on first load |

### Modified Files
| File | Changes |
|------|---------|
| `src/components/layout/PageContainer.tsx` | GSAP blur transition, responsive max-widths |
| `src/components/layout/BottomNav.tsx` | Remove top-nav variant, keep at bottom always, Iconify icons |
| `src/pages/CellarPage.tsx` | Use journal entries instead of cellar_thoughts, remove FAB |
| `src/components/cellar/ThoughtCard.tsx` | Accept journal entry shape |
| `src/components/cellar/CellarAISidebar.tsx` | Use journal entries as context |
| `src/pages/HomePage.tsx` | Iconify icons, desktop responsive layout |
| `src/pages/InsightsPage.tsx` | Desktop grid breakpoints |
| `src/pages/OrchardPage.tsx` | Desktop grid breakpoints |
| `src/pages/CalendarPage.tsx` | Side-by-side layout on desktop |
| `src/pages/ProfilePage.tsx` | Centered max-w on desktop |
| `src/components/chat/ChatInput.tsx` | Iconify send icon |
| `src/index.css` | Masonry breakpoints for desktop |
| `src/App.tsx` | Add splash screen logic |
| `src/lib/notifications.ts` | Service worker notification, tag |
| `src/lib/sounds.ts` | AudioContext resume on gesture |
| `package.json` | Add `@iconify/react` dependency |

### No Database Changes Required
The cellar_thoughts table stays in the database but the UI will read from journal_entries instead.

---

## Implementation Order

1. Install `@iconify/react` dependency
2. Create `SplashScreen.tsx` and integrate into `App.tsx`
3. Update `PageContainer.tsx` (GSAP blur + responsive widths)
4. Fix `BottomNav.tsx` (remove top-nav, add Iconify icons)
5. Refactor `CellarPage.tsx` to use journal entries
6. Update all page layouts for desktop responsiveness
7. Swap remaining icons to Iconify across pages
8. Polish notifications and sound effects
9. Test across mobile and desktop viewports

