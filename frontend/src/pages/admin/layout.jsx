import { Outlet } from "react-router-dom"
import Navbar from "../../components/navbar";
import Footer from "../../components/common/footer.jsx"
export default function AdminLayout() {
  return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8">
          <Outlet />
      </main>
      <Footer/>
      </div>
    );
}