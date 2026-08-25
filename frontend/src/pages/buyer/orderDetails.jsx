import { useParams } from "react-router-dom";
import { useGetOrderDetails } from "../../api/order";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { CheckCircle2, MapPin, CreditCard } from "lucide-react";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { data: orderRes, isLoading } = useGetOrderDetails(orderId);

  const order = orderRes?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-12 text-ink-muted font-sans">Order details not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-sans">
      <Breadcrumbs items={[{ label: "My Orders", link: "/orders" }, { label: `Order #${order._id.slice(-6)}` }]} />

      {/* Success Notification */}
      <div className="bg-accent-soft border border-accent/20 rounded-lg p-4 flex items-center gap-3 text-accent-text">
        <CheckCircle2 size={24} className="text-accent shrink-0" />
        <div>
          <h2 className="font-display font-semibold text-sm">Order Placed Successfully!</h2>
          <p className="text-xs text-ink-muted">Thank you for your order. We are processing it for shipment.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
        <div className="flex flex-wrap justify-between items-center border-b border-border pb-4 gap-2">
          <div>
            <h1 className="font-display font-semibold text-lg text-ink">Order #{order._id}</h1>
            <p className="text-xs text-ink-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="flex gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/10 uppercase">
              Status: {order.orderStatus}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-muted text-ink-muted border border-border uppercase">
              Payment: {order.paymentInfo?.status}
            </span>
          </div>
        </div>

        {/* Order Items List */}
        <div className="space-y-3">
          <h3 className="font-medium text-xs text-ink uppercase tracking-wider">Ordered Items</h3>
          {order.orderItems?.map((item) => (
            <div key={item._id} className="flex items-center justify-between bg-background p-3 rounded-md border border-border text-xs">
              <div className="flex items-center gap-3">
                <img src={item.image || "/placeholder.png"} alt={item.name} className="w-12 h-12 object-cover rounded bg-surface" />
                <div>
                  <h4 className="font-medium text-ink">{item.name}</h4>
                  <p className="text-ink-muted">${item.price} x {item.quantity}</p>
                </div>
              </div>
              <span className="font-semibold text-ink">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Summary Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border text-xs">
          <div className="space-y-1">
            <h4 className="font-medium text-ink flex items-center gap-1.5"><MapPin size={14} className="text-brand" /> Delivery Address</h4>
            <p className="text-ink-muted">{order.shippingAddress?.fullName} ({order.shippingAddress?.phone})</p>
            <p className="text-ink-muted">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-ink flex items-center gap-1.5"><CreditCard size={14} className="text-brand" /> Payment Details</h4>
            <p className="text-ink-muted">Method: <strong className="text-ink">{order.paymentInfo?.method}</strong></p>
            <p className="text-ink-muted">Total Amount Paid: <strong className="text-brand">${order.totalPrice?.toFixed(2)}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}