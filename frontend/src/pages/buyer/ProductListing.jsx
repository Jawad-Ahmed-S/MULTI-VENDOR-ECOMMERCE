import { useState, useMemo } from "react";
import { useGetAllProducts } from "../../api/product";
import ProductGrid from "../../components/buyer/ProductGrid";
import FilterSidebar from "../../components/buyer/FilterSidebar";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function ProductListing() {
  const { data, isLoading } = useGetAllProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);

  const products = useMemo(() => data?.data || [], [data?.data]);

  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const titleMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = searchQuery === "" || titleMatch || descMatch;

      const matchesCategory = category ? p.category === category : true;
      const effectivePrice = p.discountPrice || p.originalPrice || 0;
      const matchesPrice = effectivePrice <= maxPrice;
      const matchesRating = (p.ratings || 0) >= minRating;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, searchQuery, category, maxPrice, minRating]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategory("");
    setMaxPrice(2000);
    setMinRating(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 font-sans">
      <Breadcrumbs items={[{ label: "Products" }]} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Browse Catalog</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
        <div className="md:col-span-1">
          <FilterSidebar
            categories={categories}
            selectedCategory={category}
            onSelectCategory={setCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            maxPrice={maxPrice}
            onPriceChange={setMaxPrice}
            minRating={minRating}
            onRatingChange={setMinRating}
            onReset={handleResetFilters}
          />
        </div>
        <div className="md:col-span-3">
          {isLoading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  );
}