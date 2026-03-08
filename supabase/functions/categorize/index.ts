import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_ENTRIES = 100;
const MAX_CONTENT_LENGTH = 5000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { entries } = await req.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return new Response(JSON.stringify({ error: "No entries provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (entries.length > MAX_ENTRIES) {
      return new Response(JSON.stringify({ error: "Too many entries" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and sanitize entries
    for (const entry of entries) {
      if (!entry.id || typeof entry.id !== "string") {
        return new Response(JSON.stringify({ error: "Invalid entry ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!entry.content || typeof entry.content !== "string") {
        return new Response(JSON.stringify({ error: "Invalid entry content" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build condensed entry list for AI (truncate content)
    const entryList = entries.map((e: { id: string; title?: string; content: string }) =>
      `ID: ${e.id}\nTitle: ${(e.title || "Untitled").slice(0, 200)}\nContent: ${e.content.slice(0, MAX_CONTENT_LENGTH)}`
    ).join("\n---\n");

    const systemPrompt = `You are a content categorizer. Given journal entries, assign each one to a topic category.

Categories should be meaningful, concise labels like: "Personal Growth", "Work & Career", "Relationships", "Health & Wellness", "Creativity", "Gratitude", "Goals & Plans", "Daily Life", "Emotions", "Travel", "Learning".

You may create new categories if needed, but keep the total number of unique categories under 8.

Return ONLY valid JSON in this exact format:
{"entries": [{"id": "uuid-here", "category": "Category Name"}, ...]}

No markdown, no code fences, just raw JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Categorize these journal entries:\n\n${entryList}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI categorization failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response, stripping any markdown fences
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse categorization" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Persist categories to DB using the authenticated client
    const updates = (parsed.entries || []).map((e: { id: string; category: string }) =>
      supabase.from("journal_entries").update({ ai_category: e.category }).eq("id", e.id)
    );
    await Promise.all(updates);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("categorize error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
