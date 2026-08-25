import { Link } from "react-router-dom";
import ProductTable from "../../components/seller/ProductTable";
import { useGetMyProducts, useDeleteProduct } from "../../api/product";
import { PlusCircle } from "lucide-react";

export default function MyProductsPage() {
  const { data, isLoading, isError, error } = useGetMyProducts();
  const products = data?.data || [];

  const { mutate: deleteProduct } = useDeleteProduct();

  const handleDelete = (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    deleteProduct(productId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink">My Products</h1>
          <p className="text-ink-muted text-sm mt-1">Review inventory across all stores under your ownership.</p>
        </div>
        <Link to="/seller/products/create">
          <button className="flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-95 transition-opacity">
            <PlusCircle className="w-4 h-4" />
            Add Product
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-ink-muted text-sm">Loading products...</div>
      ) : isError ? (
        <div className="text-red-500 text-sm">
          {error?.response?.data?.message || "Failed to load products."}
        </div>
      ) : (
        <ProductTable products={products} onDelete={handleDelete} />
      )}
    </div>
  );
}