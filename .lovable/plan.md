
# Aramis Enhancement Plan
## Haptic Feedback, Sound Effects, Chat History Persistence, Dark Green Theme, Calendar Module, Home Layout Polish & Mobile Responsiveness

---

## Overview

This plan implements seven key enhancements:
1. **Haptic feedback** - Premium tactile responses for mobile interactions
2. **Sound effects** - Subtle audio cues for key actions
3. **Conversation history persistence** - Past chats reviewable and continuable (already implemented - will verify and polish)
4. **Dark mode redesign** - Dark green to black graphite aesthetic
5. **Calendar module** - New page for date-based journal navigation
6. **Home layout polish** - Exact match to wireframe reference (sidebar with search, "X of 365" counter)
7. **Mobile responsiveness** - Optimize all modules for mobile-first experience

---

## 1. Haptic Feedback System

### Implementation
Create a reusable haptic utility using the Web Vibration API with fallback:

**New File: `src/lib/haptics.ts`**
```typescript
type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 30],
  error: [50, 30, 50],
  selection: 5,
};

export function haptic(pattern: HapticPattern = 'light') {
  if ('vibrate' in navigator) {
    navigator.vibrate(patterns[pattern]);
  }
}
```

### Integration Points
| Action | Haptic Type |
|--------|-------------|
| Send message | medium |
| Receive AI response complete | success |
| Button tap | light |
| Sidebar toggle | selection |
| Delete action | error |
| Save journal entry | success |
| Navigation tap | selection |
| Milestone unlock | heavy + success |

---

## 2. Sound Effects System

### Implementation
Create a sound manager with preloaded audio files:

**New File: `src/lib/sounds.ts`**
```typescript
type SoundEffect = 'send' | 'receive' | 'success' | 'click' | 'swoosh';

const sounds: Record<SoundEffect, string> = {
  send: '/sounds/send.mp3',
  receive: '/sounds/receive.mp3',
  success: '/sounds/success.mp3',
  click: '/sounds/click.mp3',
  swoosh: '/sounds/swoosh.mp3',
};

class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private enabled = true;

  preload() {
    Object.entries(sounds).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0.3;
      this.audioCache.set(key, audio);
    });
  }

  play(effect: SoundEffect) {
    if (!this.enabled) return;
    const audio = this.audioCache.get(effect);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const soundManager = new SoundManager();
```

### Sound Files (Minimal Luxury)
Create subtle, premium sound effects:
- **send.mp3** - Soft whoosh (100ms)
- **receive.mp3** - Gentle chime (150ms)
- **success.mp3** - Warm affirmation tone (200ms)
- **click.mp3** - Soft tap (50ms)
- **swoosh.mp3** - Sidebar transition (150ms)

**Note:** Sound files will be minimal size (.5-2KB each) using synthesized tones.

---

## 3. Conversation History Persistence

### Current State (Already Implemented)
The existing system has:
- `chat_conversations` table with user_id, title, timestamps
- `chat_messages` table with conversation_id, role, content
- `useChatConversations()` hook for fetching history
- `useChatMessages(conversationId)` for loading messages
- `ChatSidebar` component displaying conversations

### Enhancements Needed
1. **Auto-load last conversation** on app open
2. **Search functionality** in sidebar
3. **Conversation grouping** by date (Today, Yesterday, This Week, Earlier)
4. **Better empty state** messaging

### ChatSidebar Updates
```tsx
// Add search input at top
<input 
  placeholder="Search conversations..."
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// Group conversations by date
const grouped = groupByDate(filteredConversations);
// Today, Yesterday, This Week, Earlier sections
```

---

## 4. Dark Mode Redesign - Dark Green Graphite

### Color Palette Update
Transform the crimson-based dark mode to a sophisticated dark green graphite:

**Updated Dark Mode Colors (`src/index.css`)**
```css
.dark {
  /* Dark Graphite Green Base */
  --background: 160 15% 5%;        /* Near black with green tint */
  --foreground: 45 20% 92%;        /* Warm cream */

  --card: 160 12% 9%;              /* Dark graphite */
  --card-foreground: 45 20% 92%;

  --popover: 160 12% 9%;
  --popover-foreground: 45 20% 92%;

  --primary: 43 55% 52%;           /* Keep gold accent */
  --primary-foreground: 160 15% 5%;

  --secondary: 160 10% 14%;        /* Subtle green tint */
  --secondary-foreground: 45 20% 92%;

  --muted: 160 8% 12%;             /* Muted graphite */
  --muted-foreground: 160 5% 55%;  /* Soft gray-green */

  --accent: 43 55% 48%;
  --accent-foreground: 160 15% 5%;

  --border: 160 8% 18%;            /* Subtle green border */
  --input: 160 10% 12%;
  --ring: 43 55% 52%;

  /* Custom tokens - Dark Green Graphite */
  --graphite: 160 15% 5%;
  --graphite-mid: 160 12% 12%;
  --graphite-light: 160 10% 18%;

  /* Sidebar with green tint */
  --sidebar-background: 160 12% 8%;
  --sidebar-border: 160 8% 16%;
}
```

### Visual Effect
- Background: Almost black with subtle green undertones
- Cards: Slightly lighter graphite with green tint
- Borders: Dark with green hint visible on hover
- Text: Warm cream (not pure white) for eye comfort
- Accents: Gold remains the highlight color

---

## 5. Calendar Module

### New Page: `/calendar`

**Layout Design**
```text
+---------------------------------------------------+
|  Calendar                         [Month Picker]  |
+---------------------------------------------------+
|                                                   |
|    << January 2026 >>                             |
|                                                   |
|  Sun  Mon  Tue  Wed  Thu  Fri  Sat                |
|  [ ]  [ ]  [ ]  [1]  [2]  [3]  [4]                |
|  [5]  [6]  [7*] [8]  [9]  [10] [11]               |
|  [12] [13] [14] [15] [16] [17] [18]               |
|  ...                                              |
|                                                   |
|  * = has entry (dot indicator)                    |
|  Today highlighted with gold accent               |
|                                                   |
+---------------------------------------------------+
|  Selected Date Entry Preview                      |
|  +----------------------------------------------+ |
|  | "Morning Reflections"                        | |
|  | "Today I felt grateful for..."               | |
|  | Mood: Good | 234 words                       | |
|  +----------------------------------------------+ |
+---------------------------------------------------+
```

### Features
- Month navigation with smooth transitions
- Dot indicators on dates with journal entries
- Today highlighted with gold circle
- Tap date to see entry preview
- Navigate to Write page to edit
- Streak visualization (consecutive days with entries)

### New Files
| File | Purpose |
|------|---------|
| `src/pages/CalendarPage.tsx` | Main calendar view |
| `src/components/calendar/MonthView.tsx` | Calendar grid component |
| `src/components/calendar/DayCell.tsx` | Individual day cell |
| `src/components/calendar/EntryPreview.tsx` | Selected date entry preview |

### Bottom Nav Update
Add calendar icon to navigation:
- Replace one icon or add as 6th option
- Recommended: Add between Write and Orchard

---

## 6. Home Layout - Exact Wireframe Match

### Reference Analysis
From the wireframe image:
1. **Header**: "43 *of* 365" format (italic "of") - day of year counter
2. **Theme toggle**: Circular button (moon/sun) top-right
3. **Sidebar**: Contains hamburger menu, search icon, "New Chat" with plus icon
4. **Convos section**: Collapsible with chevron, list of past conversations
5. **Greeting**: "Hey, {Name}." in large Instrument Serif
6. **Subtitle**: "How Was Your Day?" lighter weight
7. **Input**: Large pill-shaped, rounded with send button
8. **Bottom nav**: Floating pill with 5 circular icons

### Header Updates
```tsx
// Current: "Day 1" 
// New: "43 of 365" (current day of year)
const dayOfYear = Math.ceil(
  (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) 
  / (1000 * 60 * 60 * 24)
);

<span className="font-serif text-lg">
  {dayOfYear} <span className="italic text-muted-foreground">of</span> 365
</span>
```

### ChatSidebar Updates
Match wireframe exactly:
- Hamburger icon top-left
- Search icon top-right
- "New Chat" with document+ icon
- "Convos" collapsible section with chevron
- Conversation list with dates

### Input Styling
- Larger pill (py-4 px-6)
- Subtle shadow
- Rounded-full
- Gold send button

---

## 7. Mobile Responsiveness

### Approach
Mobile-first design with progressive enhancement for larger screens.

### Key Responsive Patterns

#### Bottom Navigation
```css
/* Already mobile-optimized */
/* Add safe area insets for notched phones */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}
```

#### Home Page
- Full-width greeting on mobile
- Input spans container width
- Sidebar becomes overlay sheet on mobile
- Touch-friendly tap targets (min 44px)

#### Chat Messages
- Bubbles max-width 85% on mobile, 70% on desktop
- Proper padding for thumb reach

#### Calendar
- Responsive grid (larger cells on mobile for touch)
- Month navigation with swipe gestures (optional)

#### Profile Page
- Stack sections vertically
- Full-width cards
- Large touch targets for toggles

### Utility Classes to Add
```css
/* Touch-friendly sizing */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Safe area padding */
.pt-safe { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

/* Mobile text scaling */
@media (max-width: 380px) {
  .text-responsive {
    font-size: 0.9em;
  }
}
```

---

## 8. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/lib/haptics.ts` | Haptic feedback utility |
| `src/lib/sounds.ts` | Sound effects manager |
| `src/pages/CalendarPage.tsx` | Calendar module page |
| `src/components/calendar/MonthView.tsx` | Calendar grid |
| `src/components/calendar/DayCell.tsx` | Day cell component |
| `src/components/calendar/EntryPreview.tsx` | Entry preview card |
| `public/sounds/send.mp3` | Send sound effect |
| `public/sounds/receive.mp3` | Receive sound effect |
| `public/sounds/success.mp3` | Success sound |
| `public/sounds/click.mp3` | Click sound |

### Modified Files
| File | Changes |
|------|---------|
| `src/index.css` | Dark green graphite theme colors |
| `src/pages/HomePage.tsx` | Day of year counter, wireframe layout match |
| `src/components/chat/ChatSidebar.tsx` | Search, collapsible convos, wireframe match |
| `src/components/chat/ChatInput.tsx` | Larger pill styling |
| `src/components/chat/GreetingHeader.tsx` | Responsive sizing |
| `src/components/layout/BottomNav.tsx` | Add calendar icon, safe area padding |
| `src/App.tsx` | Add CalendarPage route |
| `tailwind.config.ts` | New graphite color tokens |

---

## 9. Implementation Order

### Phase 1: Theme & Responsiveness
1. Update dark mode to graphite green palette
2. Add responsive utility classes
3. Test on mobile viewports

### Phase 2: Home Layout Polish
1. Update header to "X of 365" format
2. Redesign ChatSidebar per wireframe
3. Polish ChatInput styling
4. Verify conversation persistence works

### Phase 3: Haptics & Sound
1. Create haptics utility
2. Create sound manager
3. Add sound files
4. Integrate at key interaction points

### Phase 4: Calendar Module
1. Create CalendarPage with MonthView
2. Query journal entries by date
3. Add entry preview component
4. Integrate with navigation

### Phase 5: Polish
1. GSAP animations for calendar
2. Mobile gesture support
3. Sound/haptic preference toggle in settings
4. Cross-browser testing

---

## Technical Details

### Haptic API Browser Support
- Chrome Android: Full support
- Safari iOS: Partial (uses Taptic Engine when available)
- Desktop: No-op fallback (silent fail)

### Sound Synthesis Alternative
If hosting sound files is an issue, use Web Audio API:
```typescript
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
// Generate tones programmatically
```

### Calendar Date Calculations
```typescript
import { startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isToday, format } from 'date-fns';

const daysInMonth = eachDayOfInterval({
  start: startOfMonth(currentDate),
  end: endOfMonth(currentDate)
});
```

### Mobile Touch Optimization
- Use `touch-action: manipulation` for faster taps
- Avoid hover-dependent interactions
- Ensure 44px minimum touch targets
- Add `user-select: none` where appropriate

---

## Summary

This enhancement plan delivers a premium mobile experience with:
- Tactile haptic feedback for key interactions
- Subtle sound effects for audio cues
- Dark graphite green aesthetic for sophisticated dark mode
- Full calendar module for date-based navigation
- Pixel-perfect home layout matching wireframe
- Mobile-first responsive design throughout

The implementation follows existing patterns and uses the established GSAP animation library for smooth transitions.
