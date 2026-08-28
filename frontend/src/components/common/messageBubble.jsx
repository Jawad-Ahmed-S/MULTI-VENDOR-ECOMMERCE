function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message, isMine }) {
  const { text, isDeleted, createdAt } = message;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} px-4 py-1`}>
      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        <div
          className={`px-3 py-2 rounded-lg text-[13px] leading-relaxed
            ${
              isDeleted
                ? "bg-surface-muted text-ink-muted italic"
                : isMine
                ? "bg-accent text-white rounded-br-sm"
                : "bg-surface-muted text-ink rounded-bl-sm"
            }`}
        >
          {isDeleted ? "This message was deleted" : text}
        </div>
        <span className="text-ink-muted text-[10px] mt-1 px-1">
          {formatTime(createdAt)}
        </span>
      </div>
    </div>
  );
}