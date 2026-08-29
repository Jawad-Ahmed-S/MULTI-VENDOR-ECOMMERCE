import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axiosInstance";

// 1. Fetch seller's products for the event creation form
export function useGetSellerProducts(storeId) {
  return useQuery({
    queryKey: ["sellerProducts", storeId],
    queryFn: () =>
      api.get(`/product/store/${storeId}`).then((res) => res.data.products),
    enabled: !!storeId,
  });
}

// 2. Fetch all events for a specific seller's store
export function useGetStoreEvents(storeId) {
  return useQuery({
    queryKey: ["storeEvents", storeId],
    queryFn: () =>
      api.get(`/event/store/${storeId}`).then((res) => res.data.events),
    enabled: !!storeId,
  });
}

// 3. Create Event Mutation
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData) =>
      api.post("/event/create", eventData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["storeEvents"]);
      queryClient.invalidateQueries(["activeEvents"]);
    },
  });
}

// 4. Update Event Mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, eventData }) =>
      api.put(`/event/${eventId}`, eventData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["storeEvents"]);
      queryClient.invalidateQueries(["activeEvents"]);
    },
  });
}

// 5. Delete Event Mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId) =>
      api.delete(`/event/${eventId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["storeEvents"]);
      queryClient.invalidateQueries(["activeEvents"]);
    },
  });
}