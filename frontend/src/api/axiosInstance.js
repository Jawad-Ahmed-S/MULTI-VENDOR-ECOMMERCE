import axios from "axios"
import { store } from "../redux/store.js"

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/`,
})
 
api.interceptors.request.use((config) => {
  const token = store.getState().user.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api