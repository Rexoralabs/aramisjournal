

# Aramis - Premium Minimalist Luxury Journaling Companion
## Complete Redesign Plan

---

## 1. Branding & Typography Overhaul

### App Name Change
- Rename from "Luxe Journal" to **"Aramis"**
- Display name in **Cinzel** typeface across all branding touchpoints

### Typography System
| Role | Font | Weight/Style |
|------|------|--------------|
| Display/Brand | Cinzel | Regular |
| Serif (Headings) | Instrument Serif | Normal |
| Serif (Emphasis) | Cormorant Garamond | Light Italic |
| Sans-Serif (Body) | Instrument Sans | Regular |
| Grotesque (UI Labels) | Bricolage Grotesque | Various |

### Font Loading Strategy
- Add Google Fonts imports for all five typefaces
- Create CSS utility classes for each font family
- Update tailwind.config.ts with new font family definitions

---

## 2. Color Palette & Theming System

### Design Philosophy
Modern luxury Notion-inspired components with a warm, sophisticated palette

### Light Mode (Cream Base)
| Token | Color | Usage |
|-------|-------|-------|
| Background | Cream (#F5F1EB) | Main surfaces |
| Foreground | Deep Crimson (#4A1E1E) | Primary text |
| Primary | Gold (#C9A962) | Accents, CTAs |
| Card | Warm White (#FAF8F5) | Component backgrounds |
| Muted | Warm Gray (#8A8178) | Secondary text |

### Dark Mode (Crimson Base)
| Token | Color | Usage |
|-------|-------|-------|
| Background | Deep Crimson (#1A0A0A) | Main surfaces |
| Foreground | Cream (#F5F1EB) | Primary text |
| Primary | Gold (#D4AF37) | Accents, CTAs |
| Card | Dark Wine (#2A1515) | Component backgrounds |
| Muted | Dusty Rose (#9A7A7A) | Secondary text |

### Implementation
- Update CSS variables in src/index.css with both theme variants
- Add theme toggle using next-themes (already installed)
- Create smooth transition animations between themes

---

## 3. Motion Library Migration

### Replace Framer Motion with GSAP
- Install gsap package
- Create custom React hooks for GSAP animations:
  - `useGsapFadeIn` - Entrance animations
  - `useGsapStagger` - List animations
  - `useGsapScrollTrigger` - Scroll-based reveals
  - `useGsapMorph` - Shape transitions
- Migrate all existing framer-motion animations to GSAP equivalents
- Add GSAP-powered page transitions

### Animation Patterns
- Smooth entrance animations with subtle easing
- Micro-interactions on buttons and cards
- Page transition effects
- Scroll-triggered reveals for content sections

---

## 4. UI Component System (Notion-Inspired Luxury)

### Design Language
- Clean, minimal borders with subtle shadows
- Generous spacing and breathing room
- Soft corners (8-12px radius)
- Subtle hover states with color shifts
- Focus on typography hierarchy

### Core Components to Restyle
- Buttons (primary, secondary, ghost variants)
- Cards (glass effect with theme-aware backgrounds)
- Inputs (minimal, underline or soft-bordered)
- Navigation elements
- Modals and dialogs
- Toast notifications

---

## 5. Module Restructuring

### Today Module - AI Chat Interface
**Complete redesign to modern AI chat experience**

```text
+-----------------------------------------------+
|  [Sidebar Toggle]           [Date] [Streak]   |
+-----------------------------------------------+
|                                               |
|  "Good evening, Marcus"                       |
|  (H1 - Instrument Serif, animated greeting)   |
|                                               |
|  +------------------------------------------+ |
|  |  AI Message Bubble                       | |
|  |  "What's been on your mind today?"       | |
|  +------------------------------------------+ |
|                                               |
|  +------------------------------------------+ |
|  |  User Response Bubble                    | |
|  +------------------------------------------+ |
|                                               |
|  +------------------------------------------+ |
|  |  [Message Input] [Send]                  | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

**Features:**
- Variable time-based greeting with user's name as H1
- Date display in elegant format
- Streak counter (compact)
- Collapsible sidebar for chat history (only this module)
- AI-powered conversational journaling
- Message bubbles with subtle animations

### Write Module - Enhanced Editor
**Add past entries management**

```text
+-----------------------------------------------+
|  [Back]  [Entries List]  [Mood] [Save]        |
+-----------------------------------------------+
|  Select Entry: [Dropdown/Tabs]                |
|  - Today's Entry                              |
|  - Jan 28, 2026 - "Reflection on..."          |
|  - Jan 27, 2026 - "Morning thoughts"          |
+-----------------------------------------------+
|                                               |
|  [Title Input]                                |
|                                               |
|  [Content Editor - Full height]               |
|                                               |
+-----------------------------------------------+
|  [Word Count]                                 |
+-----------------------------------------------+
```

**Features:**
- Entry selector dropdown/tabs to view past entries
- Edit mode for historical entries
- Delete confirmation for entries
- Auto-save with debouncing

### Milestones Module - "The Orchard"
**Standalone immersive achievement experience**

```text
+-----------------------------------------------+
|  Welcome to the Orchard                       |
|  (Atmospheric entrance animation)             |
+-----------------------------------------------+
|                                               |
|   [Tree/Growth Visual Metaphor]               |
|                                               |
|   +--------+  +--------+  +--------+          |
|   | 7 Days |  |30 Days |  |60 Days |          |
|   | Seed   |  |Sprout  |  |Bloom   |          |
|   | [Glow] |  |[Locked]|  |[Locked]|          |
|   +--------+  +--------+  +--------+          |
|                                               |
|   +--------+  +--------+                      |
|   |100 Days|  |365 Days|                      |
|   |Flourish|  |Harvest |                      |
|   |[Locked]|  |[Locked]|                      |
|   +--------+  +--------+                      |
|                                               |
|   "Your dedication bears fruit"               |
|   Progress: 3/7 days to next milestone        |
|                                               |
+-----------------------------------------------+
```

**Psychology-driven design:**
- Growth metaphor (seeds to harvest)
- Visual progress indicators
- Celebratory unlock animations
- Inspirational messaging
- "Almost there" progress bars to drive engagement

### Insights Module - Dashboard First
**AI-powered analytics dashboard**

```text
+-----------------------------------------------+
|  Your Journey                                 |
+-----------------------------------------------+
|  +------------------------------------------+ |
|  | AI Insight Card (Priority)               | |
|  | "You've been most reflective on Sundays" | |
|  +------------------------------------------+ |
|                                               |
|  +----------+  +----------+  +----------+     |
|  | Entries  |  | Streak   |  | Avg Mood |     |
|  |   42     |  |   12     |  |   4.2    |     |
|  +----------+  +----------+  +----------+     |
|                                               |
|  +------------------------------------------+ |
|  | Mood Trend Chart                         | |
|  +------------------------------------------+ |
|                                               |
|  +------------------------------------------+ |
|  | Weekly AI Summary                        | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

**Features:**
- AI-generated personalized insights (top card)
- Key metrics at a glance
- Mood trend visualization
- Writing pattern analysis
- Weekly reflection summaries

### Profile Module - Full Customization
**Complete profile management**

```text
+-----------------------------------------------+
|  Profile                                      |
+-----------------------------------------------+
|  +------------------------------------------+ |
|  | [Avatar Upload]                          | |
|  | Display Name: [Editable]                 | |
|  | Email: user@email.com                    | |
|  | Bio: [Editable textarea]                 | |
|  | Member since: January 2026               | |
|  +------------------------------------------+ |
|                                               |
|  Customization                                |
|  +------------------------------------------+ |
|  | Theme: [Light/Dark/System]               | |
|  | Font Size: [Small/Medium/Large]          | |
|  | Accent Color: [Color picker]             | |
|  +------------------------------------------+ |
+-----------------------------------------------+
```

### New Modules

#### Privacy & Security Page
- Password change functionality
- Session management (view active sessions)
- Data export option
- Account deletion option
- Two-factor authentication toggle (future)
- Privacy preferences

#### App Settings Page
- Notification preferences
- Daily reminder time picker
- Default mood selection
- Writing prompts toggle
- Data sync settings
- About/Version info

---

## 6. Navigation Updates

### Bottom Navigation
Update labels and add new routes:
- Today (AI Chat)
- Write
- Orchard (Milestones)
- Insights
- Profile

### Today Module Sidebar
- Dedicated sidebar component for chat history
- Collapsible with smooth GSAP animation
- Shows past conversations by date
- Only visible in the Today/Chat module

---

## 7. Database Schema Updates

### New Tables/Columns Needed

**profiles table additions:**
- `bio` (text, nullable) - User biography
- `font_size_preference` (text, default 'medium')
- `accent_color` (text, nullable)
- `theme_preference` (text, default 'system')

**New table: chat_conversations**
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `title` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**New table: chat_messages**
- `id` (uuid, primary key)
- `conversation_id` (uuid, references chat_conversations)
- `role` (text - 'user' or 'assistant')
- `content` (text)
- `created_at` (timestamp)

---

## 8. File Structure

### New Files to Create
```text
src/
  components/
    chat/
      ChatSidebar.tsx
      ChatMessage.tsx
      ChatInput.tsx
      GreetingHeader.tsx
    milestones/
      OrchardView.tsx
      MilestoneCard.tsx
      ProgressIndicator.tsx
    profile/
      AvatarUpload.tsx
      ProfileForm.tsx
      ThemeSelector.tsx
    settings/
      SettingsSection.tsx
      NotificationSettings.tsx
  hooks/
    useGsap.ts
    useChatHistory.ts
    useTheme.ts
  pages/
    PrivacySecurityPage.tsx
    AppSettingsPage.tsx
    OrchardPage.tsx (renamed from Insights milestones section)
  lib/
    animations.ts (GSAP utilities)
```

### Files to Modify
- `src/index.css` - New color palette and typography
- `tailwind.config.ts` - Font families and theme tokens
- `src/App.tsx` - New routes, theme provider
- `src/pages/HomePage.tsx` - Complete rewrite as chat interface
- `src/pages/WritePage.tsx` - Add entry management
- `src/pages/InsightsPage.tsx` - Dashboard redesign
- `src/pages/ProfilePage.tsx` - Full customization
- `src/pages/AuthPage.tsx` - Rebrand to Aramis
- `src/components/layout/BottomNav.tsx` - Updated nav items

---

## 9. Implementation Phases

### Phase 1: Foundation
1. Install GSAP and create animation utilities
2. Update typography (add all fonts)
3. Implement new color palette with theme switching
4. Rebrand to "Aramis" across all touchpoints

### Phase 2: Core Components
1. Restyle UI components (buttons, cards, inputs)
2. Update navigation with new routes
3. Create base layout components

### Phase 3: Module Development
1. Today Module - AI Chat Interface with sidebar
2. Write Module - Past entry management
3. Orchard Module - Milestones experience
4. Insights Module - Dashboard redesign

### Phase 4: Settings & Profile
1. Full profile customization
2. Privacy & Security page
3. App Settings page

### Phase 5: Database & Backend
1. Add new database tables and columns
2. Create chat history hooks
3. Implement AI conversation endpoints

### Phase 6: Polish
1. GSAP page transitions
2. Micro-interactions
3. Performance optimization
4. Responsive refinements

---

## 10. Technical Notes

### GSAP Integration Pattern
```typescript
// Example hook structure
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export function useGsapFadeIn(delay = 0) {
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    gsap.fromTo(ref.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay, ease: "power2.out" }
    );
  }, [delay]);
  
  return ref;
}
```

### Theme Implementation
- Use CSS custom properties for all theme tokens
- Leverage next-themes for system preference detection
- Smooth transitions between themes (0.3s)

### AI Chat Architecture
- Store conversations in database
- Use Lovable AI (google/gemini-2.5-flash) for responses
- Stream responses for better UX
- Context-aware prompts based on journal history

