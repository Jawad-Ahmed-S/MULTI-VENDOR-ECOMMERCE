import { useParams } from "react-router-dom";
import { useGetStoreOrders, useUpdateOrderStatus } from "../../api/order";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import { Store} from "lucide-react";

export default function SellerStoreOrdersPage() {
  const { storeId } = useParams();
  const { data: ordersRes, isLoading } = useGetStoreOrders(storeId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const orders = ordersRes?.data || [];

  const handleStatusChange = (orderId, newStatus) => {
    updateStatus({ orderId, status: newStatus });
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
          title="No Orders Yet"
          message="Customers haven't purchased items from this store yet."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink flex items-center gap-2">
            <Store className="text-brand" /> Store Orders Management
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">Manage and fulfill orders placed for your store.</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-surface border border-border rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3 text-xs">
              <div>
                <span className="font-mono font-medium text-ink block">Order #{order._id}</span>
                <span className="text-ink-muted text-[11px]">
                  Customer: <strong>{order.user?.name || "Guest"}</strong> ({order.user?.email})
                </span>
              </div>

              {/* Status Select Action */}
              <div className="flex items-center gap-2">
                <label className="text-ink-muted font-medium">Update Status:</label>
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

            {/* Store Specific Items */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-medium text-ink-muted uppercase">Items to Fulfill</h4>
              {order.orderItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-xs bg-background p-2.5 rounded border border-border">
                  <div className="flex items-center gap-3">
                    <img src={item.image || "/placeholder.png"} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    <span className="font-medium text-ink">{item.name}</span>
                  </div>
                  <span className="text-ink-muted">Qty: {item.quantity} | Total: ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            <div className="text-xs bg-surface-muted p-3 rounded border border-border flex justify-between items-center text-ink-muted">
              <div>
                <span>Ship to: </span>
                <strong className="text-ink">{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.street}, {order.shippingAddress?.city})
              </div>
              <div>
                <span>Payment: </span>
                <strong className="text-brand uppercase">{order.paymentInfo?.method}</strong> ({order.paymentInfo?.status})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}