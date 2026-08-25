import { Check, X, Trash2, Package } from "lucide-react";

export default function AdminProductTable({ products, onApprove, onReject, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-accent-text border border-accent/20">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-soft text-danger-text border border-danger/20">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-ink-muted border border-border">Pending</span>;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted border-b border-border text-xs text-brand font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!Array.isArray(products) || products.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-ink-muted">
                  No products match the selected filter.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                // Safely resolve image URL whether stored as object { url, public_id } or plain string
                const firstImage = product.images?.[0];
                const imageUrl = typeof firstImage === "object" ? firstImage?.url : firstImage;
                const isApproved = product.approvalStatus === "approved";

                return (
                  <tr key={product._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-surface-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Package className="w-5 h-5 text-brand" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-ink">{product.name}</div>
                          <div className="text-xs text-ink-muted truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">{product.category || "—"}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      ${product.discountPrice || product.originalPrice}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink">{product.stock}</td>
                    <td className="px-4 py-3">{getStatusBadge(product.approvalStatus)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isApproved && (
                          <button
                            onClick={() => onApprove(product._id)}
                            title="Approve Product"
                            className="p-1.5 text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {/* Hide reject button completely if approved */}
                        {!isApproved && (
                          <button
                            onClick={() => onReject(product._id)}
                            title="Reject Product"
                            className="p-1.5 text-danger-text hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(product._id)}
                          title="Delete Product"
                          className="p-1.5 text-ink-muted hover:text-danger-text rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}