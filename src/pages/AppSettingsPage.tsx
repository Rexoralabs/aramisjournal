import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useStyleMode } from "@/hooks/useStyleMode";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { PageContainer } from "@/components/layout/PageContainer";
import { useUserProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useJournalEntries, useDeleteEntry } from "@/hooks/useJournal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { haptic, setHapticsEnabled, isHapticsEnabled } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";
import { requestNotificationPermission, scheduleDailyReminder, stopDailyReminder } from "@/lib/notifications";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const fontSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const writingGoalOptions = [
  { value: 100, label: "100" },
  { value: 250, label: "250" },
  { value: 500, label: "500" },
];

const accentColors = [
  { value: "gold", label: "Gold", color: "hsl(43 74% 49%)" },
  { value: "rose", label: "Rose", color: "hsl(346 77% 49%)" },
  { value: "sage", label: "Sage", color: "hsl(143 40% 45%)" },
  { value: "ocean", label: "Ocean", color: "hsl(210 70% 50%)" },
];

const workPresets = [15, 25, 30, 45, 60];
const breakPresets = [5, 10, 15];

const TIMER_STORAGE_KEY = "aramis-timer-settings";

function getTimerSettings() {
  try {
    const s = localStorage.getItem(TIMER_STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { workMinutes: 25, breakMinutes: 5 };
}

const AppSettingsPage = () => {
  const navigate = useNavigate();
  const { mode: styleMode, setMode: setStyleMode } = useStyleMode();
  const { user, signOut } = useAuth();
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { data: entries = [] } = useJournalEntries();
  const deleteEntry = useDeleteEntry();
  const containerRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState(profile?.notification_enabled ?? true);
  const [fontSize, setFontSize] = useState(profile?.font_size_preference || "medium");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [writingGoal, setWritingGoal] = useState(250);
  const [selectedAccent, setSelectedAccent] = useState("gold");

  const timerSettings = getTimerSettings();
  const [workMinutes, setWorkMinutes] = useState(timerSettings.workMinutes);
  const [breakMinutes, setBreakMinutes] = useState(timerSettings.breakMinutes);

  useLayoutEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    setHapticsEnabledState(isHapticsEnabled());
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const handleNotificationToggle = async () => {
    const newValue = !notifications;
    haptic('selection');
    if (newValue) {
      const granted = await requestNotificationPermission();
      if (!granted) { toast.error("Permission denied"); return; }
      scheduleDailyReminder(21);
      toast.success("Daily reminders enabled");
    } else {
      stopDailyReminder();
      toast.success("Notifications disabled");
    }
    setNotifications(newValue);
    try { await updateProfile.mutateAsync({ notification_enabled: newValue }); } catch { setNotifications(!newValue); }
  };

  const handleFontSizeChange = async (size: string) => {
    setFontSize(size);
    haptic('light');
    try { await updateProfile.mutateAsync({ font_size_preference: size }); } catch {}
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundManager.toggle(newValue);
    if (newValue) soundManager.play('click');
    haptic('selection');
  };

  const handleHapticsToggle = () => {
    const newValue = !hapticsEnabled;
    setHapticsEnabledState(newValue);
    setHapticsEnabled(newValue);
    if (newValue) haptic('success');
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aramis-journal-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Journal exported successfully");
  };

  const handleClearAllData = async () => {
    for (const entry of entries) {
      await deleteEntry.mutateAsync(entry.id);
    }
    toast.success("All entries deleted");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const updateTimerWork = (mins: number) => {
    setWorkMinutes(mins);
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ workMinutes: mins, breakMinutes }));
    haptic("light");
  };

  const updateTimerBreak = (mins: number) => {
    setBreakMinutes(mins);
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ workMinutes, breakMinutes: mins }));
    haptic("light");
  };

  const estimatedSize = entries.reduce((acc, e) => acc + (e.content?.length || 0), 0);
  const sizeKB = Math.round(estimatedSize / 1024);

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors touch-target ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <PageContainer>
      <div ref={containerRef} className="space-y-6 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Icon icon="ph:arrow-left" className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Settings</h1>
        </div>

        {/* Writing Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Writing</h2>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted"><span className="text-lg">Aa</span></div>
                <div><p className="font-ui text-foreground">Font Size</p><p className="text-xs text-muted-foreground">Adjust text size</p></div>
              </div>
              <div className="flex gap-2">
                {fontSizeOptions.map((o) => (
                  <button key={o.value} onClick={() => handleFontSizeChange(o.value)}
                    className={`flex-1 py-2 px-4 rounded-lg font-ui text-sm transition-all ${fontSize === o.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:target-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div><p className="font-ui text-foreground">Daily Writing Goal</p><p className="text-xs text-muted-foreground">Words per day target</p></div>
              </div>
              <div className="flex gap-2">
                {writingGoalOptions.map((o) => (
                  <button key={o.value} onClick={() => { setWritingGoal(o.value); haptic("light"); }}
                    className={`flex-1 py-2 px-4 rounded-lg font-ui text-sm transition-all ${writingGoal === o.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Focus Timer Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Focus Timer</h2>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:timer-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div><p className="font-ui text-foreground">Work Duration</p><p className="text-xs text-muted-foreground">Minutes per focus session</p></div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {workPresets.map(m => (
                  <button key={m} onClick={() => updateTimerWork(m)}
                    className={`px-4 py-2 rounded-full font-ui text-sm transition-all ${workMinutes === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {m} min
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:coffee-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div><p className="font-ui text-foreground">Break Duration</p><p className="text-xs text-muted-foreground">Minutes per break</p></div>
              </div>
              <div className="flex gap-2">
                {breakPresets.map(m => (
                  <button key={m} onClick={() => updateTimerBreak(m)}
                    className={`px-4 py-2 rounded-full font-ui text-sm transition-all ${breakMinutes === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {m} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Experience</h2>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:speaker-high-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                  <div><p className="font-ui text-foreground">Sound Effects</p><p className="text-xs text-muted-foreground">Subtle audio feedback</p></div>
                </div>
                <Toggle enabled={soundEnabled} onToggle={handleSoundToggle} />
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:vibrate-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                  <div><p className="font-ui text-foreground">Haptic Feedback</p><p className="text-xs text-muted-foreground">Vibration on interactions</p></div>
                </div>
                <Toggle enabled={hapticsEnabled} onToggle={handleHapticsToggle} />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Notifications</h2>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:bell-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <p className="font-ui text-foreground">Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Daily reminders to journal
                      {typeof Notification !== "undefined" && (
                        <span className="ml-1.5">
                          ({Notification.permission === "granted" ? "✓ Allowed" : Notification.permission === "denied" ? "✗ Blocked" : "Not set"})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Toggle enabled={notifications} onToggle={handleNotificationToggle} />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Appearance</h2>
          <div className="glass-card p-5 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:text-aa-duotone" className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="font-ui text-foreground">Style</p><p className="text-xs text-muted-foreground">Modern adds richer motion and soft grainy gradients. Editorial mixes serif headlines with sans text.</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["modern", "editorial"] as const).map((m) => (
                <button key={m} onClick={() => { setStyleMode(m); haptic("light"); }}
                  className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] ${styleMode === m ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}>
                  <p className={m === "editorial" ? "text-xl text-foreground" : "text-lg font-semibold text-foreground"} style={m === "editorial" ? { fontFamily: "'Instrument Serif', serif" } : undefined}>
                    {m === "modern" ? "Modern" : "Editorial"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{m === "modern" ? "Minimal, fluid, premium" : "Serif and sans, calm"}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:palette-duotone" className="h-5 w-5 text-muted-foreground" /></div>
              <div><p className="font-ui text-foreground">Accent Color</p><p className="text-xs text-muted-foreground">Personalize your theme</p></div>
            </div>
            <div className="flex gap-3">
              {accentColors.map((c) => (
                <button key={c.value} onClick={() => { setSelectedAccent(c.value); haptic("light"); }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${selectedAccent === c.value ? "bg-muted" : ""}`}>
                  <div className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: c.color, borderColor: selectedAccent === c.value ? c.color : "transparent" }} />
                  <span className="text-[10px] font-ui text-muted-foreground">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Data</h2>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:database-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div><p className="font-ui text-foreground">Storage</p><p className="text-xs text-muted-foreground">{entries.length} entries · ~{sizeKB} KB</p></div>
              </div>
            </div>
            <div className="glass-card p-5">
              <button onClick={handleExportData} className="w-full flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:download-simple-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div className="text-left"><p className="font-ui text-foreground">Export Journal</p><p className="text-xs text-muted-foreground">Download as JSON</p></div>
              </button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="glass-card p-5 border-destructive/20 cursor-pointer hover:bg-destructive/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10"><Icon icon="ph:trash-duotone" className="h-5 w-5 text-destructive" /></div>
                    <div><p className="font-ui text-destructive">Clear All Data</p><p className="text-xs text-muted-foreground">Delete all journal entries</p></div>
                  </div>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all {entries.length} journal entries. This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground">Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Account</h2>
          <div className="space-y-3">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:envelope-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div><p className="font-ui text-foreground">Email</p><p className="text-xs text-muted-foreground">{user?.email || "Not signed in"}</p></div>
              </div>
            </div>
            <div className="glass-card p-5">
              <button onClick={() => navigate("/privacy")} className="w-full flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:shield-check-duotone" className="h-5 w-5 text-muted-foreground" /></div>
                <div className="text-left"><p className="font-ui text-foreground">Privacy & Security</p><p className="text-xs text-muted-foreground">Manage your privacy settings</p></div>
              </button>
            </div>
            <div className="glass-card p-5">
              <button onClick={handleSignOut} className="w-full flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10"><Icon icon="ph:sign-out-duotone" className="h-5 w-5 text-destructive" /></div>
                <div className="text-left"><p className="font-ui text-destructive">Sign Out</p><p className="text-xs text-muted-foreground">Log out of your account</p></div>
              </button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-1">
          <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">About</h2>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted"><Icon icon="ph:info-duotone" className="h-5 w-5 text-muted-foreground" /></div>
              <div className="flex-1"><p className="font-ui text-foreground">Aramis</p><p className="text-xs text-muted-foreground">Version 1.0.0</p></div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AppSettingsPage;
