import { useRef, useState, useLayoutEffect } from "react";
import { Camera, User, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({ currentAvatarUrl, size = "lg" }: AvatarUploadProps) {
  const { user } = useAuth();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  useLayoutEffect(() => {
    if (preview && avatarRef.current) {
      gsap.fromTo(
        avatarRef.current,
        { scale: 0.9, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [preview]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      await uploadAvatar(file, user.id);
      toast.success("Avatar updated!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload avatar");
      setPreview(null);
    }
  };

  const displayUrl = preview || currentAvatarUrl;

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative group"
      >
        <div
          ref={avatarRef}
          className={`${sizeClasses[size]} rounded-full bg-primary/20 flex items-center justify-center overflow-hidden ring-2 ring-border ring-offset-2 ring-offset-background transition-all group-hover:ring-primary/50`}
        >
          {isUploading ? (
            <Loader2 className={`${iconSizes[size]} text-primary animate-spin`} />
          ) : displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className={`${iconSizes[size]} text-primary`} />
          )}
        </div>
        
        {/* Camera overlay */}
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border border-border shadow-sm group-hover:bg-primary group-hover:border-primary transition-colors">
          <Camera className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
        </div>
      </button>
    </div>
  );
}
