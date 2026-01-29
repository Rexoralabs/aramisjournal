import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { MoodSelector, Mood } from "./MoodSelector";

interface QuickEntryProps {
  initialPrompt?: string;
}

export function QuickEntry({ initialPrompt }: QuickEntryProps) {
  const [mood, setMood] = useState<Mood>();
  const [thought, setThought] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/write", { 
      state: { 
        mood, 
        initialContent: thought,
        prompt: initialPrompt 
      } 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-5 space-y-5"
    >
      <MoodSelector selected={mood} onSelect={setMood} />
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Quick thought</p>
        <div className="relative">
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="What's on your mind..."
            className="w-full resize-none rounded-xl bg-input/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            rows={3}
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContinue}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90"
      >
        <span>Continue writing</span>
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
