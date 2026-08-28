import { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, MessageSquare, ChevronUp } from "lucide-react";
import MessageBubble from "./MessageBubble";

/**
 * conversation: the active conversation doc (populated with buyer/seller)
 * currentUserId: the logged-in user's id — used to decide bubble alignment
 * currentRole: "buyer" | "seller"
 * messages: flattened, oldest-first array (see MessagesPage for how the
 *   infinite-query pages get flattened before being passed in here)
 * onSend(text): called on submit — component doesn't know about REST/sockets at all
 * onBack: optional, shown on mobile to return to the conversation list
 */
export default function ChatWindow({
  conversation,
  currentUserId,
  currentRole,
  messages = [],
  onSend,
  isSending,
  hasMore,
  onLoadMore,
  isLoadingMessages,
  onBack,
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <MessageSquare size={28} className="text-ink-muted mb-3" strokeWidth={1.5} />
        <p className="font-display text-ink text-base">Select a conversation</p>
        <p className="text-ink-muted text-xs mt-1">
          Choose a chat from the list to see messages here.
        </p>
      </div>
    );
  }

  const otherParty =
    currentRole === "seller" ? conversation.buyer : conversation.seller;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        {onBack && (
          <button onClick={onBack} className="md:hidden text-ink shrink-0">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center text-ink text-sm font-medium">
          {otherParty?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <p className="font-display text-ink text-sm">{otherParty?.name || "Unknown"}</p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3">
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={onLoadMore}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink px-3 py-1.5 rounded-full border border-border"
            >
              <ChevronUp size={12} /> Load earlier messages
            </button>
          </div>
        )}

        {isLoadingMessages ? (
          <div className="flex flex-col gap-3 px-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-10 rounded-lg bg-surface-muted animate-pulse ${
                  i % 2 ? "ml-auto w-1/3" : "w-1/2"
                }`}
              />
            ))}
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isMine={message.sender === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 h-10 px-3 rounded-md border border-border bg-background text-ink text-[13px] placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="w-9 h-9 rounded-md bg-accent text-white flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}