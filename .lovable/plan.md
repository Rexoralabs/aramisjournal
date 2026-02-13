
# Aramis Comprehensive Update Plan
## Cellar-Compose Linking, Module Rename, AI Fixes, Auth/Analytics Refinement, Focus Module, Gamification, Offline, RAG, Notifications

---

## Overview

11 major areas of work, ordered by implementation sequence:

1. Database migrations (ai_summary, todos, achievements, points)
2. Rename "Write" to "Compose" (routes, nav, references)
3. Cellar click-to-edit linking
4. Compose fixes (formatting, multi-note, remove toasts, AI summary persistence)
5. Auth page redesign (split-panel layout matching reference)
6. Replace Orchard with Focus module (To-Do + Pomodoro)
7. Insights/Analytics page refinement (dashboard-style matching reference)
8. Cellar AI and RAG implementation
9. Gamification system (points + achievements)
10. Offline mode (PWA enhancement)
11. Notifications enhancement

---

## 1. Database Migrations

Four schema changes in a single migration:

```sql
-- AI Summary column on journal_entries
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- Todos table
CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own todos" ON public.todos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Points column on user_streaks
ALTER TABLE public.user_streaks ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
```

---

## 2. Rename "Write" to "Compose"

### Files Changed
- **`src/components/layout/BottomNav.tsx`** -- Change nav item: path `/write` to `/compose`, label "Write" to "Compose"
- **`src/App.tsx`** -- Change route `path="/write"` to `path="/compose"`
- **`src/pages/CellarPage.tsx`** -- Update empty-state text referencing "Compose module"

---

## 3. Cellar Click-to-Edit

### `src/components/cellar/ThoughtCard.tsx`
- Import `useNavigate` from react-router-dom
- Wrap card in clickable div with `onClick={() => navigate('/compose?entry=' + entry.id)}`
- Add `cursor-pointer hover:scale-[1.02] transition-transform`

---

## 4. Compose Module Fixes

### 4.1 Multiple Notes Support (`src/pages/WritePage.tsx`)
- Add `isNewEntryRef = useRef(false)` flag
- When "New Entry" is clicked, set `isNewEntryRef.current = true`
- In auto-save logic: when `isNewEntryRef` is true AND no `selectedEntryId`, always create new entry (skip todayEntry overwrite)
- After creation, update URL with new entry ID and reset the ref

### 4.2 Remove "Saved" Toasts (`src/hooks/useJournal.ts`)
- Remove `toast.success("Entry saved successfully!")` from `useCreateEntry.onSuccess` (line 123)
- Remove `toast.success("Entry updated!")` from `useUpdateEntry.onSuccess` (line 157)
- Keep all error toasts intact

### 4.3 Fix Formatting Toolbar (`src/pages/WritePage.tsx`)
Split `insertFormatting` into two distinct functions:

- **`wrapSelection(prefix, suffix)`** -- For Bold (`**`) and Italic (`*`): wraps selected text or inserts at cursor
- **`prependLine(prefix)`** -- For Heading (`## `), List (`- `), Quote (`> `): finds the beginning of the current line and prepends the prefix there

Update toolbar buttons to call the correct function for each format type.

### 4.4 AI Summary -- Editable and Persisted (`src/pages/WritePage.tsx`)
- Load `ai_summary` from the current entry when selecting it
- Make the summary display a `textarea` instead of a `<p>` tag
- Auto-save summary changes to DB via debounced `updateEntry` with the new `ai_summary` field
- Update `useUpdateEntry` in `useJournal.ts` to handle the `ai_summary` field

---

## 5. Auth Page Redesign

### Design Direction (matching the BrightNest reference image)
The reference shows a **split-panel layout**:
- **Left panel**: Warm gradient background with brand name top-left, motivational tagline bottom-left
- **Right panel**: Clean white card with form fields, clean labels, a prominent dark submit button, "or continue with" social login row, and toggle link at bottom

### Changes to `src/pages/AuthPage.tsx`
- Replace single centered column with a two-panel `grid grid-cols-1 lg:grid-cols-2` layout
- **Left panel**: Full-height warm gradient (`bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100`), "Aramis" brand top-left, motivational copy bottom-left ("Get access to your personal hub for clarity and productivity.")
- **Right panel**: White/card background, clean form with:
  - Decorative accent icon (sparkle) above title
  - "Create an account" / "Welcome back" heading
  - Subtitle text
  - Clean labeled inputs with border styling (not underline -- matching reference which shows bordered inputs)
  - Password field with show/hide toggle (Phosphor eye icon)
  - Dark full-width rounded submit button
  - "or continue with" divider (placeholder for future OAuth)
  - Toggle link at bottom ("Already have an account? Sign in")
- Replace Lucide icons with Phosphor via `@iconify/react`
- On mobile: stack panels vertically (left panel shorter, right panel full)

---

## 6. Replace Orchard with Focus Module

### Remove Orchard
- Rewrite `src/pages/OrchardPage.tsx` as `FocusPage` content (keep the filename to minimize routing changes, but update the route path)
- Update `BottomNav.tsx`: change Orchard entry to path `/focus`, label "Focus", icon `ph:timer-duotone`
- Update `App.tsx`: change route from `/orchard` to `/focus`
- Remove Three.js/R3F Canvas code entirely from the page

### New Components

**`src/components/focus/PomodoroTimer.tsx`**
- Circular SVG progress ring (radius ~120, stroke-dasharray animation)
- 25-minute work / 5-minute break cycles
- States: idle, running, paused, break
- Start/Pause/Reset button controls
- Session counter display
- Notification on timer completion
- GSAP animation for timer state transitions

**`src/components/focus/TodoList.tsx`**
- Add task input with rounded pill + plus button
- List of `TodoItem` components
- Empty state message

**`src/components/focus/TodoItem.tsx`**
- Checkbox (Phosphor icon), title text, delete button
- Completed tasks: strikethrough + reduced opacity
- Slide-in animation on creation, fade-out on deletion

**`src/hooks/useTodos.ts`**
- `useTodos()` -- Fetch all todos for current user, ordered by created_at desc
- `useCreateTodo()` -- Insert new todo
- `useToggleTodo()` -- Toggle completed status
- `useDeleteTodo()` -- Delete todo

### Focus Page Layout
```text
+------------------------------------------+
|  Focus                                   |
+------------------------------------------+
|  [Large Pomodoro Timer Ring]             |
|  25:00                                   |
|  [Start]  [Reset]                        |
|  Sessions: 3                             |
+------------------------------------------+
|  Tasks                        [+ input]  |
|  [ ] Task 1                      [x]     |
|  [x] Task 2 (strikethrough)     [x]     |
+------------------------------------------+
```

---

## 7. Insights/Analytics Page Refinement

### Design Direction (matching the Karla dashboard reference)
The reference shows:
- Dark glass cards in a horizontal row (4 stat cards) with mini sparkline charts and metadata
- A large area chart below with time-range toggle pills (7d / 30d)
- Side promotional cards

### Adapted for Aramis
- **Top row**: 4 stat cards in `grid-cols-2 lg:grid-cols-4` -- each card is a glass-card with:
  - Small label (e.g., "Today's Words", "This Week", "This Month", "All Time")
  - Large number value
  - Mini sparkline or trend indicator
  - Date range and entry count metadata at bottom
- **Main chart section**: Large AreaChart (word count over time, last 30 days) with 7d/30d toggle pills
- **Secondary row**: Side-by-side `grid-cols-1 lg:grid-cols-2`:
  - BarChart (Entries Per Week)
  - Mood trend AreaChart
- **Bottom section**: Monthly progress card with progress bar
- **New data calculations**:
  - Total words per day (for word count chart)
  - Most active writing day of week
  - Day-of-week activity breakdown

### Changes to `src/pages/InsightsPage.tsx`
- Add word count trend data (aggregate `word_count` per day from entries)
- Add most active day calculation
- Restructure grid for dashboard-style layout
- Add mini sparklines in stat cards using small inline Recharts
- Polish filter chips with pill shape (`rounded-full`)

---

## 8. AI RAG (Retrieval-Augmented Generation)

### Edge Function Update (`supabase/functions/chat/index.ts`)
- Accept optional `context` field in request body
- If present, prepend to system prompt: "Here are the user's recent journal entries for reference:\n\n{context}"

### Frontend Changes

**`src/hooks/useStreamChat.ts`**
- Add optional `context?: string` to `StreamChatOptions`
- Include `context` in request body when present

**`src/pages/HomePage.tsx`**
- Import `useJournalEntries`
- Before sending chat messages, build a condensed context string from recent entries (titles + first 100 chars, last 20 entries)
- Pass as `context` parameter to `streamChat`

**`src/components/cellar/CellarAISidebar.tsx`**
- Refactor to pass journal entries as `context` field instead of injecting as a fake user message
- Remove the `buildSystemPrompt` function that prepends entries as a user message
- Instead, pass the entries context string via the `context` parameter

---

## 9. Gamification System

### New Hooks

**`src/hooks/useAchievements.ts`**
- `useAchievements()` -- Fetch user's unlocked achievements
- `useUnlockAchievement()` -- Insert new achievement (idempotent via unique constraint)

**`src/hooks/useGamification.ts`**
- `useAwardPoints(amount)` -- Increment `total_points` on `user_streaks`
- `useCheckAchievements()` -- Check conditions and unlock achievements
- Achievement definitions (key, name, condition, icon):
  - `first_words` -- Write first entry
  - `week_warrior` -- 7-day streak
  - `centurion` -- 100 entries
  - `marathon_writer` -- 1000+ words in one entry
  - `night_owl` -- Write after 10 PM
  - `early_bird` -- Write before 7 AM
  - `focused_mind` -- Complete 5 pomodoros in a day
  - `task_master` -- Complete 10 tasks

### Points Integration
- In `WritePage.tsx` auto-save: award +10 points on new entry, +5 bonus for 100+ words, +15 for 500+
- In `PomodoroTimer.tsx`: award +8 points on session completion
- In `TodoItem.tsx`: award +3 points on task completion

### Display
- **`src/pages/ProfilePage.tsx`**: Add points display and achievement badges section
- **`src/pages/InsightsPage.tsx`**: Add total points at bottom

---

## 10. Offline Mode

### PWA Enhancement (`vite.config.ts`)
- Add `runtimeCaching` configuration for Supabase API calls using `NetworkFirst` strategy
- Add `navigateFallback: '/index.html'`
- Add `navigateFallbackDenylist: [/^\/~oauth/]` for OAuth compatibility

### New File: `src/lib/offlineQueue.ts`
- Queue mutations in `localStorage` when `navigator.onLine === false`
- On `online` event, flush queued mutations
- Wrapper function for Supabase mutations

### New Component: `src/components/layout/OfflineBanner.tsx`
- Subtle top banner showing "You're offline. Changes will sync when reconnected."
- GSAP slide-in/out animation

### `src/App.tsx`
- Add `online`/`offline` event listeners
- Render `OfflineBanner` conditionally

---

## 11. Notifications Enhancement

### `src/lib/notifications.ts`
- Add `tag: 'aramis-reminder'` to prevent duplicate notifications
- Use service worker registration (`navigator.serviceWorker.ready`) when available
- Add permission status check function for Settings display

### `src/pages/AppSettingsPage.tsx`
- Show notification permission status (granted/denied/default)
- Add visual indicator next to toggle

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useTodos.ts` | CRUD hooks for todos table |
| `src/hooks/useAchievements.ts` | Achievement tracking hooks |
| `src/hooks/useGamification.ts` | Points system and achievement checks |
| `src/lib/offlineQueue.ts` | Offline mutation queue |
| `src/components/focus/PomodoroTimer.tsx` | Circular countdown timer |
| `src/components/focus/TodoList.tsx` | To-do list component |
| `src/components/focus/TodoItem.tsx` | Individual todo item |
| `src/components/layout/OfflineBanner.tsx` | Offline status indicator |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/WritePage.tsx` | Fix formatting, multi-note, AI summary persistence |
| `src/hooks/useJournal.ts` | Remove success toasts, add ai_summary support |
| `src/components/cellar/ThoughtCard.tsx` | Click-to-navigate to Compose |
| `src/pages/CellarPage.tsx` | Update empty state text |
| `src/components/layout/BottomNav.tsx` | Rename Write to Compose, Orchard to Focus |
| `src/App.tsx` | Update routes, add offline listener, offline banner |
| `src/pages/AuthPage.tsx` | Complete redesign with split-panel layout |
| `src/pages/InsightsPage.tsx` | Dashboard-style layout with stat cards and charts |
| `src/pages/OrchardPage.tsx` | Complete rewrite as Focus page (Pomodoro + Todos) |
| `src/pages/AppSettingsPage.tsx` | Notification status indicator |
| `src/pages/HomePage.tsx` | Pass journal context for RAG |
| `src/hooks/useStreamChat.ts` | Accept context parameter |
| `supabase/functions/chat/index.ts` | Accept and use context field for RAG |
| `src/components/cellar/CellarAISidebar.tsx` | Use context field instead of fake user message |
| `vite.config.ts` | Enhanced PWA offline caching |
| `src/pages/ProfilePage.tsx` | Points and achievements display |
| `src/lib/notifications.ts` | Tag deduplication, SW integration |

---

## Implementation Order

1. Database migrations (ai_summary, todos, achievements, points)
2. Rename Write to Compose (routes, nav)
3. Cellar click-to-edit linking
4. Compose fixes (formatting, multi-note, remove toasts, AI summary)
5. Auth page redesign (split-panel matching reference)
6. Replace Orchard with Focus (Pomodoro + To-Do)
7. Insights page refinement (dashboard layout matching reference)
8. RAG implementation (edge function + frontend context passing)
9. Gamification system (hooks, points, achievements, profile display)
10. Offline mode (PWA caching, queue, banner)
11. Notifications enhancement
12. Deploy edge function and end-to-end testing
