import { useGetAllStores } from "../../api/store";
import StoreCard from "../../components/buyer/StoreCard";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function StoreDirectory() {
  const { data, isLoading } = useGetAllStores();
  const stores = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs items={[{ label: "Stores" }]} />
      <h1 className="font-display text-2xl font-semibold text-ink">Verified Vendor Stores</h1>

      {isLoading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stores.map((store) => (
            <StoreCard key={store._id} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}