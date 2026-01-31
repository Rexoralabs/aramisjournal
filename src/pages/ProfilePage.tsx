import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserStreak } from "@/hooks/useStreaks";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: streakData } = useUserStreak();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const joinedDate = user?.created_at 
    ? format(new Date(user.created_at), "MMMM yyyy")
    : "Unknown";
  const totalEntries = streakData?.total_entries || 0;
  const currentStreak = streakData?.current_streak || 0;

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  useEffect(() => {
    const originalName = profile?.display_name || "";
    const originalBio = profile?.bio || "";
    setHasChanges(displayName !== originalName || bio !== originalBio);
  }, [displayName, bio, profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio,
      });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ] as const;

  const bioMaxLength = 280;

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8">
        {/* Header */}
        <h1 className="text-3xl font-serif text-foreground">Profile</h1>

        {/* User Info Card */}
        <div className="glass-card-glow p-5">
          <div className="flex flex-col items-center gap-4">
            {/* Avatar - Centered with upload */}
            <AvatarUpload currentAvatarUrl={profile?.avatar_url} size="lg" />

            {/* Editable Info */}
            <div className="w-full space-y-4 mt-2">
              <div>
                <label className="text-xs font-ui text-muted-foreground mb-1 block">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="font-serif text-lg text-center"
                />
              </div>

              <div>
                <label className="text-xs font-ui text-muted-foreground mb-1 block">
                  Email
                </label>
                <p className="text-sm text-muted-foreground text-center py-2">
                  {user?.email}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-ui text-muted-foreground">
                    Bio
                  </label>
                  <span className="text-xs font-ui text-muted-foreground">
                    {bio.length}/{bioMaxLength}
                  </span>
                </div>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, bioMaxLength))}
                  placeholder="Write a short bio..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Member since {joinedDate}
              </p>

              {hasChanges && (
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="w-full btn-luxury"
                >
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-serif text-foreground">{totalEntries}</p>
              <p className="text-xs font-ui text-muted-foreground">journal entries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-serif text-primary">{currentStreak}</p>
              <p className="text-xs font-ui text-muted-foreground">day streak</p>
            </div>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="glass-card p-5">
          <h3 className="font-serif text-lg text-foreground mb-4">Appearance</h3>
          <div className="flex gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex-1 py-2 px-4 rounded-lg font-ui text-sm transition-all ${
                  theme === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Links */}
        <div className="space-y-2">
          <Link
            to="/privacy"
            className="w-full glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
          >
            <span className="font-ui text-foreground">Privacy & Security</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>

          <Link
            to="/settings"
            className="w-full glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
          >
            <span className="font-ui text-foreground">App Settings</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Sign Out */}
        <button 
          onClick={handleSignOut}
          className="w-full glass-card p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-ui">Sign Out</span>
        </button>

        {/* App Info */}
        <div className="text-center pt-4">
          <p className="text-sm font-brand tracking-wider text-muted-foreground">
            Aramis
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            v1.0.0 • Where silence meets reflection
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
