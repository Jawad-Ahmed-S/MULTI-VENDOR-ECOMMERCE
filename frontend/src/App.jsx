import AppRouter from "./appRouter"
import { Toaster } from "react-hot-toast"
function App() {

  return (
    <>
      <Toaster position="top-center" />
      <AppRouter/>
    </>
  )
}

export default App
