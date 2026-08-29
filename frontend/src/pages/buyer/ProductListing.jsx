import { useSearchParams } from "react-router-dom";
import { useGetAllProducts } from "../../api/product";
import ProductGrid from "../../components/buyer/ProductGrid";
import FilterSidebar from "../../components/buyer/FilterSidebar";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";

  const minPriceParam = searchParams.get("minPrice");
  const minPrice = minPriceParam ? Number(minPriceParam) : null;

  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;

  const activeSale = searchParams.get("activeSale") === "true";
  const page = Number(searchParams.get("page")) || 1;

  const updateParams = (updates, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      if (resetPage) next.set("page", "1");
      return next;
    });
  };

  // Construct queryParams aligned with ApiClass backend methods
  const queryParams = {
  ...(keyword ? { keyword } : {}),
  ...(category ? { category } : {}),
  page,
  limit: 12,
  ...(minPrice !== null && !isNaN(minPrice) ? { minPrice } : {}),
  ...(maxPrice !== null && !isNaN(maxPrice) ? { maxPrice } : {}),
  ...(activeSale ? { activeSale: "true" } : {}),
};


  const { data, isLoading, isError } = useGetAllProducts(queryParams);
  const products = data?.data || data?.products || [];

  const handleResetFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 font-sans">
      <Breadcrumbs items={[{ label: "Products" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Browse Catalog</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Showing Page {page} ({products.length} products)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
        <div className="md:col-span-1">
          <FilterSidebar
            selectedCategory={category}
            onSelectCategory={(cat) => updateParams({ category: cat })}
            searchQuery={keyword}
            onSearchChange={(val) => updateParams({ keyword: val })}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceApply={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
            activeSale={activeSale}
            onActiveSaleChange={(val) => updateParams({ activeSale: val ? "true" : null })}
            onReset={handleResetFilters}
          />
        </div>
        <div className="md:col-span-3 space-y-6">
          {isLoading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : isError ? (
            <div className="p-4 bg-danger-soft text-danger-text rounded-md border border-danger/20 text-sm">
              Failed to load products.
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Server-Side Pagination Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: Math.max(page - 1, 1) }, false)}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-2 border border-border rounded-md hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <span className="text-xs text-ink-muted font-medium">Page {page}</span>

                <button
                  disabled={products.length < 12}
                  onClick={() => updateParams({ page: page + 1 }, false)}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-2 border border-border rounded-md hover:bg-surface-muted transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}