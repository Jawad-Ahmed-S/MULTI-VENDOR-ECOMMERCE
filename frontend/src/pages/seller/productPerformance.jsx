import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, DollarSign, ShoppingBag, Layers, Star, Package, BarChart3 } from "lucide-react";
import { useGetMyProduct } from "../../api/product.js";
// ASSUMED hook, same as StorePerformancePage.jsx — see
// PERFORMANCE_PAGES_GUIDELINES.md for what to swap if it doesn't exist.
import { useGetStoreOrders } from "../../api/order.js";
import PageTabs from "../../components/seller/PageTabs.jsx";

const COLOR = {
  accent: "#2F6E5E",
  ink: "#1C0221",
  inkMuted: "#8A7E70",
  border: "#E5DED4",
};

const DAY_MS = 86400000;

function getProductId(item) {
  return typeof item.product === "object" ? item.product?._id : item.product;
}

function buildDailyUnits(matchingOrders, productId, days) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * DAY_MS).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    buckets.set(key, { label: key, units: 0 });
  }
  matchingOrders.forEach((o) => {
    const key = new Date(o.createdAt || 0).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (!buckets.has(key)) return;
    const item = (o.orderItems || []).find((it) => getProductId(it) === productId);
    if (item) buckets.get(key).units += item.quantity || 1;
  });
  return Array.from(buckets.values());
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-md px-3 py-2 shadow-[0_4px_16px_rgba(28,2,33,0.08)] text-xs">
      <p className="text-ink-muted mb-1">{label}</p>
      <p className="text-ink font-medium">Units sold: {payload[0].value}</p>
    </div>
  );
}

export default function ProductPerformancePage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data: productRes, isLoading: productLoading } = useGetMyProduct(productId);
  const product = productRes?.data || productRes;
  const storeId = typeof product?.store === "object" ? product?.store?._id : product?.store;

  const { data: ordersRes, isLoading: ordersLoading } = useGetStoreOrders(storeId);
  const storeOrders = useMemo(() => ordersRes?.data || ordersRes || [], [ordersRes]);

  const matchingOrders = useMemo(
    () => storeOrders.filter((o) => (o.orderItems || []).some((item) => getProductId(item) === productId)),
    [storeOrders, productId]
  );

  const { unitsSold, revenue } = useMemo(() => {
    let units = 0;
    let rev = 0;
    matchingOrders.forEach((o) => {
      const item = (o.orderItems || []).find((it) => getProductId(it) === productId);
      if (item) {
        units += item.quantity || 1;
        rev += (item.price || 0) * (item.quantity || 1);
      }
    });
    return { unitsSold: units, revenue: rev };
  }, [matchingOrders, productId]);

  const dailyUnits = useMemo(() => buildDailyUnits(matchingOrders, productId, 14), [matchingOrders, productId]);

  if (productLoading || ordersLoading) {
    return <div className="p-6 text-sm text-ink-muted text-center font-sans">Loading product performance...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 font-sans px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-brand font-medium hover:text-accent transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </button>

        <PageTabs
          tabs={[
            { to: `/seller/product/${productId}`, label: "Details", icon: Package, end: true },
            { to: `/seller/product/${productId}/performance`, label: "Performance", icon: BarChart3 },
          ]}
        />
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{product?.name} — Performance</h1>
        <p className="text-sm text-ink-muted mt-0.5">Sales activity for this product.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Units sold" value={unitsSold} icon={ShoppingBag} />
        <StatCard label="Revenue generated" value={`$${revenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard label="Current stock" value={product?.stock ?? 0} icon={Layers} />
        <StatCard
          label="Rating"
          value={typeof product?.ratings === "number" ? product.ratings.toFixed(1) : "—"}
          icon={Star}
        />
      </div>

      <div className="bg-surface border border-border rounded-lg p-5">
        <h2 className="font-display font-semibold text-sm text-ink mb-0.5">Sales trend</h2>
        <p className="text-xs text-ink-muted mb-4">Units sold per day, last 14 days.</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyUnits} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="productUnitsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR.accent} stopOpacity={0.25} />
                <stop offset="100%" stopColor={COLOR.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={COLOR.border} />
            <XAxis dataKey="label" tick={{ fill: COLOR.inkMuted, fontSize: 11 }} axisLine={{ stroke: COLOR.border }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: COLOR.inkMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="units" stroke={COLOR.accent} strokeWidth={2} fill="url(#productUnitsFill)" activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-ink">Recent orders with this product</h2>
        </div>
        {matchingOrders.length === 0 ? (
          <p className="text-ink-muted text-sm p-4">No orders yet for this product.</p>
        ) : (
          <div className="divide-y divide-border">
            {matchingOrders.slice(0, 5).map((order) => {
              const item = (order.orderItems || []).find((it) => getProductId(it) === productId);
              return (
                <div key={order._id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-muted/40 transition-colors">
                  <div>
                    <p className="font-mono text-[11px] font-medium text-ink">#{order._id.slice(-8)}</p>
                    <p className="text-ink-muted text-xs mt-0.5">Qty: {item?.quantity || 1}</p>
                  </div>
                  <span className="font-semibold text-brand text-sm">
                    ${((item?.price || 0) * (item?.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all">
      <div>
        <span className="text-xs font-medium text-brand">{label}</span>
        <p className="font-display font-semibold text-2xl text-ink mt-1">{value}</p>
      </div>
      <div className="p-3 bg-surface-muted rounded-md text-brand shrink-0">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}