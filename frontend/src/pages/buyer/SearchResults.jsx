import { useSearchParams } from "react-router-dom";
import { useSearchResults } from "../../api/search";
import CombinedGrid from "../../components/buyer/combinedResults";
import FilterSidebar from "../../components/buyer/FilterSidebar";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";

  const minPriceParam = searchParams.get("minPrice");
  const minPrice = minPriceParam ? Number(minPriceParam) : null;

  const maxPriceParam = searchParams.get("maxPrice");
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : null;

  const minRatingParam = searchParams.get("minRating");
  const minRating = minRatingParam ? Number(minRatingParam) : 0;

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

  const queryParams = {
    keyword,
    category,
    page,
    limit: 10,
    ...(minPrice ? { minPrice } : {}),
    ...(maxPrice ? { maxPrice } : {}),
    ...(minRating ? { minRating } : {}),
  };

  const { data, isLoading, isError } = useSearchResults(queryParams);
  const results = data?.data || [];
  // const totalCount = data?.count || 0;

  const handleReset = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-sans">
      <Breadcrumbs items={[{ label: "Search Results" }]} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {keyword ? `Search Results for "${keyword}"` : "Explore Products & Stores"}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Showing Page {page} ({results.length} results)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <FilterSidebar
            searchQuery={keyword}
            onSearchChange={(val) => updateParams({ keyword: val })}
            selectedCategory={category}
            onSelectCategory={(cat) => updateParams({ category: cat })}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceApply={(min, max) => updateParams({ minPrice: min, maxPrice: max })}
            minRating={minRating}
            onRatingChange={(stars) => updateParams({ minRating: stars || null })}
            onReset={handleReset}
          />
        </div>

        {/* Results Stream */}
        <div className="md:col-span-3 space-y-6">
          {isLoading ? (
            <LoadingSkeleton type="card" count={8} />
          ) : isError ? (
            <div className="p-4 bg-danger-soft text-danger-text rounded-md border border-danger/20 text-sm">
              Failed to load search results.
            </div>
          ) : (
            <>
              <CombinedGrid items={results} />

              {/* DB-Level Pagination Controls */}
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
                  disabled={results.length < 10}
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