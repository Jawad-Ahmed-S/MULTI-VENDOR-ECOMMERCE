import { ArrowRight } from "lucide-react"
import heroImage from "../assets/hero-image.jpg"
export default function Hero() {
  return (
    <section className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[560px] overflow-hidden bg-surface-muted group">
      {/* Replace with a real hero asset */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
      />

          
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C0221]/80 via-[#1C0221]/35 to-[#1C0221]/10" />

      <div className="relative z-10 h-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 flex items-center">
        <div className="max-w-[280px] sm:max-w-sm md:max-w-lg">
          <span className="inline-block bg-accent-soft text-accent-text text-[10px] sm:text-[11px] font-medium rounded-full px-2.5 py-1 mb-3 sm:mb-4">
            New season
          </span>

          <h1 className="font-display text-white text-xl sm:text-2xl md:text-4xl lg:text-[44px] font-semibold leading-[1.15] mb-2 sm:mb-3">
            Shop from thousands of independent sellers
          </h1>

          <p className="hidden sm:block text-white/85 text-sm md:text-base mb-5 md:mb-6 max-w-md">
            Discover handpicked products from vendors across every category —
            quality, curated, delivered fast.
          </p>

          <button className="h-9 sm:h-10 md:h-11 bg-accent text-white rounded-md px-4 sm:px-5 md:px-6 text-xs sm:text-sm font-medium inline-flex items-center gap-2 hover:brightness-95">
            Start shopping
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  )
}