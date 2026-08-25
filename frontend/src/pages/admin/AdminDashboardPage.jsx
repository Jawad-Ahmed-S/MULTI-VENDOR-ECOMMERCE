import { Building2, Package, AlertCircle } from "lucide-react";
import { useAdminGetAllStores } from "../../api/store.js";
import { useAdminGetAllProducts } from "../../api/product.js";

export default function AdminDashboardPage() {
  const { data: storesRes, isLoading: storesLoading } = useAdminGetAllStores();
  const { data: productsRes, isLoading: productsLoading } = useAdminGetAllProducts();

  const stores = storesRes?.data || storesRes || [];
  const products = productsRes?.data || productsRes || [];

  if (storesLoading || productsLoading) {
    return <div className="p-4 text-ink-muted text-sm font-sans">Loading system metrics...</div>;
  }

  const pendingStores = Array.isArray(stores)
    ? stores.filter((s) => s.status?.toLowerCase() === "pending" || !s.status).length
    : 0;

  const pendingProducts = Array.isArray(products)
    ? products.filter((p) => p.status?.toLowerCase() === "pending" || !p.status).length
    : 0;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Admin Dashboard</h1>
        <p className="text-ink-muted text-sm mt-1">Platform moderation and system-wide controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Total Stores</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{stores.length}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-brand">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Pending Stores</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{pendingStores}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-danger-text">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Total Products</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{products.length}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-brand">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Pending Products</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{pendingProducts}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-danger-text">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}