import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function useAvatarUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    setIsUploading(true);
    
    try {
      // Delete old avatar if exists
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(userId);
      
      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
      }

      // Upload new avatar
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading };
}
