import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useJournalEntries } from "@/hooks/useJournal";

const quickActions = [
  { label: "New Note", icon: "ph:plus", path: "/compose" },
  { label: "Open AI Chat", icon: "ph:chat-teardrop-dots-duotone", path: "/" },
  { label: "Focus Mode", icon: "ph:timer-duotone", path: "/focus" },
  { label: "The Cellar", icon: "ph:vault-duotone", path: "/cellar" },
  { label: "Calendar", icon: "ph:calendar-duotone", path: "/calendar" },
  { label: "Settings", icon: "ph:gear-duotone", path: "/settings" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { data: entries = [] } = useJournalEntries();

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search notes or jump to..." className="font-sans" />
      <CommandList>
        <CommandEmpty className="text-muted-foreground font-ui text-sm py-6 text-center">
          No results found.
        </CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.path}
              onSelect={() => handleSelect(action.path)}
              className="font-sans"
            >
              <Icon icon={action.icon} className="mr-2 h-4 w-4 text-muted-foreground" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {entries.length > 0 && (
          <CommandGroup heading="Recent Entries">
            {entries.slice(0, 8).map((entry) => (
              <CommandItem
                key={entry.id}
                onSelect={() => handleSelect(`/compose?entry=${entry.id}`)}
                className="font-sans"
              >
                <Icon icon="ph:note-duotone" className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="truncate">{entry.title || "Untitled"}</span>
                <span className="ml-auto text-xs text-muted-foreground font-ui">{entry.entry_date}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}