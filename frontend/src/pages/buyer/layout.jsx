import { Outlet } from "react-router-dom"
import Navbar from "../../components/navbar.jsx"
import Footer from "../../components/common/footer.jsx"
export default function BuyerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer/>
    </div>
  )
}