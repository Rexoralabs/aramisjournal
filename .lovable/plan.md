
# Aramis Major Enhancement Plan
## PWA, Cellar Module, Orchard Revamp, Insights Redesign, UI Polish & Notifications

---

## Overview

This plan covers 10 major enhancements:

1. **PWA Setup** - Installable web app with service worker, manifest, and icons
2. **Bottom Nav Tooltips** - Subtle module name tooltips on icon hover
3. **Cellar Module** - New "thought storage" module with masonry grid, top nav, and AI sidebar
4. **Push Notifications** - Real daily reminder notifications using the Push API
5. **Sound Effects Verification** - Ensure synthesized sounds work properly
6. **Insights Revamp** - Modern dashboard layout inspired by the reference image arrangement
7. **Orchard Revamp** - Apple-style editorial with GSAP parallax scrolling, many more "fruits"
8. **Squircle Component Consistency** - All cards/buttons use rounded-2xl (squircle) styling
9. **Hover Effects** - Subtle GSAP/CSS hover animations on interactive components
10. **Theme Tuning** - Light mode closer to white, dark mode to pure dark graphite

---

## 1. PWA Setup

### Install and Configure `vite-plugin-pwa`

Add `vite-plugin-pwa` dependency and configure in `vite.config.ts`:

```typescript
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'robots.txt'],
    manifest: {
      name: 'Aramis - Mindful Journaling',
      short_name: 'Aramis',
      description: 'Your premium AI journaling companion',
      theme_color: '#F5F1EB',
      background_color: '#F5F1EB',
      display: 'standalone',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    },
  }),
]
```

### PWA Icons
Generate simple SVG-based icons at 192x192 and 512x512 in `public/icons/`.

### Update `index.html`
Add:
- `<link rel="manifest" href="/manifest.webmanifest">`
- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- Apple touch icon link

### Install Page
Create `src/pages/InstallPage.tsx` with install prompt trigger for mobile/desktop browsers.

---

## 2. Bottom Nav Tooltips

Update `src/components/layout/BottomNav.tsx`:
- Wrap each nav icon in a Radix `Tooltip` (already available via `@radix-ui/react-tooltip`)
- Show module name on hover with a subtle fade-in animation
- Use `delayDuration={300}` for a natural feel
- Tooltip styled with the existing design system

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Link to={item.path} className="w-11 h-11 rounded-full ...">
      <item.icon />
    </Link>
  </TooltipTrigger>
  <TooltipContent side="top" className="font-ui text-xs">
    {item.label}
  </TooltipContent>
</Tooltip>
```

---

## 3. Cellar Module (Thought Storage)

### Concept
A "cellar" for storing loose thoughts -- quick notes, ideas, fragments. Different from the structured journal.

### Database
Create a `cellar_thoughts` table:
```sql
CREATE TABLE public.cellar_thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cellar_thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own thoughts"
ON public.cellar_thoughts FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### New Files
| File | Purpose |
|------|---------|
| `src/pages/CellarPage.tsx` | Main cellar page with masonry grid, top nav, AI sidebar |
| `src/components/cellar/ThoughtCard.tsx` | Individual thought card (squircle) |
| `src/components/cellar/AddThoughtDialog.tsx` | Dialog/modal to add a new thought |
| `src/components/cellar/CellarAISidebar.tsx` | Floating right sidebar with AI chat |
| `src/hooks/useCellar.ts` | CRUD hooks for cellar_thoughts table |

### Masonry Grid
Use CSS columns for a true masonry layout (no library needed):
```css
.masonry-grid {
  column-count: 2;
  column-gap: 1rem;
}
.masonry-grid > * {
  break-inside: avoid;
  margin-bottom: 1rem;
}
```

### Cellar Page Layout
```text
+---------------------------------------------------+
| [Home] [Write] [Calendar] [Orchard] [Cellar] ...  |  <- TOP nav (not bottom)
+---------------------------------------------------+
|  The Cellar                              [AI btn] |
+---------------------------------------------------+
|  +------------------+ +------------------+        |
|  | Thought 1        | | Thought 2        |        |
|  | (variable height)| |                  |        |
|  +------------------+ +------------------+        |
|  +------------------+ +------------------+        |
|  | Thought 3        | | Thought 4        |        |
|  |                  | | (shorter)        |        |
|  |                  | +------------------+        |
|  +------------------+                             |
+---------------------------------------------------+
|  [+ Add Thought] FAB                              |
+---------------------------------------------------+
```

### Navigation Override
- On the Cellar page only, the bottom nav moves to the **top** of the page
- All other pages keep the bottom nav as-is
- Implement via a `useLocation()` check in `BottomNav` or a layout prop

### AI Sidebar
- Button in top-right with sparkle/brain icon
- On press, a right sidebar fades in (GSAP `fromTo` with `x: 300` to `x: 0`)
- Contains a chat interface similar to the Home page chat
- System prompt focused on brainstorming with the user's thoughts:
  ```
  You are Aramis, helping the user explore their stored thoughts. 
  You have access to their thoughts and can ask questions, find connections, 
  and brainstorm ideas based on what they've written.
  ```
- Pass all cellar thoughts as context in the system prompt
- Uses the same `chat` edge function with modified system prompt

---

## 4. Push Notifications (Daily Reminders)

### Implementation
Use the **Push API** and **Notification API** for browser-based push notifications.

**Service Worker Registration** (handled by vite-plugin-pwa):
- The PWA service worker handles showing notifications

**Notification Scheduling** (client-side approach):
Since we don't have a push server, use a hybrid approach:
1. Request notification permission on settings toggle
2. Use `setInterval` + `localStorage` to check if reminder time has passed today
3. When app is open and time matches, show a notification
4. For background notifications, register a periodic sync (Chrome only) or use the service worker `periodicsync` event

**New File: `src/lib/notifications.ts`**
```typescript
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function showNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    });
  }
}

export function scheduleDailyReminder() {
  // Check every minute if it's reminder time
  const checkInterval = setInterval(() => {
    const now = new Date();
    const lastReminder = localStorage.getItem('lastReminderDate');
    const today = now.toDateString();
    
    if (lastReminder !== today && now.getHours() === 21) { // 9 PM
      showNotification('Aramis', 'Time to reflect on your day. Your journal awaits.');
      localStorage.setItem('lastReminderDate', today);
    }
  }, 60000);
  
  return () => clearInterval(checkInterval);
}
```

---

## 5. Sound Effects

The current `SoundManager` uses Web Audio API with synthesized tones -- already functional. Will verify it works by:
- Ensuring `AudioContext` is resumed on first user interaction
- Adding a user gesture handler to unlock audio on mobile Safari
- Testing all 5 sound effects (send, receive, success, click, swoosh)

---

## 6. Insights Revamp

### Layout Inspiration (from reference image)
The reference shows a dashboard with:
- Large title at top-left
- Filter/date chips in a horizontal row
- 3 stat cards in a row (one larger/featured, two smaller)
- Two side-by-side content sections below (chart + data grid)
- A bottom section with list data

### New Insights Layout
```text
+---------------------------------------------------+
|  Your Journey                                     |
|  Insights from your reflection                    |
+---------------------------------------------------+
|  [This Week v]  [This Month]  [All Time]          |  <- Filter chips
+---------------------------------------------------+
|  +----------------------------------+  +--------+ |
|  |  Current Streak                  |  | Total  | |
|  |  12 days                         |  | 42     | |
|  |  Your best: 30 days              |  | entries | |
|  +----------------------------------+  +--------+ |
|                                        +--------+ |
|                                        | Avg    | |
|                                        | 4.2    | |
|                                        | mood   | |
|                                        +--------+ |
+---------------------------------------------------+
|  +------------------+ +------------------+        |
|  | Mood Over Time   | | Writing Habits   |        |
|  | (mini chart)     | | (day heatmap)    |        |
|  +------------------+ +------------------+        |
+---------------------------------------------------+
|  Monthly Progress                      Monthly    |
|  +----------------------------------------------+ |
|  | 18 / 28 days this month (64%)                | |
|  | [progress bar]                                | |
|  +----------------------------------------------+ |
+---------------------------------------------------+
```

### Key Design Principles
- No AI-generic copy -- use clean, data-driven labels
- Quiet, premium typography (font-serif for numbers, font-ui for labels)
- Squircle cards with subtle shadows
- Filter chips to toggle time ranges
- Side-by-side card arrangement (not stacked list)

---

## 7. Orchard Revamp - Apple Editorial + GSAP Parallax

### Vision
Transform from a simple milestone grid into a full-page scrolling editorial experience, like Apple product pages.

### Structure
Full-page sections that scroll with parallax:

```text
Section 1: Hero
+---------------------------------------------------+
|                                                   |
|           The Orchard                             |
|     Where dedication bears fruit                  |
|                                                   |
|        [Current Streak: 12 days]                  |
|        [Progress bar to next fruit]               |
|                                                   |
+---------------------------------------------------+

Section 2: Your Garden (parallax scroll)
+---------------------------------------------------+
|                                                   |
|     [Fruit 1]  [Fruit 2]  [Fruit 3]              |
|                                                   |
|     Each fruit card slides in on scroll           |
|     with staggered parallax offsets               |
|                                                   |
+---------------------------------------------------+

Section 3+: Individual Fruit Spotlight
+---------------------------------------------------+
|                                                   |
|        [Large Icon]                               |
|        "First Seed"                               |
|        7 days of journaling                       |
|        "Your journey begins"                      |
|                                                   |
|        [Background parallax imagery]              |
|                                                   |
+---------------------------------------------------+
```

### GSAP ScrollTrigger Parallax
```typescript
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// Parallax on scroll
gsap.to('.parallax-bg', {
  y: -100,
  ease: 'none',
  scrollTrigger: {
    trigger: '.section',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
});
```

### Expanded "Fruits" (Achievements)
Rename milestones to "fruits" and add many more:

| Days | Fruit | Name | Description |
|------|-------|------|-------------|
| 1 | Seed | First Seed | You planted your first thought |
| 3 | Sprout | Early Sprout | Three days of growth |
| 7 | Lemon | First Harvest | A week of consistency |
| 14 | Strawberry | Sweet Progress | Two weeks strong |
| 21 | Cherry | Cherry Picked | Three weeks of wisdom |
| 30 | Apple | Golden Apple | A month of reflection |
| 45 | Peach | Peach Perfect | Six weeks of dedication |
| 60 | Orange | Orange Blossom | Two months of growth |
| 90 | Pomegranate | Rich Harvest | A season of journaling |
| 100 | Fig | Century Fig | 100 days milestone |
| 150 | Grape | Vineyard | Five months cultivated |
| 200 | Mango | Tropical Bliss | 200 days of wisdom |
| 250 | Pineapple | Golden Crown | 250 days of mastery |
| 300 | Coconut | Paradise Found | Almost a year |
| 365 | Olive | The Ancient Olive | A full year of reflection |
| 500 | Dragonfruit | Mythical Harvest | Beyond extraordinary |
| 730 | Golden Apple | The Eternal Orchard | Two years of mastery |

### Apple-Style Design Elements
- Large serif typography sections
- Generous whitespace between sections
- Subtle background color shifts per section
- Parallax depth layers
- Smooth snap scrolling (optional)
- Unlocked fruits have a golden glow; locked ones are subtle silhouettes

---

## 8. Squircle Component Consistency

Update all card and interactive components globally to use `rounded-2xl` (squircle aesthetic):

### Changes in `src/index.css`
```css
.glass-card {
  @apply rounded-2xl border backdrop-blur-xl;
  /* ... existing styles ... */
}

.milestone-card {
  @apply relative rounded-2xl p-6 text-center transition-all duration-500;
}

.chat-bubble {
  @apply rounded-2xl px-4 py-3 max-w-[85%];
}
```

### Global Updates
- All `.glass-card` components: `rounded-xl` -> `rounded-2xl`
- All buttons: ensure `rounded-xl` or `rounded-full` (pill buttons)
- Bottom nav pill: keep `rounded-full`
- Input fields: `rounded-2xl`
- Dialog/sheet content: `rounded-2xl`
- Alert dialogs: `rounded-2xl`

---

## 9. Subtle Hover Effects

Add GSAP-powered or CSS hover effects throughout:

### Card Hover
```css
.glass-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-soft);
}
```

### Button Hover
```css
.btn-luxury:hover {
  transform: translateY(-1px) scale(1.02);
}
```

### Nav Icon Hover (in addition to tooltip)
Slight scale on hover: `hover:scale-110 transition-transform`

### Thought Cards (Cellar)
On hover: subtle lift + shadow increase + border glow

---

## 10. Theme Tuning

### Light Mode - Closer to White
```css
:root {
  --background: 40 20% 97%;      /* Was 36 33% 94% -- now almost white */
  --card: 40 15% 99%;             /* Was 40 33% 97% -- nearly pure white */
  --muted: 40 10% 93%;            /* Lighter muted */
  --secondary: 40 12% 95%;        /* Lighter secondary */
  --border: 40 10% 90%;           /* Softer border */
  --input: 40 12% 96%;            /* Lighter input */
}
```

### Dark Mode - Dark Graphite (less green)
```css
.dark {
  --background: 200 5% 7%;        /* Was 160 15% 5% -- now neutral dark graphite */
  --card: 200 4% 11%;             /* Darker, less green */
  --muted: 200 3% 15%;            /* Neutral dark */
  --muted-foreground: 200 3% 50%; /* Neutral gray */
  --secondary: 200 4% 16%;
  --border: 200 4% 20%;
  --input: 200 4% 14%;
  --graphite: 200 5% 7%;
  --graphite-mid: 200 4% 14%;
  --graphite-light: 200 4% 20%;
  --sidebar-background: 200 4% 9%;
  --sidebar-border: 200 4% 18%;
}
```

---

## 11. Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/pages/CellarPage.tsx` | Cellar module with masonry grid |
| `src/components/cellar/ThoughtCard.tsx` | Individual thought card |
| `src/components/cellar/AddThoughtDialog.tsx` | Add thought modal |
| `src/components/cellar/CellarAISidebar.tsx` | AI brainstorming sidebar |
| `src/hooks/useCellar.ts` | CRUD hooks for cellar_thoughts |
| `src/lib/notifications.ts` | Push notification helpers |
| `public/icons/icon-192.png` | PWA icon 192x192 |
| `public/icons/icon-512.png` | PWA icon 512x512 |

### Modified Files
| File | Changes |
|------|---------|
| `vite.config.ts` | Add vite-plugin-pwa |
| `index.html` | PWA meta tags, apple-mobile-web-app |
| `src/App.tsx` | Add Cellar route, notification init |
| `src/index.css` | Theme tuning, squircle updates, masonry CSS, hover effects |
| `src/components/layout/BottomNav.tsx` | Tooltips, top-nav variant for Cellar |
| `src/pages/OrchardPage.tsx` | Complete rewrite with GSAP parallax, expanded fruits |
| `src/pages/InsightsPage.tsx` | Complete layout revamp with dashboard arrangement |
| `src/pages/AppSettingsPage.tsx` | Hook up real notification permission |
| `tailwind.config.ts` | Updated graphite tokens |

### Database Migration
- Create `cellar_thoughts` table with RLS policies

---

## 12. Implementation Order

1. **Theme tuning** (light/dark mode adjustments)
2. **Squircle + hover effects** (global CSS updates)
3. **PWA setup** (vite-plugin-pwa, manifest, icons, meta tags)
4. **Bottom nav tooltips**
5. **Push notifications** (notification utility + settings integration)
6. **Cellar module** (database migration, page, masonry grid, AI sidebar)
7. **Insights revamp** (dashboard layout redesign)
8. **Orchard revamp** (GSAP ScrollTrigger parallax, expanded fruits)
9. **Sound effects verification**
10. **Testing** (PWA install, notifications, masonry, parallax)
