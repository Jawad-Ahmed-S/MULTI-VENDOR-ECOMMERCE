import { Store, Package, Layers } from "lucide-react";
import { useGetMyStores } from "../../api/store.js";
import { useGetMyProducts } from "../../api/product.js"; 

export default function SellerDashboard() {
  const { data: storesRes, isLoading: storesLoading } = useGetMyStores();
  const { data: productsRes, isLoading: productsLoading } = useGetMyProducts();

  const stores = storesRes?.data || storesRes || [];
  const products = productsRes?.data || productsRes || [];

  if (storesLoading || productsLoading) {
    return <div className="p-4 text-ink-muted text-sm font-sans">Loading overview metrics...</div>;
  }

  const totalStock = Array.isArray(products)
    ? products.reduce((acc, curr) => acc + (curr.stock || 0), 0)
    : 0;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Dashboard Overview</h1>
        <p className="text-ink-muted text-sm mt-1">Manage your storefront activity and track global inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Total Active Stores</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{stores.length}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-brand">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Total Listed Products</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{products.length}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-brand">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-brand">Aggregated Stock Units</span>
            <p className="font-display font-semibold text-2xl text-ink mt-1">{totalStock}</p>
          </div>
          <div className="p-3 bg-surface-muted rounded-md text-brand">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}