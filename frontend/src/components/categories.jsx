import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

// Update this whenever categories change — image imports must match
// actual filenames under ../Images/categories/
import electronics from "../assets/Images/categories/electronics.jpg"
import fashion from "../assets/Images/categories/fashion.jpg"
import homeLiving from "../assets/Images/categories/home-living.jpg"
import beauty from "../assets/Images/categories/beauty.jpg"
import grocery from "../assets/Images/categories/grocery.jpg"
import sports from "../assets/Images/categories/sports.jpg"
import toys from "../assets/Images/categories/toys.jpg"
import books from "../assets/Images/categories/books.jpg"

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", image: electronics },
  { name: "Fashion", slug: "fashion", image: fashion },
  { name: "Home & Living", slug: "home-living", image: homeLiving },
  { name: "Beauty", slug: "beauty", image: beauty },
  { name: "Grocery", slug: "grocery", image: grocery },
  { name: "Sports", slug: "sports", image: sports },
  { name: "Toys", slug: "toys", image: toys },
  { name: "Books", slug: "books", image: books },
]

// Fixed at 2 rows regardless of how many categories exist — column count
// is derived from the list length so this never has to be hand-tuned.
const COLUMNS = Math.ceil(CATEGORIES.length / 2)

export default function Categories() {
  return (
    <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="bg-surface border border-border rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-ink text-xl font-semibold">Shop by category</p>
          <Link
            to="/search"
            className="text-accent-text text-[13px] font-medium inline-flex items-center gap-1 shrink-0 hover:underline"
          >
            See more
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>

        <div
          className="grid gap-x-2 gap-y-5"
          style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/search?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-surface-muted border border-border group-hover:border-accent transition-colors">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
              </div>
              <span className="text-ink text-[11px] sm:text-[12px] font-medium text-center leading-tight group-hover:text-accent transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}