import api from "./axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


export const createOrGetConversationApi = ({ buyer, seller }) =>
  api.post("/conversation/create-or-get", { buyer, seller }).then((res) => res.data);

export const getBuyerConversationsApi = (buyerId) =>
  api.get(`/conversation/buyer/${buyerId}`).then((res) => res.data);

export const getSellerConversationsApi = (sellerId) =>
  api.get(`/conversation/seller/${sellerId}`).then((res) => res.data);

export const markConversationReadApi = ({ conversationId, isSeller }) =>
  api
    .put(`/conversation/${conversationId}/mark-read`, { isSeller })
    .then((res) => res.data);

// --- Hooks ---

// 1. Create or fetch existing conversation (fires when buyer clicks "Message seller")
export function useCreateOrGetConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrGetConversationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not open conversation");
    },
  });
}

// 2. Buyer inbox list
export function useGetBuyerConversations(buyerId) {
  return useQuery({
    queryKey: ["conversations", "buyer", buyerId],
    queryFn: () => getBuyerConversationsApi(buyerId),
    enabled: !!buyerId,
  });
}

// 3. Seller inbox list
export function useGetSellerConversations(sellerId) {
  return useQuery({
    queryKey: ["conversations", "seller", sellerId],
    queryFn: () => getSellerConversationsApi(sellerId),
    enabled: !!sellerId,
  });
}

// 4. Mark a conversation as read (resets the unread badge for whoever opened it)
export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationReadApi,
    onSuccess: () => {
      // no toast here on purpose — this fires silently every time a chat is opened
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}