import { MessageSquare } from "lucide-react";

// Formats a timestamp into a short relative-ish label without pulling in date-fns.
function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * currentRole: "buyer" | "seller" — decides which side of `unreadCount` to read,
 * and which populated field (buyer/seller) to display as "the other person."
 */
export default function ConversationList({
  conversations = [],
  currentRole,
  activeId,
  onSelect,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-surface-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
        <MessageSquare size={24} className="text-ink-muted mb-3" strokeWidth={1.5} />
        <p className="font-display text-ink text-sm">No conversations yet</p>
        <p className="text-ink-muted text-xs mt-1">
          Messages with {currentRole === "seller" ? "buyers" : "sellers"} will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const otherParty =
          currentRole === "seller" ? conversation.buyer : conversation.seller;
        const unread =
          currentRole === "seller"
            ? conversation.unreadCount?.seller
            : conversation.unreadCount?.buyer;
        const isActive = conversation._id === activeId;

        return (
          <button
            key={conversation._id}
            onClick={() => onSelect(conversation)}
            className={`flex items-center gap-3 px-4 py-3 border-b border-border text-left transition-colors
              ${isActive ? "bg-accent-soft" : "hover:bg-surface-muted"}`}
          >
            <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center shrink-0 text-ink text-sm font-medium">
              {otherParty?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-ink text-[13px] font-medium truncate">
                  {otherParty?.name || "Unknown"}
                </p>
                {conversation.lastMessage?.sentAt && (
                  <span className="text-ink-muted text-[10px] shrink-0">
                    {formatTime(conversation.lastMessage.sentAt)}
                  </span>
                )}
              </div>
              <p className="text-ink-muted text-xs truncate mt-0.5">
                {conversation.lastMessage?.text || "Start the conversation"}
              </p>
            </div>

            {unread > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-medium flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}