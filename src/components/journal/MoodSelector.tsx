import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Mood = "amazing" | "good" | "okay" | "down" | "rough";

interface MoodOption {
  value: Mood;
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { value: "amazing", emoji: "✨", label: "Amazing", color: "text-amber-400" },
  { value: "good", emoji: "😊", label: "Good", color: "text-green-400" },
  { value: "okay", emoji: "😐", label: "Okay", color: "text-blue-400" },
  { value: "down", emoji: "😔", label: "Down", color: "text-purple-400" },
  { value: "rough", emoji: "😢", label: "Rough", color: "text-rose-400" },
];

interface MoodSelectorProps {
  selected?: Mood;
  onSelect: (mood: Mood) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">How are you feeling?</p>
      <div className="flex justify-between gap-2">
        {moodOptions.map((mood) => (
          <motion.button
            key={mood.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
              selected === mood.value
                ? "bg-primary/20 ring-2 ring-primary"
                : "bg-muted/50 hover:bg-muted"
            )}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span
              className={cn(
                "text-xs font-medium",
                selected === mood.value ? mood.color : "text-muted-foreground"
              )}
            >
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
