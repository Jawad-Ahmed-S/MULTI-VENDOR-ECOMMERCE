import api from "./axiosInstance.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// =====================================================
// API FUNCTIONS
// =====================================================

// Customer
export const getAllStores = () =>
  api.get("/store/all").then((res) => res.data);

export const getSingleStore = (storeId) =>
  api.get(`/store/${storeId}`).then((res) => res.data);

// Seller
export const createStore = (storeData) =>
  api.post("/store/create", storeData).then((res) => res.data);

export const getMyStores = () =>
  api.get("/store/seller/my").then((res) => res.data);

export const getMyStore = (storeId) =>
  api.get(`/store/seller/my/${storeId}`).then((res) => res.data);

export const updateStore = ({ storeId, storeData }) =>
  api.put(`/store/seller/my/${storeId}`, storeData).then((res) => res.data);

export const deleteStore = (storeId) =>
  api.delete(`/store/seller/my/${storeId}`).then((res) => res.data);

export const getStoreStats = (storeId) =>
  // Note: backend route is nested under /seller/ (not /store/stats/:id) — confirm this is intended.
  api.get(`/store/seller/${storeId}/stats`).then((res) => res.data);

// Admin
export const adminGetAllStores = () =>
  api.get("/store/admin/all").then((res) => res.data);

export const adminGetSingleStore = (storeId) =>
  api.get(`/store/admin/${storeId}`).then((res) => res.data);

export const approveStore = (storeId) =>
  api.put(`/store/admin/${storeId}/approve`).then((res) => res.data);

export const rejectStore = ({ storeId, rejectionReason }) =>
  api.put(`/store/admin/${storeId}/reject`, { rejectionReason }).then((res) => res.data);

export const adminUpdateStore = ({ storeId, storeData }) =>
  api.put(`/store/admin/${storeId}`, storeData).then((res) => res.data);

export const adminDeleteStore = (storeId) =>
  api.delete(`/store/admin/${storeId}`).then((res) => res.data);


// =====================================================
// CUSTOM REACT QUERY HOOKS
// =====================================================

// Customer Hooks
export function useGetAllStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: getAllStores,
  });
}

export function useGetSingleStore(storeId) {
  return useQuery({
    queryKey: ["store", storeId],
    queryFn: () => getSingleStore(storeId),
    enabled: !!storeId,
  });
}

// Seller Hooks
export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store created successfully!");
      queryClient.invalidateQueries({ queryKey: ["myStores"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to create store"),
  });
}

export function useGetMyStores() {
  return useQuery({
    queryKey: ["myStores"],
    queryFn: getMyStores,
  });
}

export function useGetMyStore(storeId) {
  return useQuery({
    queryKey: ["myStore", storeId],
    queryFn: () => getMyStore(storeId),
    enabled: !!storeId,
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store updated!");
      queryClient.invalidateQueries({ queryKey: ["myStores"] });
      queryClient.invalidateQueries({ queryKey: ["myStore"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update store"),
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store deleted!");
      queryClient.invalidateQueries({ queryKey: ["myStores"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete store"),
  });
}

export function useGetStoreStats(storeId) {
  return useQuery({
    queryKey: ["storeStats", storeId],
    queryFn: () => getStoreStats(storeId),
    enabled: !!storeId,
  });
}

// One-liner comment: Admin functions for Store management
export function useAdminGetAllStores() {
  return useQuery({
    queryKey: ["adminStores"],
    queryFn: adminGetAllStores,
  });
}

export function useAdminGetSingleStore(storeId) {
  return useQuery({
    queryKey: ["adminStore", storeId],
    queryFn: () => adminGetSingleStore(storeId),
    enabled: !!storeId,
  });
}

export function useApproveStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store approved!");
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to approve store"),
  });
}

export function useRejectStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store rejected!");
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to reject store"),
  });
}

export function useAdminUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store updated by admin!");
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update store"),
  });
}

export function useAdminDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteStore,
    onSuccess: (data) => {
      toast.success(data?.message || "Store deleted by admin!");
      queryClient.invalidateQueries({ queryKey: ["adminStores"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete store"),
  });
}