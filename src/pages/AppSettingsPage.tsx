import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { ArrowLeft, Bell, Clock, Smile, Sparkles, Info, Volume2, Vibrate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { useUserProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { haptic, setHapticsEnabled, isHapticsEnabled } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";

const fontSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const defaultMoodOptions = [
  { value: "amazing", emoji: "✨", label: "Amazing" },
  { value: "good", emoji: "😊", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
];

const AppSettingsPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const containerRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState(profile?.notification_enabled ?? true);
  const [fontSize, setFontSize] = useState(profile?.font_size_preference || "medium");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

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
    // Sync with actual state
    setHapticsEnabledState(isHapticsEnabled());
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const handleNotificationToggle = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    haptic('selection');
    try {
      await updateProfile.mutateAsync({ notification_enabled: newValue });
      toast.success(`Notifications ${newValue ? "enabled" : "disabled"}`);
    } catch (error) {
      setNotifications(!newValue);
    }
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    haptic('light');
    try {
      await updateProfile.mutateAsync({ font_size_preference: size });
    } catch (error) {
      // Revert on error
    }
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundManager.toggle(newValue);
    if (newValue) {
      soundManager.play('click');
    }
    haptic('selection');
    toast.success(`Sound effects ${newValue ? "enabled" : "disabled"}`);
  };

  const handleHapticsToggle = () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabledState(newValue);
    setHapticsEnabled(newValue);
    if (newValue) {
      haptic('success');
    }
    toast.success(`Haptic feedback ${newValue ? "enabled" : "disabled"}`);
  };

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-muted transition-colors touch-target"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">App Settings</h1>
        </div>

        {/* Sound Effects */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-ui text-foreground">Sound Effects</p>
                <p className="text-xs text-muted-foreground">Subtle audio feedback</p>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative h-6 w-11 rounded-full transition-colors touch-target ${
                soundEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Haptic Feedback */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Vibrate className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-ui text-foreground">Haptic Feedback</p>
                <p className="text-xs text-muted-foreground">Vibration on interactions</p>
              </div>
            </div>
            <button
              onClick={handleHapticsToggle}
              className={`relative h-6 w-11 rounded-full transition-colors touch-target ${
                hapticsEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  hapticsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-ui text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Daily reminders to journal</p>
              </div>
            </div>
            <button
              onClick={handleNotificationToggle}
              className={`relative h-6 w-11 rounded-full transition-colors touch-target ${
                notifications ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reminder Time */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-ui text-foreground">Daily Reminder</p>
              <p className="text-xs text-muted-foreground">Set your preferred time</p>
            </div>
          </div>
          <button className="w-full py-2 px-4 rounded-lg bg-muted text-muted-foreground font-ui text-sm touch-target">
            9:00 PM (Coming soon)
          </button>
        </div>

        {/* Font Size */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted">
              <span className="text-lg">Aa</span>
            </div>
            <div>
              <p className="font-ui text-foreground">Font Size</p>
              <p className="text-xs text-muted-foreground">Adjust text size</p>
            </div>
          </div>
          <div className="flex gap-2">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFontSizeChange(option.value)}
                className={`flex-1 py-2 px-4 rounded-lg font-ui text-sm transition-all touch-target ${
                  fontSize === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Default Mood */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted">
              <Smile className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-ui text-foreground">Default Mood</p>
              <p className="text-xs text-muted-foreground">Pre-select when writing</p>
            </div>
          </div>
          <div className="flex gap-2">
            {defaultMoodOptions.map((option) => (
              <button
                key={option.value}
                className="flex-1 py-2 px-3 rounded-lg bg-muted text-muted-foreground font-ui text-sm flex items-center justify-center gap-1 touch-target"
              >
                <span>{option.emoji}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Prompts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-ui text-foreground">AI Prompts</p>
                <p className="text-xs text-muted-foreground">Show daily writing suggestions</p>
              </div>
            </div>
            <button className="relative h-6 w-11 rounded-full bg-primary touch-target">
              <div className="absolute top-1 translate-x-6 h-4 w-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Info className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-ui text-foreground">About Aramis</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AppSettingsPage;
