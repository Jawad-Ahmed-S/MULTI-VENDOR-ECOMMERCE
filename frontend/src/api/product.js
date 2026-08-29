import api from "./axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// =====================================================
// API FUNCTIONS
// =====================================================

// Customer
export const getAllProducts = () =>
  api.get("/product/all").then((res) => res.data);

export const getProduct = (productId) =>
  api.get(`/product/${productId}`).then((res) => res.data);

export const getStoreProducts = (storeId) =>
  api.get(`/product/store/${storeId}`).then((res) => res.data);

// Seller
export const createProduct = ({ storeId, productData }) =>
  api.post(`/product/seller/store/${storeId}/create`, productData).then((res) => res.data);

export const getMyProducts = () =>
  api.get("/product/seller/my").then((res) => res.data);

export const getMyProduct = (productId) =>
  api.get(`/product/seller/my/${productId}`).then((res) => res.data);

export const updateProduct = ({ productId, productData }) =>
  api.put(`/product/seller/my/${productId}`, productData).then((res) => res.data);

export const deleteProduct = (productId) =>
  api.delete(`/product/seller/my/${productId}`).then((res) => res.data);

// Admin
export const adminGetAllProducts = () =>
  api.get("/product/admin/all").then((res) => res.data);

export const adminGetProduct = (productId) =>
  api.get(`/product/admin/${productId}`).then((res) => res.data);

export const approveProduct = (productId) =>
  api.put(`/product/admin/${productId}/approve`).then((res) => res.data);

export const rejectProduct = ({ productId, rejectionReason }) =>
  api.put(`/product/admin/${productId}/reject`, { rejectionReason }).then((res) => res.data);

export const adminUpdateProduct = ({ productId, productData }) =>
  api.put(`/product/admin/${productId}`, productData).then((res) => res.data);

export const adminDeleteProduct = (productId) =>
  api.delete(`/product/admin/${productId}`).then((res) => res.data);


// CUSTOM REACT QUERY HOOKS

// Customer Hooks
export function useGetAllProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });
}

export function useGetProduct(productId) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  });
}

export function useGetStoreProducts(storeId) {
  return useQuery({
    queryKey: ["storeProducts", storeId],
    queryFn: () => getStoreProducts(storeId),
    enabled: !!storeId,
  });
}

// Seller Hooks
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product created and pending approval!");
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to create product"),
  });
}

export function useGetMyProducts() {
  return useQuery({
    queryKey: ["myProducts"],
    queryFn: getMyProducts,
  });
}

export function useGetMyProduct(productId) {
  return useQuery({
    queryKey: ["myProduct", productId],
    queryFn: () => getMyProduct(productId),
    enabled: !!productId,
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product updated!");
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
      queryClient.invalidateQueries({ queryKey: ["myProduct"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update product"),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product deleted!");
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete product"),
  });
}

// One-liner comment: Admin functions for Product management
export function useAdminGetAllProducts() {
  return useQuery({
    queryKey: ["adminProducts"],
    queryFn: adminGetAllProducts,
  });
}

export function useAdminGetProduct(productId) {
  return useQuery({
    queryKey: ["adminProduct", productId],
    queryFn: () => adminGetProduct(productId),
    enabled: !!productId,
  });
}

export function useApproveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product approved!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to approve product"),
  });
}

export function useRejectProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product rejected!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to reject product"),
  });
}

export function useAdminUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product updated by admin!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update product"),
  });
}

export function useAdminDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: (data) => {
      toast.success(data?.message || "Product deleted by admin!");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete product"),
  });
}

export const getProductReviews = (productId) =>
  api.get(`/product/${productId}/reviews`).then((res) => res.data);

export const addReview = ({ productId, rating, comment }) =>
  api.post(`/product/${productId}/review`, { rating, comment }).then((res) => res.data);

export const deleteReview = (productId) =>
  api.delete(`/product/${productId}/review`).then((res) => res.data);


// Review Hooks
export function useGetProductReviews(productId, enabled = true) {
  return useQuery({
    queryKey: ["productReviews", productId],
    queryFn: () => getProductReviews(productId),
    enabled: !!productId && enabled,
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addReview,
    onSuccess: (data, variables) => {
      toast.success(data?.message || "Review submitted!");
      queryClient.invalidateQueries({ queryKey: ["productReviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to submit review"),
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (data, productId) => {
      toast.success(data?.message || "Review deleted!");
      queryClient.invalidateQueries({ queryKey: ["productReviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete review"),
  });
}