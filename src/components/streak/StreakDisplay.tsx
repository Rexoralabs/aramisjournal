import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface StreakDisplayProps {
  count: number;
  isActive?: boolean;
}

export function StreakDisplay({ count, isActive = true }: StreakDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2"
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          isActive
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Flame className="h-6 w-6" />
      </motion.div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold font-serif text-foreground">
          {count}
        </span>
        <span className="text-xs text-muted-foreground">
          {count === 1 ? "day" : "days"} streak
        </span>
      </div>
    </motion.div>
  );
}
