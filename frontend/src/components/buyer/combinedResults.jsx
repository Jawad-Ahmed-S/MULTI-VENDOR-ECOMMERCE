import ProductCard from "./ProductCard";
import StoreCard from "./StoreCard";
import EmptyState from "../common/EmptyState";

export default function CombinedGrid({ items = [] }) {
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No results found"
        message="Try adjusting your keyword or filters to find what you're looking for."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 font-sans">
      {items.map((item) => {
        if (item.itemType === "store") {
          return <StoreCard key={`store-${item._id}`} store={item} />;
        }
        return <ProductCard key={`product-${item._id}`} product={item} />;
      })}
    </div>
  );
}