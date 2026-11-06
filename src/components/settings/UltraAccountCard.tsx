import { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { DownloadButton } from "@/components/landing/DownloadButton";
import { getAutoMode, setAutoMode } from "@/lib/ultra";

export function UltraAccountCard() {
  const { user } = useAuth();
  const [auto, setAuto] = useState(getAutoMode);

  return (
    <div className="space-y-1">
      <h2 className="text-xs font-ui text-muted-foreground uppercase tracking-wider px-1">Ultra Account</h2>
      <div className="glass-card p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Icon icon="ph:at-duotone" className="h-5 w-5 text-primary" /></div>
          <div className="min-w-0">
            <p className="font-ui text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Ultra Account by Rexora · one sign-in for every Rexora app</p>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 border-t border-border/50 pt-4">
          <div>
            <p className="font-ui text-foreground">{auto ? "Auto mode" : "Control mode"}</p>
            <p className="text-xs text-muted-foreground">
              {auto
                ? "You stay signed in on this device and Aramis opens straight into your sanctuary."
                : "Aramis asks before keeping you signed in on new devices and before downloads."}
            </p>
          </div>
          <Switch
            checked={auto}
            aria-label="Auto sign-in"
            onCheckedChange={(v) => { setAuto(v); setAutoMode(v); }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-4">
          <div>
            <p className="font-ui text-foreground">Aramis for Windows</p>
            <p className="text-xs text-muted-foreground">The desktop edition, included with your account.</p>
          </div>
          <DownloadButton className="w-auto px-6" />
        </div>
      </div>
    </div>
  );
}
