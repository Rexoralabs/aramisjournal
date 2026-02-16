

# Aramis: AI Fixes, Cellar Overhaul, Settings, Focus Timer, Auth Image

---

## Root Cause: AI Not Working (Summary Button + Cellar AI)

The `supabase/config.toml` file only contains `project_id` -- it is **missing the edge function declaration** for `chat`. Without `[functions.chat]` in the config, the function is never deployed, so all calls to `/functions/v1/chat` fail silently. This is the single root cause for both:
- AI Summary button not working in Compose
- AI chat not working in the Cellar sidebar

**Fix**: Add the function declaration to `supabase/config.toml`:
```toml
[functions.chat]
verify_jwt = false
```

Then redeploy the edge function. No code changes needed to `useStreamChat` or the edge function itself -- they are correctly implemented.

---

## Database Migration

Add a `pinned` column and an `ai_category` column to `journal_entries`:

```sql
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS ai_category TEXT;
```

---

## Changes by Area

### 1. Fix AI (config.toml + deploy)

**`supabase/config.toml`**: Add `[functions.chat]` with `verify_jwt = false`

Deploy the `chat` edge function. This fixes both the Compose AI Summary button and the Cellar AI sidebar.

---

### 2. Cellar Overhaul -- AI Categorization + Topic Filters + Pinning

**Cellar Figma Reference Analysis:**
- Large serif "The Cellar" title top-left
- Centered "Topics" label with a row of rounded gold pill filter buttons
- 4-column masonry grid of white/cream cards below
- AI sparkle button top-right

**New: AI Categorization Edge Function**

Create `supabase/functions/categorize/index.ts`:
- Accepts all entry content as input
- Calls Lovable AI with a tool-calling prompt to return structured JSON: `{ entries: [{ id, category }] }`
- Categories are AI-generated topic labels (e.g., "Personal Growth", "Work", "Relationships", "Health")
- Returns the mapping so the frontend can group and filter

**`src/hooks/useCellarAI.ts`** (new hook):
- `useCategorizeEntries()` -- Calls the `categorize` edge function with all entries
- Stores results locally (and persists `ai_category` to each entry in DB)
- Returns `{ categories: string[], entriesByCategory: Map }`

**`src/pages/CellarPage.tsx`** changes:
- Add "Topics" section with horizontally scrollable pill filter buttons
- "All" pill (default) + one pill per AI-generated category
- Clicking a pill filters the masonry grid to that category
- Add "Categorize" button (sparkle icon) that triggers AI categorization
- Masonry grid grouped by category with section headers when "All" is selected

**`src/components/cellar/ThoughtCard.tsx`** changes:
- Add a pin icon (toggle) in top-right corner on hover
- Pinned entries show a subtle pin indicator and sort to the top
- Category label badge at the bottom of the card

**Pin functionality**:
- `useTogglePin()` hook -- updates `pinned` column on `journal_entries`
- Pinned entries always appear first in the grid regardless of filter

---

### 3. Settings Module Enhancements

**`src/pages/AppSettingsPage.tsx`** additions:

New sections to add:

**Focus Timer Settings** (new section):
- Work duration selector: 15 / 25 / 30 / 45 / 60 minutes (pill buttons)
- Break duration selector: 5 / 10 / 15 minutes
- Long break duration: 15 / 20 / 30 minutes
- Sessions before long break: 3 / 4 / 5
- Store in localStorage (no DB needed)

**Account section** (new):
- Email display (read-only)
- Change password link
- Sign out button

**Privacy section** (new):
- Link to Privacy page (already exists at `/privacy`)

Reorder sections: Writing, Focus, Experience, Notifications, Appearance, Data, Account, Privacy, About

---

### 4. Variable Time on Focus (Pomodoro Timer)

**`src/components/focus/PomodoroTimer.tsx`** changes:
- Accept `workDuration`, `breakDuration` props (with defaults 25/5)
- Read settings from localStorage on mount
- Add a settings gear icon that opens an inline duration picker
- Duration picker: preset pills (15, 25, 30, 45, 60 min for work; 5, 10, 15 for break)
- Custom input field for arbitrary minutes
- When duration changes, reset the timer

**`src/pages/OrchardPage.tsx`** (FocusPage) changes:
- Read timer settings from localStorage
- Pass them to `PomodoroTimer`

---

### 5. Auth Page -- Add Uploaded Image

Copy the uploaded sunset image to `src/assets/auth-bg.jpg`.

**`src/pages/AuthPage.tsx`** changes:
- Import the image: `import authBg from "@/assets/auth-bg.jpg"`
- Replace the CSS gradient on the left panel with the image as a background
- Use `style={{ backgroundImage: \`url(\${authBg})\`, backgroundSize: "cover", backgroundPosition: "center" }}`
- Add a dark overlay gradient for text readability: `bg-gradient-to-t from-black/60 via-transparent to-black/30`
- Keep the "Aramis" brand and tagline text over the image (white text)

---

### 6. Compose AI Summary Fix (already fixed by config.toml)

The `handleGenerateSummary` function in `WritePage.tsx` is correctly implemented. It calls `streamChat` which hits `/functions/v1/chat`. Once the edge function is deployed via the config fix, this will work.

One additional improvement: the `useUpdateEntry` mutation uses `...input` spread which passes `ai_summary` through correctly since the DB schema already supports it. No code changes needed here.

---

## New Files

| File | Purpose |
|------|---------|
| `supabase/functions/categorize/index.ts` | AI categorization edge function using tool calling |
| `src/hooks/useCellarAI.ts` | Hook for triggering and consuming AI categorization |
| `src/assets/auth-bg.jpg` | Uploaded sunset image for auth left panel |

## Modified Files

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add `[functions.chat]` and `[functions.categorize]` declarations |
| `src/pages/CellarPage.tsx` | Topics filter bar, AI categorize button, grouped masonry, pin sorting |
| `src/components/cellar/ThoughtCard.tsx` | Pin toggle, category badge |
| `src/hooks/useJournal.ts` | Add `useTogglePin` mutation, update JournalEntry type for `pinned` and `ai_category` |
| `src/pages/AppSettingsPage.tsx` | Focus timer settings, Account section, Privacy link |
| `src/components/focus/PomodoroTimer.tsx` | Variable duration props, inline settings picker |
| `src/pages/OrchardPage.tsx` | Read timer settings, pass to PomodoroTimer |
| `src/pages/AuthPage.tsx` | Replace gradient with uploaded image background |

## Implementation Order

1. Database migration (pinned, ai_category columns)
2. Fix `supabase/config.toml` and deploy edge functions
3. Copy auth image asset
4. Auth page image update
5. Cellar AI categorization (new edge function + hook + UI)
6. Cellar pin functionality
7. Variable timer in Focus
8. Settings module expansion
9. End-to-end testing of AI features

