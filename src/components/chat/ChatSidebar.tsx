import { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { setNavHidden } from "@/hooks/useUiChrome";
import { motion } from "@/hooks/useStyleMode";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { ChatConversation, useDeleteConversation } from "@/hooks/useChatHistory";
import { haptic } from "@/lib/haptics";
import { soundManager } from "@/lib/sounds";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type ConversationGroup = {
  label: string;
  conversations: ChatConversation[];
};

function groupConversations(conversations: ChatConversation[]): ConversationGroup[] {
  const today: ChatConversation[] = [];
  const yesterday: ChatConversation[] = [];
  const thisWeek: ChatConversation[] = [];
  const earlier: ChatConversation[] = [];

  conversations.forEach((conv) => {
    const date = parseISO(conv.updated_at);
    if (isToday(date)) today.push(conv);
    else if (isYesterday(date)) yesterday.push(conv);
    else if (isThisWeek(date)) thisWeek.push(conv);
    else earlier.push(conv);
  });

  const groups: ConversationGroup[] = [];
  if (today.length) groups.push({ label: "Today", conversations: today });
  if (yesterday.length) groups.push({ label: "Yesterday", conversations: yesterday });
  if (thisWeek.length) groups.push({ label: "This Week", conversations: thisWeek });
  if (earlier.length) groups.push({ label: "Earlier", conversations: earlier });
  return groups;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [convosOpen, setConvosOpen] = useState(true);
  const deleteConversation = useDeleteConversation();
  const panelRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => conv.title?.toLowerCase().includes(query));
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => groupConversations(filteredConversations), [filteredConversations]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    haptic('error');
    await deleteConversation.mutateAsync(id);
    if (currentConversationId === id) onNewConversation();
  };

  const handleNewChat = () => {
    haptic('light');
    soundManager.play('click');
    onNewConversation();
    onClose();
  };

  useLayoutEffect(() => {
    setNavHidden(isOpen);
    const panel = panelRef.current, overlay = overlayRef.current;
    if (!panel || !overlay) return;
    const m = motion();
    if (isOpen) {
      gsap.set([panel, overlay], { display: "block" });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      gsap.fromTo(panel, { opacity: 0, x: -24, filter: "blur(12px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: m.dur, ease: m.ease });
      gsap.fromTo(panel.querySelectorAll("[data-stagger]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, delay: 0.1, ease: "power2.out" });
    } else {
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => gsap.set(overlay, { display: "none" }) });
      gsap.to(panel, { opacity: 0, x: -24, filter: "blur(12px)", duration: 0.35, ease: "power2.in", onComplete: () => gsap.set(panel, { display: "none" }) });
    }
  }, [isOpen]);

  useEffect(() => () => setNavHidden(false), []);

  return (
    <>
      <div ref={overlayRef} style={{ display: "none" }} className="fixed inset-0 bg-background/40 backdrop-blur-md z-40" onClick={onClose} />

      <aside ref={panelRef} style={{ display: "none" }} className="fixed left-3 top-3 bottom-3 w-80 rounded-3xl glass-liquid grain-gradient overflow-hidden z-50">
        <div className="flex flex-col h-full p-4">
          <div data-stagger className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors touch-target">
              <Icon icon="ph:caret-left" className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors touch-target">
              <Icon icon="ph:magnifying-glass" className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div data-stagger className="relative mb-4">
            <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border/50 text-sm font-sans placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <button data-stagger onClick={handleNewChat} className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors mb-4 touch-target">
            <Icon icon="ph:file-plus-duotone" className="h-5 w-5 text-primary" />
            <span className="font-ui text-sm text-foreground">New Chat</span>
          </button>

          <Collapsible open={convosOpen} onOpenChange={setConvosOpen}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors mb-2">
              <span className="text-xs font-ui text-muted-foreground uppercase tracking-wider">Convos</span>
              <Icon icon="ph:caret-down" className={cn("h-4 w-4 text-muted-foreground transition-transform", convosOpen && "rotate-180")} />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                {groupedConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon icon="ph:chat-circle-duotone" className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">{searchQuery ? "No matches found" : "No conversations yet"}</p>
                  </div>
                ) : (
                  groupedConversations.map((group) => (
                    <div key={group.label}>
                      <p className="text-xs font-ui text-muted-foreground mb-2 px-1">{group.label}</p>
                      <div className="space-y-1">
                        {group.conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => { haptic('selection'); onSelectConversation(conv.id); onClose(); }}
                            className={cn("w-full text-left p-3 rounded-lg transition-colors group touch-target",
                              currentConversationId === conv.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground truncate font-sans">{conv.title || "New conversation"}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 font-ui">{format(new Date(conv.updated_at), "h:mm a")}</p>
                              </div>
                              <button
                                onClick={(e) => handleDelete(e, conv.id)}
                                className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all touch-target"
                              >
                                <Icon icon="ph:trash" className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>
    </>
  );
}
