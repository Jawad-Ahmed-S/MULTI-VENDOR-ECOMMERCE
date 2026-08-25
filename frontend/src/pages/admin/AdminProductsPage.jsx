import { useState } from "react";
import AdminProductTable from "../../components/admin/AdminProductTable";
import RejectionModal from "../../components/admin/RejectionModal";
import {
  useAdminGetAllProducts,
  useApproveProduct,
  useRejectProduct,
  useAdminDeleteProduct,
} from "../../api/product.js";

export default function AdminProductsPage() {
  const [filter, setFilter] = useState("all");
  const [rejectingProductId, setRejectingProductId] = useState(null);

  const { data: productsRes, isLoading, isError, error } = useAdminGetAllProducts();
  const approveProductMutation = useApproveProduct();
  const rejectProductMutation = useRejectProduct();
  const deleteProductMutation = useAdminDeleteProduct();

  const products = productsRes?.data || productsRes || [];

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        if (filter === "all") return true;
        const status = product.status?.toLowerCase() || "pending";
        return status === filter;
      })
    : [];

  const handleApprove = (productId) => {
    approveProductMutation.mutate(productId);
  };

  const handleRejectSubmit = (rejectionReason) => {
    if (rejectingProductId) {
      rejectProductMutation.mutate({ productId: rejectingProductId, rejectionReason });
      setRejectingProductId(null);
    }
  };

  const handleDelete = (productId) => {
    if (window.confirm("Permanently delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return <div className="text-ink-muted text-sm font-sans">Loading product listings...</div>;
  }

  if (isError) {
    return (
      <div className="bg-danger-soft text-danger-text p-4 rounded-md border border-danger/20 text-sm font-sans">
        {error?.response?.data?.message || "Failed to load admin product management."}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Product Moderation</h1>
          <p className="text-ink-muted text-sm mt-1">Review and approve product listings before they go live on the market.</p>
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

      <AdminProductTable
        products={filteredProducts}
        onApprove={handleApprove}
        onReject={(id) => setRejectingProductId(id)}
        onDelete={handleDelete}
      />

      <RejectionModal
        isOpen={!!rejectingProductId}
        onClose={() => setRejectingProductId(null)}
        onSubmit={handleRejectSubmit}
        title="Reject Product Listing"
      />
    </div>
  );
}