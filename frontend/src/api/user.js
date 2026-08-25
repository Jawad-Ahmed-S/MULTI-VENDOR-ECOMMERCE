import api from "./axiosInstance"
import { useDispatch } from "react-redux"
import { useMutation } from "@tanstack/react-query"
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
