import { useState } from "react";
import AdminStoreTable from "../../components/admin/AdminStoreTable";
import RejectionModal from "../../components/admin/RejectionModal";
import {
  useAdminGetAllStores,
  useApproveStore,
  useRejectStore,
  useAdminDeleteStore,
} from "../../api/store.js";

export default function AdminStoresPage() {
  const [filter, setFilter] = useState("all");
  const [rejectingStoreId, setRejectingStoreId] = useState(null);

  const { data: storesRes, isLoading, isError, error } = useAdminGetAllStores();
  const approveStoreMutation = useApproveStore();
  const rejectStoreMutation = useRejectStore();
  const deleteStoreMutation = useAdminDeleteStore();

  const stores = storesRes?.data || storesRes || [];

  const filteredStores = Array.isArray(stores)
    ? stores.filter((store) => {
        if (filter === "all") return true;
        const status = store.approvalStatus?.toLowerCase() || "pending";
        return status === filter;
      })
    : [];

  const handleApprove = (storeId) => {
    approveStoreMutation.mutate(storeId);
  };

  const handleRejectSubmit = (rejectionReason) => {
    if (rejectingStoreId) {
      rejectStoreMutation.mutate({ storeId: rejectingStoreId, rejectionReason });
      setRejectingStoreId(null);
    }
  };

  const handleDelete = (storeId) => {
    if (window.confirm("Permanently delete this store?")) {
      deleteStoreMutation.mutate(storeId);
    }
  };

  if (isLoading) {
    return <div className="text-ink-muted text-sm font-sans">Loading store listings...</div>;
  }

  if (isError) {
    return (
      <div className="bg-danger-soft text-danger-text p-4 rounded-md border border-danger/20 text-sm font-sans">
        {error?.response?.data?.message || "Failed to load admin store management."}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Store Moderation</h1>
          <p className="text-ink-muted text-sm mt-1">Review, approve, or reject vendor storefront applications.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize cursor-pointer transition-colors ${
              filter === f
                ? "bg-accent text-white"
                : "bg-surface border border-border text-ink-muted hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <AdminStoreTable
        stores={filteredStores}
        onApprove={handleApprove}
        onReject={(id) => setRejectingStoreId(id)}
        onDelete={handleDelete}
      />

      <RejectionModal
        isOpen={!!rejectingStoreId}
        onClose={() => setRejectingStoreId(null)}
        onSubmit={handleRejectSubmit}
        title="Reject Store Application"
      />
    </div>
  );
}