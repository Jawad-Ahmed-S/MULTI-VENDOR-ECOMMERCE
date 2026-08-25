import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar";

export default function SellerLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}