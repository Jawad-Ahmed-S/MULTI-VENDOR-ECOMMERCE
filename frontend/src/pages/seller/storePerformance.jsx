import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useGetMyStore } from "../../api/store.js";
import { useGetStoreProducts } from "../../api/product.js";
// ASSUMED hook — see PERFORMANCE_PAGES_GUIDELINES.md if this doesn't exist
// yet on your side. Expected to return orders scoped to this store, each
// with { _id, totalPrice, orderStatus, createdAt, orderItems: [{ product, quantity, price }] }.
import { useGetStoreOrders } from "../../api/order.js";

const COLOR = {
  accent: "#2F6E5E",
  accentText: "#1B4438",
  brand: "#4C2E05",
  ink: "#1C0221",
  inkMuted: "#8A7E70",
  danger: "#B23A48",
  border: "#E5DED4",
};

const STATUS_COLORS = {
  processing: COLOR.inkMuted,
  confirmed: COLOR.accent,
  shipped: COLOR.accentText,
  delivered: COLOR.brand,
  cancelled: COLOR.danger,
};

const LOW_STOCK_THRESHOLD = 10;
const DAY_MS = 86400000;

function buildDailySeries(orders, days) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * DAY_MS).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    buckets.set(key, { label: key, revenue: 0 });
  }
  orders.forEach((o) => {
    const key = new Date(o.createdAt || 0).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (buckets.has(key)) buckets.get(key).revenue += o.totalPrice || 0;
  });
  return Array.from(buckets.values());
}

function getProductId(item) {
  return typeof item.product === "object" ? item.product?._id : item.product;
}

function getProductName(item) {
  return typeof item.product === "object" ? item.product?.name : item.productName || "Unknown product";
}

function buildTopProducts(orders) {
  const totals = new Map();
  orders.forEach((o) => {
    (o.orderItems || []).forEach((item) => {
      const id = getProductId(item);
      if (!id) return;
      const existing = totals.get(id) || { name: getProductName(item), revenue: 0, units: 0 };
      existing.revenue += (item.price || 0) * (item.quantity || 1);
      existing.units += item.quantity || 1;
      totals.set(id, existing);
    });
  });
  return Array.from(totals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-md px-3 py-2 shadow-[0_4px_16px_rgba(28,2,33,0.08)] text-xs">
      <p className="text-ink-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-ink font-medium">
          {formatter ? formatter(p) : `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

export default function StorePerformancePage() {
  const { storeId } = useParams();
  const [rangeDays, setRangeDays] = useState(14);

  const { data: storeRes, isLoading: storeLoading } = useGetMyStore(storeId);
  const { data: productsRes, isLoading: productsLoading } = useGetStoreProducts(storeId);
  const { data: ordersRes, isLoading: ordersLoading } = useGetStoreOrders(storeId);

  const isLoading = storeLoading || productsLoading || ordersLoading;

  const store = storeRes?.data || storeRes;
  const products = useMemo(() => productsRes?.data || productsRes || [], [productsRes]);
  const orders = useMemo(() => ordersRes?.data || ordersRes || [], [ordersRes]);

  const dailySeries = useMemo(() => buildDailySeries(orders, rangeDays), [orders, rangeDays]);
  const topProducts = useMemo(() => buildTopProducts(orders), [orders]);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      const key = (o.orderStatus || "processing").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  if (isLoading) {
    return <div className="p-6 text-sm text-ink-muted text-center font-sans">Loading store performance...</div>;
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD).length;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 font-sans px-4 sm:px-6">
      <Link
        to={`/seller/store/${storeId}`}
        className="flex items-center gap-1.5 text-xs text-brand font-medium hover:text-accent transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{store?.name} — Performance</h1>
        <p className="text-sm text-ink-muted mt-0.5">Sales, order activity, and top products for this store.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Store revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard label="Orders" value={orders.length} icon={ShoppingBag} />
        <StatCard label="Avg. order value" value={`$${avgOrderValue.toFixed(2)}`} icon={TrendingUp} />
        <StatCard
          label="Low stock products"
          value={lowStockCount}
          icon={AlertTriangle}
          alert={lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-surface border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-sm text-ink">Revenue trend</h2>
              <p className="text-xs text-ink-muted mt-0.5">Daily revenue for this store.</p>
            </div>
            <div className="flex gap-1">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setRangeDays(d)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    rangeDays === d
                      ? "bg-accent text-white"
                      : "border border-border text-ink-muted hover:text-ink hover:bg-surface-muted"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailySeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="storeRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR.accent} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={COLOR.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={COLOR.border} />
              <XAxis
                dataKey="label"
                tick={{ fill: COLOR.inkMuted, fontSize: 11 }}
                axisLine={{ stroke: COLOR.border }}
                tickLine={false}
                interval={rangeDays > 14 ? Math.floor(rangeDays / 8) : 0}
              />
              <YAxis tick={{ fill: COLOR.inkMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<ChartTooltip formatter={(p) => `Revenue: $${p.value}`} />} />
              <Area type="monotone" dataKey="revenue" stroke={COLOR.accent} strokeWidth={2} fill="url(#storeRevenueFill)" activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="font-display font-semibold text-sm text-ink mb-0.5">Order status</h2>
          <p className="text-xs text-ink-muted mb-4">Breakdown for this store.</p>
          {statusBreakdown.length === 0 ? (
            <p className="text-ink-muted text-sm">No orders yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLOR.inkMuted} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip formatter={(p) => `${p.name}: ${p.value}`} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                {statusBreakdown.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-ink-muted capitalize">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || COLOR.inkMuted }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5">
        <h2 className="font-display font-semibold text-sm text-ink mb-0.5">Top products</h2>
        <p className="text-xs text-ink-muted mb-4">Best sellers by revenue in this store.</p>
        {topProducts.length === 0 ? (
          <p className="text-ink-muted text-sm">No sales yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: -8, right: 8 }}>
              <CartesianGrid horizontal={false} stroke={COLOR.border} />
              <XAxis type="number" tick={{ fill: COLOR.inkMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: COLOR.ink, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<ChartTooltip formatter={(p) => `Revenue: $${p.value.toFixed(2)}`} />} />
              <Bar dataKey="revenue" fill={COLOR.accent} radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, alert }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all">
      <div>
        <span className="text-xs font-medium text-brand">{label}</span>
        <p className="font-display font-semibold text-2xl text-ink mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-md shrink-0 ${alert ? "bg-danger-soft text-danger-text" : "bg-surface-muted text-brand"}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}