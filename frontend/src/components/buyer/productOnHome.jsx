import { useState } from "react";
import { useGetAllProducts } from "../../api/product.js";
import ProductCard from "./productCard.jsx";

const PAGE_SIZE = 10; // matches .pagination(10) on the backend

export default function ProductGrid() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAllProducts({ page });

  const products = data?.data || [];
  const hasNextPage = products.length === PAGE_SIZE;

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
      <p className="font-display text-ink text-xl font-semibold mb-4">All products</p>

      {isLoading && <p className="text-ink-muted text-sm">Loading products…</p>}
      {isError && <p className="text-danger-text text-sm">Couldn't load products right now.</p>}

      {!isLoading && !isError && products.length === 0 && (
        <p className="text-ink-muted text-sm">No products found.</p>
      )}

      {products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border border-border text-ink text-sm font-medium px-5 py-2.5 rounded-md hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-ink-muted">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="border border-border text-ink text-sm font-medium px-5 py-2.5 rounded-md hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}