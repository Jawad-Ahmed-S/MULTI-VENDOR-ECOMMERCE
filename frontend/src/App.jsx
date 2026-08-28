import AppRouter from "./appRouter"
import { Toaster } from "react-hot-toast"

import { useSocketPresence } from "./api/socket.js"
function App() {
  useSocketPresence();
  return (
    <>
      <Toaster position="top-center" />
      <AppRouter/>
    </>
  )
}

export default App
