import api from "./axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const getWishlistApi = () =>
  api.get("/user/wishlist").then((res) => res.data);

export const toggleWishlistApi = (productId) =>
  api.post(`/user/wishlist/${productId}`).then((res) => res.data);

export function useGetWishlist(enabled = true) {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistApi,
    enabled,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleWishlistApi,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update wishlist");
    },
  });
}