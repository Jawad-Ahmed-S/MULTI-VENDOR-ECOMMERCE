import { useParams } from "react-router-dom";
import { useGetAllProducts } from "../../api/product";
import ProductGrid from "../../components/buyer/ProductGrid";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const { data, isLoading } = useGetAllProducts();

  const products = (data?.data || []).filter(
    (p) => p.category?.toLowerCase() === categoryName?.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <Breadcrumbs items={[{ label: "Categories", link: "/products" }, { label: categoryName }]} />
      <h1 className="font-display text-2xl font-semibold text-ink capitalize">{categoryName}</h1>

      {isLoading ? <LoadingSkeleton type="card" count={4} /> : <ProductGrid products={products} />}
    </div>
  );
}