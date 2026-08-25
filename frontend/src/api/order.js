import api from "./axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// --- API Calls ---

export const createOrderApi = (shippingData) =>
  api.post("/order", shippingData).then((res) => res.data);

export const getMyOrdersApi = () =>
  api.get("/order/me").then((res) => res.data);

export const getOrderDetailsApi = (orderId) =>
  api.get(`/order/${orderId}`).then((res) => res.data);

export const getStoreOrdersApi = (storeId) =>
  api.get(`/order/store/${storeId}`).then((res) => res.data);

export const cancelOrderApi = (orderId) =>
  api.delete(`/order/${orderId}`).then((res) => res.data);

export const updateOrderStatusApi = ({ orderId, status, paymentStatus }) =>
  api.put(`/order/${orderId}/status`, { status, paymentStatus }).then((res) => res.data);

export const getSellerAllOrdersApi = () =>
  api.get("/order/seller/orders").then((res) => res.data);

export const getAllOrdersAdminApi = () =>
  api.get("/order/admin/all").then((res) => res.data);

// 1. Create Order (Checkout)
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrderApi,
    onSuccess: () => {
      toast.success("Order placed successfully!");
      
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to place order");
    },
  });
}

// 2. Fetch Buyer's Orders List
export function useGetMyOrders(enabled = true) {
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: getMyOrdersApi,
    enabled,
  });
}

// 3. Fetch Single Order Details
export function useGetOrderDetails(orderId) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderDetailsApi(orderId),
    enabled: !!orderId,
  });
}

// 4. Fetch Seller's Store Orders
export function useGetStoreOrders(storeId) {
  return useQuery({
    queryKey: ["storeOrders", storeId],
    queryFn: () => getStoreOrdersApi(storeId),
    enabled: !!storeId,
  });
}

// 5. Cancel / Delete Order (Buyer)
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrderApi,
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Could not cancel order");
    },
  });
}

// 6. Update Order Status (Seller / Admin)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatusApi,
    onSuccess: (_, variables) => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["storeOrders"] });
      queryClient.invalidateQueries({ queryKey: ["sellerAllOrders"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update order status");
    },
  });
}

export function useGetSellerAllOrders() {
  return useQuery({
    queryKey: ["sellerAllOrders"],
    queryFn: getSellerAllOrdersApi,
  });
}

export function useGetAllOrdersAdmin() {
  return useQuery({
    queryKey: ["adminAllOrders"],
    queryFn: getAllOrdersAdminApi,
  });
}