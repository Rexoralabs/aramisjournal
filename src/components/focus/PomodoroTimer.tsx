import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { haptic } from "@/lib/haptics";
import { showNotification } from "@/lib/notifications";
import { soundManager } from "@/lib/sounds";

const STORAGE_KEY = "aramis-timer-settings";

function getStoredSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { workMinutes: 25, breakMinutes: 5 };
}

function saveSettings(workMinutes: number, breakMinutes: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ workMinutes, breakMinutes }));
}

type TimerState = "idle" | "running" | "paused" | "break";

const workPresets = [15, 25, 30, 45, 60];
const breakPresets = [5, 10, 15];

export function PomodoroTimer({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const stored = getStoredSettings();
  const [workMinutes, setWorkMinutes] = useState(stored.workMinutes);
  const [breakMinutes, setBreakMinutes] = useState(stored.breakMinutes);
  const [showSettings, setShowSettings] = useState(false);

  const [state, setState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const circleRef = useRef<SVGCircleElement>(null);
  const endTimeRef = useRef<number>(0);

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const totalDuration = state === "break" ? breakMinutes * 60 : workMinutes * 60;
  const progress = timeLeft / totalDuration;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const handleTimerComplete = useCallback((currentState: TimerState) => {
    stopInterval();
    soundManager.play("chime");
    if (currentState === "running") {
      haptic("success");
      showNotification("Aramis", "Pomodoro complete! Take a break.");
      setSessions((s) => s + 1);
      onSessionComplete?.();
      setState("break");
      const breakSecs = breakMinutes * 60;
      setTimeLeft(breakSecs);
      endTimeRef.current = Date.now() + breakSecs * 1000;
    } else {
      haptic("medium");
      showNotification("Aramis", "Break's over! Ready for another round?");
      setState("idle");
      setTimeLeft(workMinutes * 60);
      endTimeRef.current = 0;
    }
  }, [stopInterval, onSessionComplete, workMinutes, breakMinutes]);

  // End-time based countdown — survives tab backgrounding
  useEffect(() => {
    if (state === "running" || state === "break") {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      intervalRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          handleTimerComplete(state);
        }
      }, 250); // 250ms for smoother recovery from background

      // Recalculate on tab return
      const handleVisibility = () => {
        if (!document.hidden && endTimeRef.current) {
          const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) handleTimerComplete(state);
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);

      return () => {
        stopInterval();
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }
    return stopInterval;
  }, [state, handleTimerComplete, stopInterval]);

  useEffect(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, { strokeDashoffset: offset, duration: 0.5, ease: "power2.out" });
    }
  }, [offset]);

  const handleStart = () => {
    haptic("medium");
    if (state === "idle") {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setState("running");
    } else if (state === "paused") {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setState("running");
    } else if (state === "running" || state === "break") {
      stopInterval();
      endTimeRef.current = 0;
      setState("paused");
    }
  };

  const handleReset = () => {
    haptic("light");
    stopInterval();
    endTimeRef.current = 0;
    setState("idle");
    setTimeLeft(workMinutes * 60);
  };

  const updateWork = (mins: number) => {
    setWorkMinutes(mins);
    saveSettings(mins, breakMinutes);
    if (state === "idle") setTimeLeft(mins * 60);
    haptic("light");
  };

  const updateBreak = (mins: number) => {
    setBreakMinutes(mins);
    saveSettings(workMinutes, mins);
    haptic("light");
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg width="260" height="260" className="transform -rotate-90">
          <circle cx="130" cy="130" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle
            ref={circleRef}
            cx="130" cy="130" r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-sans font-semibold text-foreground tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-xs font-ui text-muted-foreground mt-2 uppercase tracking-wider">
            {state === "break" ? "Break" : state === "running" ? "Focus" : state === "paused" ? "Paused" : "Ready"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleStart} className="btn-luxury px-8 py-3 rounded-full">
          <Icon icon={state === "running" || state === "break" ? "ph:pause-fill" : "ph:play-fill"} className="h-5 w-5 mr-2 inline" />
          {state === "running" || state === "break" ? "Pause" : "Start"}
        </button>
        <button onClick={handleReset} className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors">
          <Icon icon="ph:arrow-counter-clockwise" className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          onClick={() => { setShowSettings(!showSettings); haptic("light"); }}
          className="p-3 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <Icon icon="ph:gear-duotone" className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {showSettings && (
        <div className="w-full max-w-xs space-y-4 glass-card p-4">
          <div>
            <p className="text-xs font-ui text-muted-foreground mb-2">Work Duration (min)</p>
            <div className="flex gap-2 flex-wrap">
              {workPresets.map(m => (
                <button
                  key={m}
                  onClick={() => updateWork(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-ui transition-all ${
                    workMinutes === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-ui text-muted-foreground mb-2">Break Duration (min)</p>
            <div className="flex gap-2">
              {breakPresets.map(m => (
                <button
                  key={m}
                  onClick={() => updateBreak(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-ui transition-all ${
                    breakMinutes === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Icon icon="ph:fire-duotone" className="h-4 w-4 text-primary" />
        <span className="text-sm font-ui text-muted-foreground">
          {sessions} session{sessions !== 1 ? "s" : ""} completed
        </span>
      </div>
    </div>
  );
}