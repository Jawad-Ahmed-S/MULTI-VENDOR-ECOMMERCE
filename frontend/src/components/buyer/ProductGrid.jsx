import ProductCard from "./ProductCard"
import EmptyState from "../common/EmptyState";

export default function ProductGrid({ products = [] }) {
  if (!products || products.length === 0) {
    return <EmptyState title="No products available" message="Check back later for new inventory." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}