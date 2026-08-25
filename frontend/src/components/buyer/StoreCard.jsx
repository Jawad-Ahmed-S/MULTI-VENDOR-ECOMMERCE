import { Link } from "react-router-dom";
import RatingStars from "../common/RatingStars";
import { Store as StoreIcon, MapPin } from "lucide-react";

export default function StoreCard({ store }) {
  const bannerUrl = typeof store.banner === "object" ? store.banner?.url : store.banner;
  const cityName = typeof store.address === "object" ? store.address?.city : store.address;

  return (
    <Link
      to={`/store/${store._id}`}
      className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-border-strong hover:shadow-sm transition-all duration-200 block font-sans"
    >
      <div className="h-28 bg-surface-muted w-full relative overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted text-xs">
            <StoreIcon size={24} className="opacity-40" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-display text-base font-semibold text-ink truncate group-hover:text-brand transition-colors">
            {store.name}
          </h3>
          <span className="text-[11px] font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full shrink-0">
            Visit Store
          </span>
        </div>

        {cityName && (
          <div className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin size={12} />
            <span>{cityName}</span>
          </div>
        )}

        <p className="text-xs text-ink-muted line-clamp-2 h-8 leading-relaxed">
          {store.description || "No description provided."}
        </p>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <RatingStars rating={store.ratings || 0} />
          <span className="text-[11px] text-ink-muted">
            {store.totalReviews || 0} reviews
          </span>
        </div>
      </div>
    </Link>
  );
}