import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DailyPromptProps {
  prompt: string;
  onUsePrompt?: () => void;
}

export function DailyPrompt({ prompt, onUsePrompt }: DailyPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card-glow p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">
            Today's Prompt
          </p>
          <p className="font-serif text-lg leading-relaxed text-foreground">
            {prompt}
          </p>
          {onUsePrompt && (
            <button
              onClick={onUsePrompt}
              className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Use this prompt →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
