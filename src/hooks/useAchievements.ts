import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Achievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export const ACHIEVEMENT_DEFS = [
  { key: "first_words", name: "First Words", description: "Write your first entry", icon: "ph:pencil-duotone" },
  { key: "week_warrior", name: "Week Warrior", description: "7-day streak", icon: "ph:fire-duotone" },
  { key: "centurion", name: "Centurion", description: "100 entries", icon: "ph:crown-duotone" },
  { key: "marathon_writer", name: "Marathon Writer", description: "1000+ words in one entry", icon: "ph:article-duotone" },
  { key: "night_owl", name: "Night Owl", description: "Write after 10 PM", icon: "ph:moon-duotone" },
  { key: "early_bird", name: "Early Bird", description: "Write before 7 AM", icon: "ph:sun-horizon-duotone" },
  { key: "focused_mind", name: "Focused Mind", description: "Complete 5 pomodoros in a day", icon: "ph:brain-duotone" },
  { key: "task_master", name: "Task Master", description: "Complete 10 tasks", icon: "ph:check-circle-duotone" },
] as const;

export function useAchievements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user,
  });
}

export function useUnlockAchievement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (achievementKey: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_achievements")
        .upsert({ user_id: user.id, achievement_key: achievementKey }, { onConflict: "user_id,achievement_key" })
        .select()
        .single();
      if (error) throw error;
      return data as Achievement;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["achievements"] }),
  });
}
