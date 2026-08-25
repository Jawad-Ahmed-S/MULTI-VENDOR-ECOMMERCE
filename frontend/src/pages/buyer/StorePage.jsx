import { useParams } from "react-router-dom";
import { useGetSingleStore, useGetStoreProducts } from "../../api/store";
import ProductGrid from "../../components/buyer/ProductGrid";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import RatingStars from "../../components/common/RatingStars";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function StorePage() {
  const { id } = useParams();
  const { data: storeData, isLoading: loadingStore } = useGetSingleStore(id);
  const { data: productsData, isLoading: loadingProducts } = useGetStoreProducts(id);

  const store = storeData?.data;
  const products = productsData?.data || [];

  if (loadingStore) return <LoadingSkeleton count={1} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs items={[{ label: "Stores", link: "/stores" }, { label: store?.name }]} />

      {/* Store Banner & Info */}
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{store?.name}</h1>
            <p className="text-xs text-ink-muted mt-1">{store?.description}</p>
          </div>
          <div className="text-right space-y-1">
            <RatingStars rating={store?.ratings} />
            <p className="text-xs text-ink-muted">{store?.totalReviews || 0} Total Reviews</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Store Inventory</h2>
        {loadingProducts ? <LoadingSkeleton type="card" count={4} /> : <ProductGrid products={products} />}
      </div>
    </div>
  );
}