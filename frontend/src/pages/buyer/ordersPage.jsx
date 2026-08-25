import { Link } from "react-router-dom";
import { useGetMyOrders, useCancelOrder } from "../../api/order";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { Package, ExternalLink, Trash2, Calendar } from "lucide-react";

export default function MyOrdersPage() {
  const { data: ordersRes, isLoading } = useGetMyOrders();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const orders = ordersRes?.data || [];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-accent-soft text-accent-text border-accent/20";
      case "shipped":
        return "bg-brand/10 text-brand border-brand/20";
      case "confirmed":
        return "bg-surface-muted text-ink border-border";
      case "cancelled":
        return "bg-danger-soft text-danger-text border-danger/20";
      default:
        return "bg-background text-ink-muted border-border";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-4">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-sans space-y-4">
        <EmptyState
          title="No Orders Found"
          message="You haven't placed any orders yet."
        />
        <div className="text-center">
          <Link to="/products">
            <button className="bg-accent text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-accent/90 transition-colors cursor-pointer">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 font-sans">
      <Breadcrumbs items={[{ label: "Account" }, { label: "My Orders" }]} />

      <h1 className="font-display font-semibold text-2xl text-ink">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isCancellable = ["processing", "confirmed"].includes(order.orderStatus);

          return (
            <div
              key={order._id}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-strong transition-all"
            >
              {/* Card Header */}
              <div className="px-5 py-3.5 bg-surface-muted/50 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-ink-muted block text-[10px] uppercase">Order ID</span>
                    <span className="font-mono font-medium text-ink">#{order._id.slice(-8)}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[10px] uppercase">Date Placed</span>
                    <span className="font-medium text-ink flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                  <Link
                    to={`/order/${order._id}`}
                    className="text-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    Details <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Items Stream */}
              <div className="p-5 space-y-3">
                {order.orderItems?.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-border bg-background overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-muted">
                            <Package size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-ink line-clamp-1">{item.name}</h4>
                        <p className="text-ink-muted text-[11px]">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-border bg-surface flex items-center justify-between text-xs">
                <div>
                  <span className="text-ink-muted">Payment: </span>
                  <strong className="text-ink uppercase font-medium">{order.paymentInfo?.method}</strong>
                  <span className="text-ink-muted ml-2">({order.paymentInfo?.status})</span>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-ink-muted mr-2">Total:</span>
                    <strong className="font-display font-semibold text-sm text-brand">
                      ${order.totalPrice?.toFixed(2)}
                    </strong>
                  </div>

                  {isCancellable && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      disabled={isCancelling}
                      className="px-3 py-1 bg-danger-soft text-danger-text text-xs rounded border border-danger/20 hover:bg-danger/20 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={12} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}