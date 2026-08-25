import { useState } from "react";
import { useGetAllOrdersAdmin } from "../../api/order";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import { Filter } from "lucide-react";

export default function AdminAllOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: ordersRes, isLoading } = useGetAllOrdersAdmin();

  const orders = ordersRes?.data || [];

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-4">
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink flex items-center gap-2">
           All Orders Overview
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            System-wide order log for marketplace oversight.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-ink-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-background border border-border rounded-md font-medium text-ink focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink">
            <thead className="bg-surface-muted border-b border-border font-medium text-ink-muted uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Total</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] font-medium text-ink">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="p-3.5 font-medium">
                    {order.shippingAddress?.fullName || order.user?.name || "Guest"}
                  </td>
                  <td className="p-3.5 text-ink-muted">
                    {order.orderItems?.length || 0} item(s)
                  </td>
                  <td className="p-3.5">
                    <span className="uppercase font-semibold text-[11px]">
                      {order.paymentInfo?.method}
                    </span>
                    <span className="text-ink-muted block text-[10px]">
                      {order.paymentInfo?.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-brand">
                    ${order.totalPrice?.toFixed(2)}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent-soft text-accent border border-accent/10 uppercase">
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}