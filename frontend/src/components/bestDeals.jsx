import { Link } from "react-router-dom"
import { useGetAllProducts } from "../api/product.js"
import ProductCard from "./buyer/productCard.jsx"

function isOnSale(product) {
  return !!product?.saleEndsAt && new Date(product.saleEndsAt).getTime() > Date.now()
}

export default function BestDeals() {
  const { data, isLoading, isError } = useGetAllProducts()

  const products = data?.data || []
  const deals = products.filter(isOnSale)

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
      <p className="font-display text-ink text-xl font-semibold mb-4">Best deals</p>

      {isLoading && <p className="text-ink-muted text-sm">Loading deals…</p>}
      {isError && <p className="text-danger-text text-sm">Couldn't load deals right now.</p>}

      {!isLoading && !isError && deals.length === 0 && (
        <p className="text-ink-muted text-sm">No active deals right now — check back soon.</p>
      )}

      {deals.length > 0 && (
        <>
        <div className="flex overflow-x-auto lg:overflow-x-visible justify-start lg:justify-around gap-4 pb-4 snap-x snap-mandatory">
          {deals.slice(0, 5).map((deal) => (
            <div 
              key={deal._id || deal.id} 
              className="shrink-0 w-[75%] sm:w-[45%] md:w-[30%] lg:w-[18%] max-w-[240px] snap-start"
            >
              <ProductCard product={deal} />
            </div>
          ))}
        </div>



          <div className="text-center mt-8">
            <Link to="/products">
              <button className="border border-border text-ink text-sm font-medium px-5 py-2.5 rounded-md hover:bg-surface-muted transition-colors cursor-pointer">
                See all products
              </button>
            </Link>
          </div>
        </>
      )}
    </section>
  )
}