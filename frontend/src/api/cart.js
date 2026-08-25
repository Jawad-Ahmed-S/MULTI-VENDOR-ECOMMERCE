import api from "./axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const getCart = () =>
  api.get("/cart").then((res) => res.data);

export const addToCartApi = ({ productId, quantity = 1 }) =>
  api.post(`/cart/${productId}`, { quantity }).then((res) => res.data);

export const updateCartItemApi = ({ productId, quantity }) =>
  api.put(`/cart/${productId}`, { quantity }).then((res) => res.data);

export const removeFromCartApi = (productId) =>
  api.delete(`/cart/${productId}`).then((res) => res.data);

export const clearCartApi = () =>
  api.delete("/cart").then((res) => res.data);

// --- React Query Hooks ---

export function useGetCart(enabled = true) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCartApi,
    onSuccess: () => {
      toast.success("Added to cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCartItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromCartApi,
    onSuccess: () => {
      toast.success("Removed from cart");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => {
      toast.success("Cart cleared");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
}