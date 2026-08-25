import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import StoreCard from "../../components/seller/StoreCard";
import { useGetMyStores } from "../../api/store.js";

export default function MyStoresPage() {
  const { data: storesRes, isLoading, isError, error } = useGetMyStores();

  const stores = storesRes?.data || storesRes || [];

  if (isLoading) {
    return <div className="text-ink-muted text-sm font-sans">Loading stores...</div>;
  }

  if (isError) {
    return (
      <div className="bg-danger-soft text-danger-text p-4 rounded-md border border-danger/20 text-sm font-sans">
        {error?.response?.data?.message || "Failed to load stores"}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">My Stores</h1>
          <p className="text-ink-muted text-sm mt-1">Manage existing storefronts or request new store approvals.</p>
        </div>
        <Link to="/seller/store/create">
          <button className="flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-95 transition-opacity cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            Create Store
          </button>
        </Link>
      </div>

      {!Array.isArray(stores) || stores.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-ink-muted">
          You have no registered stores yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}