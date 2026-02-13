import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievements, useUnlockAchievement } from "./useAchievements";
import { useUserStreak } from "./useStreaks";
import { useJournalEntries } from "./useJournal";
import { useTodos } from "./useTodos";
import { toast } from "sonner";

export function useAwardPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error("Not authenticated");
      const { data: streak } = await supabase
        .from("user_streaks")
        .select("total_points")
        .eq("user_id", user.id)
        .single();
      const current = (streak as any)?.total_points || 0;
      await supabase
        .from("user_streaks")
        .update({ total_points: current + amount })
        .eq("user_id", user.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-streaks"] }),
  });
}

export function useCheckAchievements() {
  const { data: achievements = [] } = useAchievements();
  const { data: streakData } = useUserStreak();
  const { data: entries = [] } = useJournalEntries();
  const { data: todos = [] } = useTodos();
  const unlock = useUnlockAchievement();

  const has = (key: string) => achievements.some((a) => a.achievement_key === key);

  const check = () => {
    if (!has("first_words") && entries.length >= 1) {
      unlock.mutate("first_words");
      toast.success("🏆 Achievement: First Words!");
    }
    if (!has("week_warrior") && (streakData?.current_streak || 0) >= 7) {
      unlock.mutate("week_warrior");
      toast.success("🏆 Achievement: Week Warrior!");
    }
    if (!has("centurion") && entries.length >= 100) {
      unlock.mutate("centurion");
      toast.success("🏆 Achievement: Centurion!");
    }
    if (!has("task_master") && todos.filter((t) => t.completed).length >= 10) {
      unlock.mutate("task_master");
      toast.success("🏆 Achievement: Task Master!");
    }
  };

  return { check };
}
