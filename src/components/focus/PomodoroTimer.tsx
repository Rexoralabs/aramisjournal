import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { haptic } from "@/lib/haptics";
import { showNotification } from "@/lib/notifications";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

type TimerState = "idle" | "running" | "paused" | "break";

export function PomodoroTimer({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const [state, setState] = useState<TimerState>("idle");
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const totalDuration = state === "break" ? BREAK_DURATION : WORK_DURATION;
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

  useEffect(() => {
    if (state === "running" || state === "break") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopInterval();
            if (state === "running") {
              haptic("success");
              showNotification("Aramis", "Pomodoro complete! Take a break.");
              setSessions((s) => s + 1);
              onSessionComplete?.();
              setState("break");
              return BREAK_DURATION;
            } else {
              haptic("medium");
              showNotification("Aramis", "Break's over! Ready for another round?");
              setState("idle");
              return WORK_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return stopInterval;
  }, [state, stopInterval, onSessionComplete]);

  useEffect(() => {
    if (circleRef.current) {
      gsap.to(circleRef.current, { strokeDashoffset: offset, duration: 0.5, ease: "power2.out" });
    }
  }, [offset]);

  const handleStart = () => {
    haptic("medium");
    if (state === "idle" || state === "paused") {
      setState(state === "idle" ? "running" : "running");
    } else if (state === "running" || state === "break") {
      setState("paused");
    }
  };

  const handleReset = () => {
    haptic("light");
    stopInterval();
    setState("idle");
    setTimeLeft(WORK_DURATION);
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
          <span className="text-5xl font-serif text-foreground tabular-nums">
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
      </div>

      <div className="flex items-center gap-2">
        <Icon icon="ph:fire-duotone" className="h-4 w-4 text-primary" />
        <span className="text-sm font-ui text-muted-foreground">
          {sessions} session{sessions !== 1 ? "s" : ""} completed
        </span>
      </div>
    </div>
  );
}
