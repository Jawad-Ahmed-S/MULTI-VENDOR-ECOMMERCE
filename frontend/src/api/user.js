import api from "./axiosInstance"
import { useDispatch } from "react-redux"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { setUser } from "../redux/userSlice/userSlice.js"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export const login = (credentials) =>
  api.post("/user/login", credentials).then((res) => res.data)

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
        toast.success("Account Logged In!")
        dispatch(setUser({ user: data, token: data.token }))
        navigate("/")
      }
    })
  }
  
export const register = (user) => {
  console.log("In the Register function")
   return api.post("/user/create", user).then(res => { return res.data})}

export function useRegister() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Check your Email to activate your account.!")
      navigate("/login")
    }
  })
}


export const adminGetAllUsers = () =>
  api.get("/user/admin/users").then((res) => res.data);
 
// Returns all sellers, each with a `stores` array attached (empty if the
// seller hasn't created a store yet). Replaces the old separate
// sellers/owners endpoints — one list, always consistent.
export const adminGetAllSellers = () =>
  api.get("/user/admin/sellers").then((res) => res.data);
 
export const adminGetUser = (userId) =>
  api.get(`/user/admin/${userId}`).then((res) => res.data);
 
export const adminUpdateUser = ({ userId, userData }) =>
  api.put(`/user/admin/${userId}`, userData).then((res) => res.data);
 
export const adminDeleteUser = (userId) =>
  api.delete(`/user/admin/${userId}`).then((res) => res.data);
 
// =====================================================
// CUSTOM REACT QUERY HOOKS — ADMIN
// =====================================================
 
export function useAdminGetAllUsers() {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: adminGetAllUsers,
  });
}
 
export function useAdminGetAllSellers() {
  return useQuery({
    queryKey: ["adminSellers"],
    queryFn: adminGetAllSellers,
  });
}
 
export function useAdminGetUser(userId) {
  return useQuery({
    queryKey: ["adminUser", userId],
    queryFn: () => adminGetUser(userId),
    enabled: !!userId,
  });
}
 
function invalidateAdminUserQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
  queryClient.invalidateQueries({ queryKey: ["adminSellers"] });
}
 
export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateUser,
    onSuccess: (data) => {
      toast.success(data?.message || "User updated!");
      invalidateAdminUserQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ["adminUser"] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to update user"),
  });
}
 
export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: (data) => {
      toast.success(data?.message || "User deleted!");
      invalidateAdminUserQueries(queryClient);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete user"),
  });
}