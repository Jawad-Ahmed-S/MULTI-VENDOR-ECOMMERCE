import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import ConversationList from "../components/common/ConversationList";
import ChatWindow from "../components/common/ChatWindow";
import {
  useGetBuyerConversations,
  useGetSellerConversations,
  useMarkConversationRead,
} from "../api/conversation";
import { useGetMessages, useCreateMessage } from "../api/message.js";
import { socket } from "../api/socket.js";

// Shared inbox page for both sides — the parent route decides which one this is:
//   <Route path="/messages" element={<MessagesPage role="buyer" />} />
//   <Route path="/seller/messages" element={<MessagesPage role="seller" />} />
export default function MessagesPage() {
  const location = useLocation();
  const queryClient = useQueryClient();

  // Single source of truth for identity — no more separate buyer/seller slices,
  // no more separate `role` prop. Whatever currentUser.role says, that's the view.
  const currentUser = useSelector((state) => state.user.currentUser?.data);
  const role = currentUser?.role === "seller" ? "seller" : "buyer";

  const incomingConversation = location.state?.conversation ?? null;
  const incomingConversationId = incomingConversation?._id;

  const [lastHandledId, setLastHandledId] = useState(incomingConversationId);
  const [activeConversation, setActiveConversation] = useState(incomingConversation);
  const [mobileShowChat, setMobileShowChat] = useState(!!incomingConversation);

  if (incomingConversationId && incomingConversationId !== lastHandledId) {
    setLastHandledId(incomingConversationId);
    setActiveConversation(incomingConversation);
    setMobileShowChat(true);
  }

  const buyerQuery = useGetBuyerConversations(role === "buyer" ? currentUser?._id : undefined);
  const sellerQuery = useGetSellerConversations(role === "seller" ? currentUser?._id : undefined);
  const { data: conversationsData, isLoading: isLoadingConversations } =
    role === "seller" ? sellerQuery : buyerQuery;

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
  } = useGetMessages(activeConversation?._id);

  const createMessage = useCreateMessage();
  const markRead = useMarkConversationRead();

  const messages = messagesData?.pages?.flatMap((page) => page.messages) ?? [];

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.emit("addUser", currentUser._id);

    function handleGetMessage({ conversationId, message }) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        if (conversationId === activeConversation?._id) {
          queryClient.setQueryData(["messages", conversationId], (old) => {
            if (!old) return old;
            const pages = [...old.pages];
            const last = pages.length - 1;
            const alreadyThere = pages[last].messages.some((m) => m._id === message._id);
            if (alreadyThere) return old; 
            pages[last] = { ...pages[last], messages: [...pages[last].messages, message] };
            return { ...old, pages };
          });
        }
    }
    socket.on("getMessage", handleGetMessage);
    return () => socket.off("getMessage", handleGetMessage);
  }, [currentUser?._id, activeConversation?._id, queryClient]);

  function handleSelectConversation(conversation) {
    setActiveConversation(conversation);
    setMobileShowChat(true);
    markRead.mutate({ conversationId: conversation._id, isSeller: role === "seller" });
  }

  function handleSend(text) {
    if (!activeConversation?._id || !currentUser?._id) return;

    const recieverId =
      role === "seller"
        ? activeConversation.buyer?._id ?? activeConversation.buyer
        : activeConversation.seller?.owner?._id ?? activeConversation.seller?.owner ?? activeConversation.seller;

    if (!recieverId) {
      console.warn("No receiver id resolved — conversation may not be populated", activeConversation);
      return;
    }

    createMessage.mutate(
      { conversationId: activeConversation._id, sender: currentUser._id, isSeller: role === "seller", text },
      {
        onSuccess: (res) => {
          console.log("onSuccess fired, about to emit", res);
          const savedMessage = res.data; // backend returns { success, message: "...", data: <doc> }

          queryClient.setQueryData(["messages", activeConversation._id], (old) => {
            if (!old) return old;
            const pages = [...old.pages];
            const last = pages.length - 1;
            pages[last] = { ...pages[last], messages: [...pages[last].messages, savedMessage] };
            return { ...old, pages };
          });
          console.log("socket.connected?", socket.connected, "socket.id:", socket.id);
          socket.emit("sendMessage", {
            conversationId: activeConversation._id,
            recieverId,
            message: savedMessage,
          });
        },
      }
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center text-ink-muted text-sm">
        Log in to see your messages.
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto h-[calc(100vh-64px)] px-4 md:px-8 py-4">
      <div className="flex h-full border border-border rounded-lg overflow-hidden bg-surface">
        <div
          className={`w-full md:w-[320px] border-r border-border overflow-y-auto shrink-0
            ${mobileShowChat ? "hidden md:block" : "block"}`}
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="font-display text-ink text-lg">Messages</p>
          </div>
          <ConversationList
            conversations={conversationsData?.conversations ?? []}
            currentRole={role}
            activeId={activeConversation?._id}
            onSelect={handleSelectConversation}
            isLoading={isLoadingConversations}
          />
        </div>

        <div className={`flex-1 ${mobileShowChat ? "block" : "hidden md:block"}`}>
          <ChatWindow
            conversation={activeConversation}
            currentUserId={currentUser._id}
            currentRole={role}
            messages={messages}
            onSend={handleSend}
            isSending={createMessage.isPending}
            hasMore={!!hasNextPage}
            onLoadMore={fetchNextPage}
            isLoadingMessages={isLoadingMessages}
            onBack={() => setMobileShowChat(false)}
          />
        </div>
      </div>
    </div>
  );
}