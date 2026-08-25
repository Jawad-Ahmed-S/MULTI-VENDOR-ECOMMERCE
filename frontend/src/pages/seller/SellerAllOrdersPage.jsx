import { useGetSellerAllOrders, useUpdateOrderStatus } from "../../api/order";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import { Store, Package, MapPin, Calendar } from "lucide-react";

export default function SellerAllOrdersPage() {
  const { data: ordersRes, isLoading } = useGetSellerAllOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const orders = ordersRes?.data || [];

  const handleStatusChange = (orderId, newStatus) => {
    updateStatus({ orderId, status: newStatus });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-accent-soft text-accent-text border-accent/20";
      case "shipped":
        return "bg-brand/10 text-brand border-brand/20";
      case "confirmed":
        return "bg-surface-muted text-ink border-border";
      default:
        return "bg-background text-ink-muted border-border";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-4">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-sans">
        <EmptyState
          title="No Store Orders Yet"
          message="None of your stores have received orders yet."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink flex items-center gap-2">
            <Store className="text-brand" /> Seller Orders Management
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Overview of orders across all stores owned by your account.
          </p>
        </div>
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-surface-muted border border-border text-ink">
          Total Orders: {orders.length}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-strong transition-all p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-ink">
                    Order #{order._id.slice(-8)}
                  </span>
                  <span className="text-ink-muted">|</span>
                  <span className="text-ink-muted flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-ink-muted text-[11px]">
                  Customer: <strong className="text-ink">{order.user?.name || "Guest"}</strong> ({order.user?.email})
                </p>
              </div>

              {/* Status Controls */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeClass(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </span>

                <div className="flex items-center gap-2">
                  <label className="text-ink-muted text-[11px] font-medium">Update Status:</label>
                  <select
                    value={order.orderStatus}
                    disabled={isUpdating}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="h-8 px-2.5 text-xs bg-background border border-border rounded-md font-medium text-ink focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Items Stream */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">
                Ordered Products
              </h4>
              {order.orderItems?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between text-xs bg-background p-3 rounded-md border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-border bg-surface overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-muted">
                          <Package size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-ink">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent/10">
                          Store: {item.store?.name || "Your Store"}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          ${item.price} × {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-ink">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer / Address */}
            <div className="text-xs bg-surface-muted/50 p-3 rounded-md border border-border flex flex-wrap justify-between items-center gap-2 text-ink-muted">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand shrink-0" />
                <span>
                  Ship To: <strong className="text-ink">{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.street}, {order.shippingAddress?.city})
                </span>
              </div>
              <div>
                Payment: <strong className="text-ink uppercase">{order.paymentInfo?.method}</strong> ({order.paymentInfo?.status})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}