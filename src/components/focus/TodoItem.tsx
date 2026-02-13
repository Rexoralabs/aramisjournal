import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import type { Todo } from "@/hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      todo.completed
        ? "bg-muted/30 border-border/30 opacity-60"
        : "bg-card border-border hover:border-primary/20"
    )}>
      <button
        onClick={() => { haptic("light"); onToggle(todo.id, !todo.completed); }}
        className="flex-shrink-0"
      >
        <Icon
          icon={todo.completed ? "ph:check-circle-duotone" : "ph:circle-duotone"}
          className={cn("h-5 w-5", todo.completed ? "text-primary" : "text-muted-foreground")}
        />
      </button>
      <span className={cn(
        "flex-1 text-sm font-sans",
        todo.completed ? "line-through text-muted-foreground" : "text-foreground"
      )}>
        {todo.title}
      </span>
      <button
        onClick={() => { haptic("light"); onDelete(todo.id); }}
        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all flex-shrink-0"
        style={{ opacity: 1 }}
      >
        <Icon icon="ph:x" className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
