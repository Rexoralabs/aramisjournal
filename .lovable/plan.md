# Aramis Comprehensive Refinement Plan

## Write Module Overhaul, Icons Migration, Calendar Animation, Orchard 3D, Cellar AI Unification, Insights Charts, Settings Expansion, Home Layout Match

---

## Overview

This plan addresses 12 distinct changes across the application:

1. **Write Module** -- Remove mood selector, "Today" button, save button; add auto-save, formatting toolbar, AI summary, and entry sidebar
2. **Remove date from bottom nav** ("02.12.26")
3. **Switch all icons from Solar Iconify to Phosphor** icons
4. **Calendar** -- Make grid smaller, add GSAP flip-up/flip-down page animation for month transitions
5. **Fix Orchard icon** in bottom nav (not showing)
6. **Orchard 3D immersive experience** -- Full parallax walkthrough with trees, grass, depth layers using GSAP ScrollTrigger (**React Three Fiber (R3F)**, **Three.js**, **WebGL**, and **GSAP**)
7. **Cellar AI unification** -- Cellar sidebar AI shares the same conversation history as Home chat
8. **Insights** -- Add a line graph and bar graph (using Recharts, already installed)
9. **Settings module** -- Add more features and content
10. **Home page** -- Match the wireframe layout exactly (sidebar, "43 of 365", greeting, pill input, 5-icon nav)

---

## 1. Write Module Overhaul

### Removals

- **Mood selector button** (lines 226-242 in WritePage.tsx) -- Remove the emoji circle button and the `showMoodSelector` state and `MoodSelector` dropdown
- **"Today" entry selector button** (lines 186-224) -- Remove the dropdown that shows "Today" with a chevron and entry list
- **Save button** (lines 269-278) -- Remove the manual save/update button
- **Date display** (lines 294-299) -- Remove the "Wednesday, February 12, 2026" line

### Auto-Save

Add a debounced auto-save using `useEffect` + `useCallback`:

- Debounce timer of 1.5 seconds after typing stops
- Auto-save triggers `updateEntry` if entry exists, or `createEntry` if new
- Show a subtle "Saved" indicator (small text near the word count)
- Track save status: "Saving...", "Saved", or unsaved indicator

### Formatting Toolbar

Add a simple formatting bar above the text area with basic controls:

- **Bold** (wraps selection in `**text**`)
- **Italic** (wraps in `*text*`)
- **Heading** (prepends `##` )
- **List** (prepends `-` )
- **Quote** (prepends `>` )

The content remains stored as plain text with markdown syntax. The toolbar inserts markdown characters around the cursor position or selection.

### AI Summary Button

- Add a button below the content area labeled "Generate Summary"
- When pressed, send the current content to the `chat` edge function with a system prompt: "Summarize the following journal entry in 2-6 concise sentences."
- Display the summary in a glass-card below the editor with a subtle fade-in animation
- The summary Should Be editable and saved in DB

### Entry Sidebar

Add a sidebar (similar to ChatSidebar) on the Write page:

- **Hamburger button** in the header to toggle it
- **"New Entry"** button at top
- **Entry list** showing all journal entries with title, date, and a delete button
- **Delete confirmation** via AlertDialog
- Clicking an entry loads it into the editor (same as current `handleSelectEntry` logic)

---

## 2. Remove Date from Bottom Nav

In `BottomNav.tsx` line 77-79, remove:

```tsx
<span className="absolute right-4 sm:right-6 bottom-1 text-xs font-ui text-muted-foreground">
  {format(new Date(), "MM.dd.yy")}
</span>
```

---

## 3. Switch to Phosphor Icons

Replace all `@iconify/react` Solar icons with Phosphor icons. Phosphor icons are available via Iconify with the prefix `ph:`.

### Icon Mapping


| Current Solar Icon                  | Phosphor Replacement        |
| ----------------------------------- | --------------------------- |
| `solar:home-2-bold-duotone`         | `ph:house-duotone`          |
| `solar:pen-new-square-bold-duotone` | `ph:pencil-simple-duotone`  |
| `solar:calendar-bold-duotone`       | `ph:calendar-duotone`       |
| `solar:tree-bold-duotone`           | `ph:tree-duotone`           |
| `solar:archive-bold-duotone`        | `ph:vault-duotone`          |
| `solar:chart-square-bold-duotone`   | `ph:chart-bar-duotone`      |
| `solar:user-rounded-bold-duotone`   | `ph:user-circle-duotone`    |
| `solar:hamburger-menu-linear`       | `ph:list`                   |
| `solar:sun-bold-duotone`            | `ph:sun-duotone`            |
| `solar:moon-bold-duotone`           | `ph:moon-duotone`           |
| `solar:plain-bold`                  | `ph:paper-plane-right-fill` |
| `solar:stars-bold-duotone`          | `ph:sparkle-duotone`        |
| `solar:close-circle-linear`         | `ph:x-circle`               |


### Files to Update

- `src/components/layout/BottomNav.tsx`
- `src/pages/HomePage.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/pages/CellarPage.tsx`
- `src/components/cellar/CellarAISidebar.tsx`

---

## 4. Calendar Flip Animation

### Make Calendar Smaller

- Reduce the calendar grid cell size by using smaller padding and font sizes
- Add `max-w-md mx-auto` to constrain the calendar width on desktop

### GSAP Flip Animation

Replace the current horizontal slide (x-based) month transition with a vertical flip effect:

**Next month (flip up):**

```typescript
gsap.to(monthRef.current, {
  rotateX: -90,
  opacity: 0,
  duration: 0.3,
  ease: "power2.in",
  transformOrigin: "bottom center",
  onComplete: () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    gsap.fromTo(monthRef.current,
      { rotateX: 90, opacity: 0, transformOrigin: "top center" },
      { rotateX: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  }
});
```

**Previous month (flip down):**

```typescript
gsap.to(monthRef.current, {
  rotateX: 90,
  opacity: 0,
  duration: 0.3,
  ease: "power2.in",
  transformOrigin: "top center",
  onComplete: () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    gsap.fromTo(monthRef.current,
      { rotateX: -90, opacity: 0, transformOrigin: "bottom center" },
      { rotateX: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  }
});
```

Add `perspective: 1000px` to the parent container for proper 3D perspective.

---

## 5. Fix Orchard Icon in Bottom Nav

The current icon is `solar:tree-bold-duotone`. After the Phosphor migration, it becomes `ph:tree-duotone`. This should render correctly as Phosphor has a tree icon. If the current Solar one isn't loading, this migration will fix it.

---

## 6. Orchard -- Immersive Parallax Experience

### **The 3D Orchard Architecture**

**1. The 3D Scene (Back to Front):**

- **The Skybox/Environment:** A 3D Background Gradient or a large Sphere wrapping the scene.
- **The Forest (Deep Z-Space):** Instead of silhouettes, use **Instanced Meshes** of 3D trees scattered at various `z` depths (from -50 to -10).
- **The Path (Ground Plane):** A 3D PlaneGeometry with a grass texture, stretching toward the horizon.
- **Fruit Milestones:** 3D models (glTF) of fruits floating in space, positioned at specific "stations" along the Z-axis.

**2. GSAP Camera Navigation:**  
Instead of moving layers, we animate the **Camera's Z-position**. As the user scrolls, the camera "walks" through the trees.

**javascript**

```
// GSAP Timeline to fly the camera through the orchard
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#viewport",
    start: "top top",
    end: "bottom bottom",
    scrub: 1 // Smoothly tracks scroll position
  }
});

// Move camera forward and tilt slightly as you walk
tl.to(camera.position, { z: -100, ease: "none" }); 

```

Use code with caution.

**3. Visual Components (The R3F Way):**  
Replace your CSS `.tree-silhouette` with a reusable React component:

**jsx**

```
function Tree({ position }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[1, 3, 8]} /> {/* Simple 3D cone tree */}
      <meshStandardMaterial color="#2d4f1e" />
    </mesh>
  );
}
```

---

## 7. Cellar AI Shares Home Chat History

### Current Behavior

The CellarAISidebar has its own local `messages` state -- conversations are not persisted and don't connect to the Home chat system.

### Changes

- **CellarAISidebar** will use the same `useChatConversations`, `useChatMessages`, `useCreateConversation`, `useAddMessage` hooks from `useChatHistory`
- When the sidebar opens, it creates a new conversation (or continues the most recent one)
- Messages sent from the Cellar sidebar are stored in the `chat_conversations`/`chat_messages` tables
- These conversations appear in the Home module's ChatSidebar history
- The system prompt is still specialized for journal exploration, but the conversation persists

### Implementation

Replace local state in `CellarAISidebar` with the shared hooks:

```tsx
const { data: conversations } = useChatConversations();
const createConversation = useCreateConversation();
const addMessage = useAddMessage();
// ... use same pattern as HomePage
```

---

## 8. Insights -- Line Graph and Bar Graph

### Using Recharts (already installed)

**Line Graph: Mood Over Time**

- X-axis: dates (last 30 days)
- Y-axis: mood value (1-5 scale)
- Line with primary color, area fill with gradient
- Tooltip showing date and mood label

**Bar Graph: Entries Per Week**

- X-axis: week labels (last 8 weeks)
- Y-axis: number of entries
- Bars in primary color with rounded tops
- Clean minimal styling matching the design system

### Placement

Replace the current "Mood Breakdown" and "This Week" cards with the two graphs side by side (or stacked on mobile).

---

## 9. Settings Module Expansion

Add these new sections to `AppSettingsPage.tsx`:

### New Features

1. **Writing Goal** -- Daily word count target (e.g., 100, 250, 500 words) with a selector
2. **Theme Accent Color** -- Choice between Gold (current), Rose, Sage, Ocean
3. **Auto-Save Interval** -- Toggle between 1s, 2s, 3s auto-save delay
4. **Data & Storage** -- Show storage usage estimate (count of entries, approximate size)
5. **Journal Backup** -- Button to export all entries as JSON (functional)
6. **Clear All Data** -- Danger zone button to delete all journal entries
7. **Language** -- Placeholder for future i18n (display only, "English" selected)

### Reorganization

Group settings into sections:

- **Writing** (Font Size, Writing Goal, Auto-Save)
- **Experience** (Sound, Haptics, AI Prompts)
- **Notifications** (Toggle, Reminder Time)
- **Data** (Backup, Storage, Clear Data)
- **About** (Version, Support link)

---

## 10. Home Page -- Wireframe Match

### Reference Image Analysis

The wireframe shows:

1. **Left sidebar** -- hamburger + search at top, "New Chat" with icon, "Convos" collapsible section, conversation list
2. **Top center** -- "43 *of* 365" (day counter, italic "of")
3. **Top right** -- Theme toggle (circle)
4. **Center** -- Large "Hey, Charis." greeting in serif, "How Was Your Day?" subtitle
5. **Below greeting** -- Large rounded pill input
6. **Bottom** -- 5-icon floating pill nav (Home, Write, Orchard, Grid/Insights, Profile) with date to the right

### Current State vs Wireframe

The current implementation already matches fairly well. Key adjustments:

- **Bottom nav**: Reduce to 5 icons (remove Calendar and Cellar from the main nav, keep them accessible via sidebar or other means). Per the wireframe: Home, Write, Orchard, Insights, Profile.

Actually, looking more carefully, the wireframe shows exactly 5 icons. However, the user has also asked for Calendar, Cellar, etc. So the bottom nav should keep all 7 icons as currently implemented -- the wireframe is a design direction, not a strict icon count. The layout arrangement (sidebar left, counter top-center, toggle top-right, greeting center, input below) is already implemented.

### Adjustments Needed

- The current layout matches the wireframe well. Minor tweaks:
  - Ensure the greeting is vertically centered in available space (already using `flex-1 flex items-center justify-center`)
  - Ensure the pill input has generous padding and rounded-full shape (already done)
  - Sidebar layout matches (already has hamburger, search, New Chat, Convos sections)

No major structural changes needed for the Home page -- it already follows the wireframe.

---

## Files Summary

### New Files

None -- all changes are modifications to existing files.

### Modified Files


| File                                        | Changes                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/pages/WritePage.tsx`                   | Remove mood/today/save, add auto-save, formatting toolbar, AI summary, entry sidebar |
| `src/components/layout/BottomNav.tsx`       | Remove date, switch to Phosphor icons                                                |
| `src/pages/HomePage.tsx`                    | Switch to Phosphor icons                                                             |
| `src/components/chat/ChatInput.tsx`         | Switch to Phosphor icons                                                             |
| `src/pages/CellarPage.tsx`                  | Switch to Phosphor icons                                                             |
| `src/components/cellar/CellarAISidebar.tsx` | Switch to Phosphor icons, integrate shared chat history                              |
| `src/pages/CalendarPage.tsx`                | Smaller grid, GSAP flip animation with perspective                                   |
| `src/pages/OrchardPage.tsx`                 | Full immersive parallax rewrite with layered depth                                   |
| `src/pages/InsightsPage.tsx`                | Add Recharts line and bar graphs                                                     |
| `src/pages/AppSettingsPage.tsx`             | Expand with new settings sections                                                    |
| `src/components/chat/ChatSidebar.tsx`       | Switch Lucide icons to Phosphor where applicable                                     |


### No Database Changes Required

---

## Technical Details

### Auto-Save Debounce Pattern

```typescript
const saveTimerRef = useRef<NodeJS.Timeout>();
const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

useEffect(() => {
  if (!content.trim()) return;
  setSaveStatus("idle");
  
  clearTimeout(saveTimerRef.current);
  saveTimerRef.current = setTimeout(async () => {
    setSaveStatus("saving");
    // save logic...
    setSaveStatus("saved");
  }, 1500);

  return () => clearTimeout(saveTimerRef.current);
}, [content, title]);
```

### Formatting Toolbar -- Markdown Insertion

```typescript
function insertFormatting(textarea: HTMLTextAreaElement, prefix: string, suffix: string = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = `${prefix}${selected}${suffix}`;
  // Update content state with replacement
}
```

### Recharts Minimal Styling

```tsx
<LineChart data={moodData}>
  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
  <YAxis domain={[1, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
  <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
</LineChart>
```

---

## Implementation Order

1. Switch all icons to Phosphor (across all files)
2. Remove date from bottom nav
3. Write module overhaul (removals, auto-save, toolbar, AI summary, sidebar)
4. Calendar flip animation
5. Orchard immersive parallax
6. Cellar AI unification with shared chat history
7. Insights line + bar graphs
8. Settings expansion
9. Testing across all modules