import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock } from "lucide-react";

// Ticks once a second so every row's sale state / countdown re-derives
// from a single shared clock instead of one setInterval per row.
function useClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

function isOnSale(product, now) {
  return Boolean(product.saleEndsAt) && new Date(product.saleEndsAt).getTime() > now;
}

function formatCountdown(msRemaining) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function ProductTable({ products, onDelete }) {
  const now = useClock();

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
          {products.map((product) => {
            const onSale = isOnSale(product, now);
            const msRemaining = onSale ? new Date(product.saleEndsAt).getTime() - now : 0;

            return (
              <tr
                key={product._id}
                className={`transition-colors ${
                  onSale
                    ? "bg-accent-soft/40 border-l-4 border-l-accent hover:bg-accent-soft/60"
                    : "hover:bg-surface-muted/30"
                }`}
              >
                <td className="p-4 font-medium">
                  <Link
                    to={`/seller/product/${product._id}`}
                    className="flex items-center gap-3 hover:text-accent transition-colors"
                  >
                    <div className="relative shrink-0">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-md bg-surface-muted" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-surface-muted flex items-center justify-center text-xs text-ink-muted">No Image</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5">
                        {product.name}
                        {onSale && (
                          <span className="bg-accent text-white px-1.5 py-0.5 rounded-full text-[11px] font-medium leading-none">
                            Sale
                          </span>
                        )}
                      </span>
                      {onSale && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-accent-text">
                          <Clock className="w-3 h-3" />
                          {formatCountdown(msRemaining)} left
                        </span>
                      )}
                    </div>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}