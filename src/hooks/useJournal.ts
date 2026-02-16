import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type Mood = "amazing" | "good" | "okay" | "down" | "rough";

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood: Mood | null;
  prompt_used: string | null;
  word_count: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
  ai_summary: string | null;
  ai_category: string | null;
  pinned: boolean;
}

export interface CreateEntryInput {
  title?: string;
  content: string;
  mood?: Mood;
  prompt_used?: string;
}

export function useJournalEntries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["journal-entries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!user,
  });
}

export function useJournalEntry(entryId: string | null) {
  return useQuery({
    queryKey: ["journal-entry", entryId],
    queryFn: async () => {
      if (!entryId) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .maybeSingle();

      if (error) throw error;
      return data as JournalEntry | null;
    },
    enabled: !!entryId,
  });
}

export function useTodayEntry() {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["today-entry", user?.id, today],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();

      if (error) throw error;
      return data as JournalEntry | null;
    },
    enabled: !!user,
  });
}

export function useCreateEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEntryInput) => {
      if (!user) throw new Error("Not authenticated");

      const wordCount = input.content.split(/\s+/).filter(Boolean).length;
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          title: input.title || null,
          content: input.content,
          mood: input.mood || null,
          prompt_used: input.prompt_used || null,
          word_count: wordCount,
          entry_date: today,
        })
        .select()
        .single();

      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["today-entry"] });
      queryClient.invalidateQueries({ queryKey: ["user-streaks"] });
    },
    onError: (error) => {
      toast.error("Failed to save entry: " + error.message);
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateEntryInput> & { id: string; ai_summary?: string }) => {
      const wordCount = input.content 
        ? input.content.split(/\s+/).filter(Boolean).length 
        : undefined;

      const { data, error } = await supabase
        .from("journal_entries")
        .update({
          ...input,
          ...(wordCount !== undefined && { word_count: wordCount }),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["today-entry"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entry"] });
    },
    onError: (error) => {
      toast.error("Failed to update entry: " + error.message);
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["today-entry"] });
      toast.success("Entry deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete entry: " + error.message);
    },
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ pinned })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
    onError: (error) => {
      toast.error("Failed to update pin: " + error.message);
    },
  });
}
