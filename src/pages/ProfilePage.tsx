import { useState, useRef, useLayoutEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, ChevronRight, Camera } from "lucide-react";
import { format } from "date-fns";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
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

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");

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

  useLayoutEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        bio,
      });
      setIsEditing(false);
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

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8">
        {/* Header */}
        <h1 className="text-3xl font-serif text-foreground">Profile</h1>

        {/* User Info Card */}
        <div className="glass-card-glow p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border border-border hover:bg-muted transition-colors">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display name"
                    className="font-serif text-lg"
                  />
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short bio..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="btn-luxury !px-4 !py-2 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl text-foreground">
                      {profile?.display_name || "Writer"}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm font-ui text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  {profile?.bio && (
                    <p className="text-sm text-foreground/80 mt-2">{profile.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Member since {joinedDate}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          {!isEditing && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-serif text-foreground">{totalEntries}</p>
                <p className="text-xs font-ui text-muted-foreground">journal entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif text-primary">{currentStreak}</p>
                <p className="text-xs font-ui text-muted-foreground">day streak</p>
              </div>
            </div>
          )}
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
