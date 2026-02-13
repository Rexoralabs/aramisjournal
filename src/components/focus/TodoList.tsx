import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from "@/hooks/useTodos";
import { TodoItem } from "./TodoItem";
import { haptic } from "@/lib/haptics";

export function TodoList() {
  const [newTask, setNewTask] = useState("");
  const { data: todos = [] } = useTodos();
  const createTodo = useCreateTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const handleAdd = () => {
    if (!newTask.trim()) return;
    haptic("medium");
    createTodo.mutate(newTask.trim());
    setNewTask("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-foreground">Tasks</h2>
        <span className="text-xs font-ui text-muted-foreground">
          {todos.filter((t) => t.completed).length}/{todos.length}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task..."
          className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"
        >
          <Icon icon="ph:plus" className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 font-ui">No tasks yet. Add one above.</p>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={(id, completed) => toggleTodo.mutate({ id, completed })}
              onDelete={(id) => deleteTodo.mutate(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
