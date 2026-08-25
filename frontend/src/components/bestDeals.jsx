import { useBestDeals } from "../api/deals.js"
import ProductCard from "./ProductCard.jsx"

export default function BestDeals() {
  const { data, isLoading, isError } = useBestDeals()

  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
      <p className="font-display text-ink text-xl font-semibold mb-4">Best deals</p>

      {isLoading && <p className="text-ink-muted text-sm">Loading deals…</p>}
      {isError && <p className="text-danger-text text-sm">Couldn't load deals right now.</p>}

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((deal) => (
            <ProductCard key={deal.id} product={deal} />
          ))}
        </div>
      )}
    </section>
  )
}