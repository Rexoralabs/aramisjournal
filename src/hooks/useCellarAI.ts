import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to use AI features.");
        return;
      }

      const resp = await fetch(CATEGORIZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          entries: entries.map(e => ({ id: e.id, title: e.title, content: e.content })),
        }),
      });

      if (resp.status === 401) {
        toast.error("Session expired. Please sign in again.");
        return;
      }

      if (!resp.ok) throw new Error("Categorization failed");

      const data = await resp.json();
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
