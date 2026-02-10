import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { haptic } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";

interface AddThoughtDialogProps {
  onAdd: (content: string) => void;
}

export function AddThoughtDialog({ onAdd }: AddThoughtDialogProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    haptic("success");
    soundManager.play("success");
    onAdd(content.trim());
    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={() => haptic("light")}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform touch-target"
        >
          <Plus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">New Thought</DialogTitle>
        </DialogHeader>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind..."
          className="w-full min-h-[120px] bg-transparent border border-border rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="btn-luxury w-full disabled:opacity-50"
        >
          Store Thought
        </button>
      </DialogContent>
    </Dialog>
  );
}
