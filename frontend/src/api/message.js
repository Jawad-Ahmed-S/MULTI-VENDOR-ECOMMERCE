import api from "./axiosInstance";
import {useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

// --- API Calls ---

export const createMessageApi = ({ conversationId, sender, isSeller, text }) =>
  api
    .post("/message/create", { conversationId, sender, isSeller, text })
    .then((res) => res.data);

export const getMessagesApi = ({ conversationId, page = 1, limit = 30 }) =>
  api
    .get(`/message/${conversationId}`, { params: { page, limit } })
    .then((res) => res.data);

export const deleteMessageApi = ({ messageId, senderId }) =>
  api.put(`/message/${messageId}/delete`, { senderId }).then((res) => res.data);

// --- Hooks ---

// 1. Send a message (REST save — socket emit for live push happens in the component,
//    right after this mutation succeeds, not in here)
export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMessageApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Message failed to send");
    },
  });
}

// 2. Fetch messages for a conversation — paginated, so use infinite query
//    for a "load older messages" scroll-up pattern in the chat window
export function useGetMessages(conversationId) {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam = 1 }) =>
      getMessagesApi({ conversationId, page: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.messages?.length ? allPages.length + 1 : undefined,
    enabled: !!conversationId,
  });
}

// 3. Soft delete a message ("unsend")
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not delete message");
    },
  });
}