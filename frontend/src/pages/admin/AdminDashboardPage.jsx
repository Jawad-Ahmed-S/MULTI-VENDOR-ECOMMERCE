import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  Building2,
  Package,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
} from "lucide-react";
import { useAdminGetAllStores } from "../../api/store.js";
import { useAdminGetAllProducts } from "../../api/product.js";
import { useGetAllOrdersAdmin } from "../../api/order.js";
import { useAdminGetAllUsers, useAdminGetAllSellers } from "../../api/user.js";

// ---- palette pulled straight from DESIGN.md tokens, used as literal hex
// values since chart libraries can't consume Tailwind classes ----
const COLOR = {
  accent: "#2F6E5E",
  accentSoft: "#E2EFEB",
  accentText: "#1B4438",
  brand: "#4C2E05",
  ink: "#1C0221",
  inkMuted: "#8A7E70",
  danger: "#B23A48",
  surfaceMuted: "#F0EAE3",
  border: "#E5DED4",
};

const STATUS_COLORS = {
  processing: COLOR.inkMuted,
  confirmed: COLOR.accent,
  shipped: COLOR.accentText,
  delivered: COLOR.brand,
  cancelled: COLOR.danger,
};

const DAY_MS = 86400000;

function pendingCount(list, field) {
  return list.filter((item) => (item[field] || "pending").toLowerCase() === "pending").length;
}

function sortByCreatedAtDesc(list) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

// Compares the trailing week against the week before it for a simple,
// honest trend indicator — no fabricated history required.
function weekOverWeek(list, valueFn = () => 1) {
  const now = Date.now();
  let thisWeek = 0;
  let lastWeek = 0;
  list.forEach((item) => {
    const t = new Date(item.createdAt || 0).getTime();
    if (!t) return;
    if (t >= now - 7 * DAY_MS) thisWeek += valueFn(item);
    else if (t >= now - 14 * DAY_MS) lastWeek += valueFn(item);
  });
  const pct = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return { thisWeek, pct };
}

function buildDailySeries(orders, days) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    buckets.set(key, { label: key, revenue: 0, orders: 0 });
  }
  orders.forEach((o) => {
    const t = new Date(o.createdAt || 0);
    const key = t.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (buckets.has(key)) {
      const b = buckets.get(key);
      b.revenue += o.totalPrice || 0;
      b.orders += 1;
    }
  });
  return Array.from(buckets.values());
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

export default function AdminDashboardPage() {
  const [rangeDays, setRangeDays] = useState(14);

  const { data: storesRes, isLoading: storesLoading } = useAdminGetAllStores();
  const { data: productsRes, isLoading: productsLoading } = useAdminGetAllProducts();
  const { data: ordersRes, isLoading: ordersLoading } = useGetAllOrdersAdmin();
  const { data: usersRes, isLoading: usersLoading } = useAdminGetAllUsers();
  const { data: sellersRes, isLoading: sellersLoading } = useAdminGetAllSellers();

  const isLoading = storesLoading || productsLoading || ordersLoading || usersLoading || sellersLoading;

  // Memoized so `|| []` doesn't hand out a fresh array reference on every
  // render, which would otherwise bust every useMemo below that depends on
  // these.
  const stores = useMemo(() => storesRes?.data || storesRes || [], [storesRes]);
  const products = useMemo(() => productsRes?.data || productsRes || [], [productsRes]);
  const orders = useMemo(() => ordersRes?.data || ordersRes || [], [ordersRes]);
  const users = useMemo(() => usersRes?.data || usersRes || [], [usersRes]);
  const sellers = useMemo(() => sellersRes?.data || sellersRes || [], [sellersRes]);

  const revenueTrend = useMemo(() => weekOverWeek(orders, (o) => o.totalPrice || 0), [orders]);
  const ordersTrend = useMemo(() => weekOverWeek(orders), [orders]);
  const usersTrend = useMemo(() => weekOverWeek(users), [users]);

  const dailySeries = useMemo(() => buildDailySeries(orders, rangeDays), [orders, rangeDays]);

  const statusBreakdown = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      const key = (o.orderStatus || "processing").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const key = p.category || "Uncategorized";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [products]);

  if (isLoading) {
    return <div className="p-4 text-ink-muted text-sm font-sans">Loading system metrics...</div>;
  }

  const pendingStores = pendingCount(stores, "approvalStatus");
  const pendingProducts = pendingCount(products, "approvalStatus");
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const recentOrders = sortByCreatedAtDesc(orders).slice(0, 5);
  const recentPeople = sortByCreatedAtDesc([
    ...users.map((u) => ({ ...u, role: "Buyer" })),
    ...sellers.map((s) => ({ ...s, role: "Seller" })),
  ]).slice(0, 5);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">Admin Dashboard</h1>
          <p className="text-ink-muted text-sm mt-1">Platform moderation and system-wide controls.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-accent-text bg-accent-soft px-2.5 py-1 rounded-full">
          <span className="relative flex w-1.5 h-1.5">
            <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-accent" />
          </span>
          Live
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} pct={revenueTrend.pct} />
        <StatCard label="Orders" value={orders.length} icon={ShoppingBag} pct={ordersTrend.pct} />
        <StatCard label="Total Stores" value={stores.length} icon={Building2} />
        <StatCard label="Total Products" value={products.length} icon={Package} />
        <StatCard label="Users" value={users.length} icon={Users} pct={usersTrend.pct} />
        <StatCard label="Sellers" value={sellers.length} icon={Store} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-surface border border-border rounded-lg p-5 hover:shadow-[0_4px_16px_rgba(28,2,33,0.08)] transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-sm text-ink">Revenue trend</h2>
              <p className="text-xs text-ink-muted mt-0.5">Daily revenue and order volume.</p>
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

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailySeries} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis
                tick={{ fill: COLOR.inkMuted, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={
                  <ChartTooltip formatter={(p) => `${p.name === "revenue" ? "Revenue" : "Orders"}: ${p.name === "revenue" ? "$" : ""}${p.value}`} />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={COLOR.accent}
                strokeWidth={2}
                fill="url(#revenueFill)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 hover:shadow-[0_4px_16px_rgba(28,2,33,0.08)] transition-shadow">
          <h2 className="font-display font-semibold text-sm text-ink mb-0.5">Order status</h2>
          <p className="text-xs text-ink-muted mb-4">Breakdown across all orders.</p>

          {statusBreakdown.length === 0 ? (
            <p className="text-ink-muted text-sm">No orders yet.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
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
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[entry.name] || COLOR.inkMuted }}
                    />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category breakdown + moderation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 hover:shadow-[0_4px_16px_rgba(28,2,33,0.08)] transition-shadow">
          <h2 className="font-display font-semibold text-sm text-ink mb-0.5">Products by category</h2>
          <p className="text-xs text-ink-muted mb-4">Top 6 categories by listing count.</p>

          {categoryBreakdown.length === 0 ? (
            <p className="text-ink-muted text-sm">No products yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: -8, right: 8 }}>
                <CartesianGrid horizontal={false} stroke={COLOR.border} />
                <XAxis type="number" tick={{ fill: COLOR.inkMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: COLOR.ink, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<ChartTooltip formatter={(p) => `${p.value} products`} />} />
                <Bar dataKey="value" fill={COLOR.accent} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModerationCard label="Products pending review" count={pendingProducts} to="/admin/products" icon={Package} />
          <ModerationCard label="Stores pending review" count={pendingStores} to="/admin/stores" icon={Building2} />
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrders orders={recentOrders} />
        <RecentPeople people={recentPeople} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, pct }) {
  const hasTrend = typeof pct === "number";
  const positive = pct >= 0;
  return (
    <div className="bg-surface border border-border rounded-lg p-5 hover:border-border-strong hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand">{label}</span>
        <div className="p-2 bg-surface-muted rounded-md text-brand shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-display font-semibold text-2xl text-ink mt-2">{value}</p>
      {hasTrend && (
        <div
          className={`flex items-center gap-0.5 text-[11px] font-medium mt-1.5 ${
            positive ? "text-accent-text" : "text-danger-text"
          }`}
        >
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(pct)}% vs last week
        </div>
      )}
    </div>
  );
}

function ModerationCard({ label, count, to, icon: Icon }) {
  const hasPending = count > 0;
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between hover:border-border-strong hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-md shrink-0 ${
            hasPending ? "bg-danger-soft text-danger-text" : "bg-accent-soft text-accent-text"
          }`}
        >
          {hasPending ? <AlertCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        <div>
          <p className="font-display font-semibold text-2xl text-ink">{count}</p>
          <span className="text-xs text-ink-muted">{label}</span>
        </div>
      </div>
      <Link
        to={to}
        className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-text transition-colors shrink-0"
      >
        Review queue
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

const ORDER_STATUS_STYLES = {
  processing: "bg-surface-muted text-ink",
  confirmed: "bg-accent-soft text-accent-text",
  shipped: "bg-accent-soft text-accent-text",
  delivered: "bg-accent-soft text-accent-text",
  cancelled: "bg-danger-soft text-danger-text",
};

function RecentOrders({ orders }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-[0_4px_16px_rgba(28,2,33,0.08)] transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-semibold text-sm text-ink">Recent orders</h2>
        <Link
          to="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-text transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-ink-muted text-sm p-4">No orders yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-muted/40 transition-colors"
            >
              <div>
                <p className="font-mono text-[11px] font-medium text-ink">#{order._id.slice(-8)}</p>
                <p className="text-ink-muted text-xs mt-0.5">
                  {order.shippingAddress?.fullName || order.user?.name || "Guest"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-brand text-sm">
                  ${order.totalPrice?.toFixed(2)}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase ${
                    ORDER_STATUS_STYLES[order.orderStatus] || ORDER_STATUS_STYLES.processing
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentPeople({ people }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-[0_4px_16px_rgba(28,2,33,0.08)] transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-display font-semibold text-sm text-ink">Recently joined</h2>
        <Link
          to="/admin/users"
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-text transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {people.length === 0 ? (
        <p className="text-ink-muted text-sm p-4">No signups yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {people.map((person) => (
            <div
              key={person._id}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent-text flex items-center justify-center text-xs font-semibold shrink-0">
                  {(person.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-ink font-medium">{person.name}</p>
                  <p className="flex items-center gap-1.5 text-ink-muted text-xs mt-0.5">
                    <Mail size={12} strokeWidth={2} />
                    {person.email}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  person.role === "Seller" ? "bg-accent-soft text-accent-text" : "bg-surface-muted text-ink"
                }`}
              >
                {person.role}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}