import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function ProductTable({ products, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center text-ink-muted">
        No products listed yet.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return <span className="bg-accent-soft text-accent-text px-2 py-0.5 rounded-full text-xs font-medium">Approved</span>;
    }
    if (status === "rejected") {
      return <span className="bg-danger-soft text-danger-text px-2 py-0.5 rounded-full text-xs font-medium">Rejected</span>;
    }
    return <span className="bg-surface-muted text-brand px-2 py-0.5 rounded-full text-xs font-medium">Pending</span>;
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-muted/50 text-xs font-medium text-brand">
            <th className="p-4">Product Name</th>
            <th className="p-4">Category</th>
            <th className="p-4">Price</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Approval Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm text-ink">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-surface-muted/30 transition-colors">
              <td className="p-4 font-medium">
                <Link
                  to={`/seller/product/${product._id}`}
                  className="flex items-center gap-3 hover:text-accent transition-colors"
                >
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-md bg-surface-muted" />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-surface-muted flex items-center justify-center text-xs text-ink-muted">No Image</div>
                  )}
                  <span>{product.name}</span>
                </Link>
              </td>
              <td className="p-4 text-ink-muted">{product.category}</td>
              <td className="p-4 font-medium text-brand">
                ${product.discountPrice ? product.discountPrice : product.originalPrice}
                {product.discountPrice && (
                  <span className="text-xs text-ink-muted line-through ml-1.5">${product.originalPrice}</span>
                )}
              </td>
              <td className="p-4">{product.stock}</td>
              <td className="p-4">{getStatusBadge(product.approvalStatus)}</td>
              <td className="p-4 text-right">
                <button
                  onClick={() => onDelete(product._id)}
                  className="p-1.5 text-danger hover:bg-danger-soft rounded-md transition-colors"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}