import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_entry_date: string | null;
  total_entries: number;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_days: number;
  achieved_at: string;
}

const MILESTONE_DAYS = [7, 30, 60, 100, 365];

export function useUserStreak() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-streaks", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserStreak | null;
    },
    enabled: !!user,
  });
}

export function useUserMilestones() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-milestones", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_milestones")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserMilestone[];
    },
    enabled: !!user,
  });
}

export function useUpdateStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];
      
      // Get current streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!streakData) {
        // Create initial streak record
        const { error } = await supabase
          .from("user_streaks")
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_entry_date: today,
            total_entries: 1,
          });
        if (error) throw error;
        return { newStreak: 1, isNewMilestone: false };
      }

      const lastDate = streakData.last_entry_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = streakData.current_streak;
      
      if (lastDate === today) {
        // Already journaled today, no change
        return { newStreak, isNewMilestone: false };
      } else if (lastDate === yesterdayStr) {
        // Continuing streak
        newStreak += 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streakData.longest_streak);
      const totalEntries = streakData.total_entries + 1;

      const { error } = await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_entry_date: today,
          total_entries: totalEntries,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Check for new milestones
      let isNewMilestone = false;
      for (const milestone of MILESTONE_DAYS) {
        if (newStreak === milestone) {
          const { error: milestoneError } = await supabase
            .from("user_milestones")
            .insert({
              user_id: user.id,
              milestone_days: milestone,
            })
            .select()
            .maybeSingle();

          if (!milestoneError) {
            isNewMilestone = true;
          }
        }
      }

      return { newStreak, isNewMilestone };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-streaks"] });
      queryClient.invalidateQueries({ queryKey: ["user-milestones"] });
    },
  });
}
