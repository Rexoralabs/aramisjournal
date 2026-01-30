import { format } from "date-fns";
import { MessageCircle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatConversation, useDeleteConversation } from "@/hooks/useChatHistory";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const deleteConversation = useDeleteConversation();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation.mutateAsync(id);
    if (currentConversationId === id) {
      onNewConversation();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg text-foreground">History</h2>
            <button
              onClick={onNewConversation}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors group",
                    currentConversationId === conv.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {conv.title || "New conversation"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(conv.updated_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
