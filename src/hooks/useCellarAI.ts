import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { JournalEntry } from "@/hooks/useJournal";

const CATEGORIZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorize`;

export function useCategorizeEntries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const categorize = async (entries: JournalEntry[]) => {
    if (!user || entries.length === 0) return;
    setIsLoading(true);

    try {
      const resp = await fetch(CATEGORIZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          entries: entries.map(e => ({ id: e.id, title: e.title, content: e.content })),
        }),
      });

      if (!resp.ok) throw new Error("Categorization failed");

      const data = await resp.json();
      // Invalidate to refetch entries with new categories
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      toast.success(`Categorized ${data.entries?.length || 0} entries`);
      return data;
    } catch (error) {
      console.error("Categorize error:", error);
      toast.error("Failed to categorize entries");
    } finally {
      setIsLoading(false);
    }
  };

  return { categorize, isLoading };
}
