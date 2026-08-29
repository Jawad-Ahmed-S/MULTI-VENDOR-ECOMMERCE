import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ExternalLink, Timer, Flame } from "lucide-react";

export default function ProductCard({ product }) {
  const firstImageObj = product?.images?.[0];
  const imageUrl = typeof firstImageObj === "object" ? firstImageObj?.url : firstImageObj;

  const storeId = product?.store?._id || product?.store;
  const storeName = product?.store?.name || "Visit Store";

  // State to hold current timestamp, initialized cleanly in an effect
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!product?.saleEndsAt) return;

    // Update interval for live countdown
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [product?.saleEndsAt]);

  // Derived state (Pure calculations using state)
  const saleEndTime = product?.saleEndsAt ? new Date(product.saleEndsAt).getTime() : 0;
  const isSaleActive = Boolean(now && saleEndTime > now);

  const discountPercent =
    isSaleActive && product?.originalPrice && product?.discountPrice
      ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
      : null;

  const getTimeLeftString = () => {
    if (!now || !saleEndTime) return null;
    const diff = saleEndTime - now;
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    return `${hours}h ${mins}m ${secs}s`;
  };

  const timeLeft = isSaleActive ? getTimeLeftString() : null;

  return (
    <div
      className={`rounded-xl overflow-hidden group transition-all duration-300 font-sans flex flex-col justify-between relative border ${
        isSaleActive
          ? "bg-gradient-to-b from-rose-500/5 via-amber-500/5 to-surface border-rose-500/40 hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/10 ring-1 ring-rose-500/20"
          : "bg-surface border-border hover:border-border-strong hover:shadow-sm"
      }`}
    >
      <div>
        {/* Cover Image Area */}
        <Link
          to={`/product/${product._id}`}
          className="block relative aspect-square bg-surface-muted overflow-hidden"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-muted">
              <Package size={32} />
            </div>
          )}

          {/* Badges Container */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
            {isSaleActive && (
              <span className="bg-gradient-to-r from-rose-600 to-amber-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase flex items-center gap-1 animate-pulse">
                <Flame size={12} className="fill-white" />
                {discountPercent ? `${discountPercent}% OFF` : "FLASH SALE"}
              </span>
            )}
            {product.category && (
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border backdrop-blur-md ${
                  isSaleActive
                    ? "bg-black/60 text-white border-white/20"
                    : "bg-accent-soft text-accent-text border-accent/10"
                }`}
              >
                {product.category}
              </span>
            )}
          </div>

          {/* Sale Timer Overlay Bar */}
          {isSaleActive && timeLeft && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-rose-950/90 via-black/85 to-amber-950/90 backdrop-blur-xs text-white text-[11px] py-1.5 px-3 flex items-center justify-between font-mono border-t border-rose-500/30">
              <span className="text-[10px] font-semibold tracking-wider text-rose-300 uppercase flex items-center gap-1">
                <Timer size={12} className="text-amber-400 animate-spin" /> Sale Ends
              </span>
              <span className="font-bold text-amber-300">{timeLeft}</span>
            </div>
          )}
        </Link>

        {/* Info Area */}
        <div className="p-4 space-y-2">
          {storeId && (
            <Link
              to={`/store/${storeId}`}
              className={`text-[11px] font-medium flex items-center gap-1 w-fit transition-colors ${
                isSaleActive
                  ? "text-rose-500 hover:text-rose-600 font-semibold"
                  : "text-brand hover:text-accent"
              }`}
            >
              <span>{storeName}</span>
              <ExternalLink size={10} />
            </Link>
          )}

          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-semibold text-sm text-ink line-clamp-1 group-hover:text-brand transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer / Dynamic Pricing */}
      <div
        className={`px-4 pb-4 pt-2 flex items-center justify-between mt-auto border-t ${
          isSaleActive ? "border-rose-500/20 bg-rose-500/5" : "border-border"
        }`}
      >
        <div className="flex items-baseline gap-2">
          <span
            className={`font-display font-bold ${
              isSaleActive ? "text-base text-rose-600" : "text-sm text-ink"
            }`}
          >
            ${product.discountPrice || product.originalPrice}
          </span>
          {isSaleActive && product.originalPrice && (
            <span className="text-xs text-ink-muted line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <Link
          to={`/product/${product._id}`}
          className={`text-xs font-semibold transition-colors ${
            isSaleActive
              ? "text-rose-600 hover:text-rose-700 underline underline-offset-2"
              : "text-accent hover:underline"
          }`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}