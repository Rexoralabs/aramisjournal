
# Aramis Enhancement Plan
## Avatar Upload, Real AI Chat, Home Layout Redesign, Bottom Nav Update & Full Profile Editing

---

## Overview

This plan implements six key features:
1. **Avatar upload** with Supabase storage bucket and RLS policies
2. **Real AI integration** using Lovable AI gateway for conversational journaling
3. **H1 font update** to Instrument Serif (already correct, will verify)
4. **Home layout redesign** matching the reference wireframe (centered greeting, pill input)
5. **Bottom navigation redesign** - floating pill with circular icon buttons
6. **Full profile editing** with all customization options

---

## 1. Database & Storage Changes

### Create Avatars Storage Bucket
Create a migration to set up the `avatars` storage bucket with proper RLS policies:

```sql
-- Create public avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read access for avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

---

## 2. Real AI Integration (Lovable AI Gateway)

### Edge Function: `chat`
Create `supabase/functions/chat/index.ts` with:
- Connection to Lovable AI Gateway (google/gemini-3-flash-preview)
- SSE streaming for real-time token-by-token responses
- Journaling-focused system prompt
- Error handling for rate limits (429) and payment (402)

**System Prompt:**
```
You are Aramis, a thoughtful and empathetic AI journaling companion. 
Your role is to:
- Help users reflect on their thoughts and feelings
- Ask gentle, open-ended questions to encourage deeper reflection
- Offer supportive observations without being prescriptive
- Celebrate their consistency and emotional growth
- Keep responses concise but meaningful (2-3 sentences typically)

Tone: Warm, sophisticated, and quietly supportive - like a wise friend.
```

**Edge Function Structure:**
```typescript
// CORS headers for browser requests
// Validate Authorization header (JWT from Supabase Auth)
// Build messages array with system prompt + conversation history
// Call Lovable AI Gateway with streaming enabled
// Pipe SSE response back to client
```

### Frontend Chat Integration
Update `HomePage.tsx` to:
- Call the chat edge function via fetch with SSE
- Stream tokens progressively to create typing effect
- Handle loading/error states
- Show toast for rate limit errors

---

## 3. Home Layout Redesign (Per Reference Wireframe)

### Layout Structure
```text
+---------------------------------------------------+
|  [Sidebar]       Day 1             [Theme Toggle] |  <- Top bar
+---------------------------------------------------+
|                                                   |
|                                                   |
|           Hey, Charis.                            |  <- Large centered greeting
|           How Was Your Day?                       |  <- Subtitle
|                                                   |
|    +----------------------------------------+     |  <- Pill-shaped input
|    |                                        |     |
|    +----------------------------------------+     |
|                                                   |
+---------------------------------------------------+
|     ( Home ) ( Write ) ( Tree ) ( Grid ) ( User ) |  <- Floating nav pill
|                                         01.30.26  |  <- Date in corner
+---------------------------------------------------+
```

### Key Changes to HomePage.tsx
1. **Top Header:**
   - Sidebar toggle (hamburger) on left
   - "Day X" streak counter in center (shows current day of streak)
   - Theme toggle (Moon/Sun icon) on right
   
2. **Greeting Section (Center):**
   - Large H1: "Hey, {Name}." (Instrument Serif)
   - Subtitle: "How Was Your Day?" (lighter weight)
   - Vertically centered when no messages
   
3. **Input:**
   - Pill-shaped (rounded-full) with larger padding
   - Centered below greeting
   - Moves to bottom when messages exist

### GreetingHeader.tsx Updates
- Use "Hey, {Name}." format (shorter, warmer)
- Add subtitle prompt: "How Was Your Day?"
- Style with font-serif for H1

### ChatInput.tsx Updates
- Change to pill shape: `rounded-full`
- Larger padding: `px-6 py-4`
- Remove glass card styling in favor of softer card

---

## 4. Bottom Navigation Redesign

### New Design
Floating centered pill with 5 circular icon buttons:
- No text labels (icons only)
- Date display in bottom-right corner

### Changes to BottomNav.tsx
```tsx
<nav className="fixed bottom-4 left-0 right-0 z-50 px-4">
  <div className="flex items-end justify-center">
    {/* Floating nav pill */}
    <div className="flex items-center gap-2 px-4 py-3 rounded-full 
                    bg-card/90 backdrop-blur-lg border border-border/30 shadow-lg">
      {navItems.map(item => (
        <Link className="w-11 h-11 rounded-full flex items-center justify-center
                         hover:bg-muted/50 transition-colors">
          <Icon className={isActive ? "text-primary" : "text-muted-foreground"} />
        </Link>
      ))}
    </div>
    
    {/* Date in corner */}
    <span className="absolute right-6 bottom-1 text-xs font-ui text-muted-foreground">
      {format(new Date(), "MM.dd.yy")}
    </span>
  </div>
</nav>
```

### Icon Updates
- Home: `Home` icon
- Write: `PenLine` icon
- Orchard: `TreeDeciduous` icon
- Insights: `LayoutGrid` icon
- Profile: `User` icon

---

## 5. Avatar Upload Component

### New File: `src/components/profile/AvatarUpload.tsx`
- Clickable avatar with camera overlay
- File input (accept="image/*")
- Upload to Supabase Storage: `avatars/{userId}/{timestamp}.{ext}`
- Get public URL and update profile
- Loading state during upload
- GSAP animation for preview

### Hook: `src/hooks/useAvatarUpload.ts`
```typescript
export function useAvatarUpload() {
  const uploadAvatar = async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload to storage
    await supabase.storage.from('avatars').upload(filePath, file);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };
  
  return { uploadAvatar };
}
```

---

## 6. Full Profile Editing

### ProfilePage.tsx Enhancements
All profile fields become fully editable:

| Field | Control | Notes |
|-------|---------|-------|
| Avatar | AvatarUpload component | Click to upload |
| Display Name | Text input | Inline edit |
| Bio | Textarea | Character count indicator |
| Theme | Button group | Light/Dark/System |
| Font Size | Button group | Sm/Md/Lg |
| Accent Color | Color swatches | Preset gold options |
| Notifications | Toggle switch | Enable/disable |

### Profile Form Layout
```text
+-----------------------------------------------+
|  Profile                                      |
+-----------------------------------------------+
|  +------------------------------------------+ |
|  | [Avatar - Click to upload]               | |
|  |                                          | |
|  | Display Name: [Editable Input]           | |
|  | Email: user@email.com (read-only)        | |
|  | Bio: [Multiline Textarea]     [120/280]  | |
|  |                                          | |
|  | Member since: January 2026               | |
|  +------------------------------------------+ |
|                                               |
|  Stats                                        |
|  +------------------------------------------+ |
|  | [42 entries]    [12 day streak]          | |
|  +------------------------------------------+ |
|                                               |
|  Appearance                                   |
|  +------------------------------------------+ |
|  | Theme: [Light] [Dark] [System]           | |
|  +------------------------------------------+ |
|                                               |
|  [Privacy & Security] ->                      |
|  [App Settings] ->                            |
|                                               |
|  [Sign Out]                                   |
+-----------------------------------------------+
```

---

## 7. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `supabase/functions/chat/index.ts` | AI chat edge function with SSE streaming |
| `src/components/profile/AvatarUpload.tsx` | Avatar upload with preview |
| `src/hooks/useAvatarUpload.ts` | Storage upload logic |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/HomePage.tsx` | Complete layout redesign per wireframe, AI integration |
| `src/components/chat/GreetingHeader.tsx` | "Hey, {Name}." format with subtitle |
| `src/components/chat/ChatInput.tsx` | Pill-shaped styling |
| `src/components/layout/BottomNav.tsx` | Floating pill with circular icons, date display |
| `src/components/layout/PageContainer.tsx` | Adjust bottom padding for new nav |
| `src/pages/ProfilePage.tsx` | Full editing for all profile fields |
| `src/hooks/useProfile.ts` | Add avatar URL update |
| `supabase/config.toml` | Register chat edge function |

### Database Migration
- Create `avatars` storage bucket
- Add RLS policies for storage

---

## 8. Implementation Order

1. **Database Migration** - Create avatars bucket with RLS
2. **Edge Function** - Build chat function with Lovable AI Gateway
3. **Bottom Nav Redesign** - Update to floating pill design
4. **Home Layout** - Redesign per wireframe with AI integration
5. **Avatar Upload** - Component + hook + profile integration
6. **Profile Editing** - Full field editing with all preferences
7. **Polish** - GSAP animations and testing

---

## Technical Notes

### Lovable AI Gateway (No API Key Needed)
The project has `LOVABLE_API_KEY` already configured. The edge function will use:
- URL: `https://ai.gateway.lovable.dev/v1/chat/completions`
- Model: `google/gemini-3-flash-preview`
- Headers: `Authorization: Bearer ${LOVABLE_API_KEY}`

### SSE Streaming Pattern
```typescript
// Edge function returns ReadableStream
const response = await fetch(GATEWAY_URL, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({ model, messages, stream: true })
});

// Pipe stream to client
return new Response(response.body, {
  headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
});
```

### Avatar Upload Security
- Files stored in user-specific folders: `avatars/{user_id}/filename.ext`
- RLS policy validates folder name matches auth.uid()
- Public read access for displaying avatars

### Theme Toggle
Add theme toggle button to HomePage header using the existing `useTheme` hook:
```tsx
import { Moon, Sun } from "lucide-react";
const { theme, setTheme } = useTheme();

<button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <Sun /> : <Moon />}
</button>
```
