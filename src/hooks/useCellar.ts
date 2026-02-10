import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CellarThought {
  id: string;
  user_id: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useCellarThoughts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cellar-thoughts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("cellar_thoughts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CellarThought[];
    },
    enabled: !!user,
  });
}

export function useCreateThought() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, color = "default" }: { content: string; color?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("cellar_thoughts")
        .insert({ user_id: user.id, content, color })
        .select()
        .single();
      if (error) throw error;
      return data as CellarThought;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cellar-thoughts"] });
      toast.success("Thought stored");
    },
    onError: (e) => toast.error("Failed to save: " + e.message),
  });
}

export function useDeleteThought() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cellar_thoughts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cellar-thoughts"] });
      toast.success("Thought removed");
    },
  });
}
