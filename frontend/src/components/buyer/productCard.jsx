import { Link } from "react-router-dom";
import { Package, ExternalLink } from "lucide-react";

export default function ProductCard({ product }) {
  // Extract .url from the first image object in the array safely
  const firstImageObj = product?.images?.[0];
  const imageUrl = typeof firstImageObj === "object" ? firstImageObj?.url : firstImageObj;

  const storeId = product?.store?._id || product?.store;
  const storeName = product?.store?.name || "Visit Store";

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden group hover:border-border-strong hover:shadow-sm transition-all duration-200 font-sans flex flex-col justify-between">
      <div>
        {/* Cover Image */}
        <Link to={`/product/${product._id}`} className="block relative aspect-square bg-surface-muted overflow-hidden">
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
          {product.category && (
            <span className="absolute top-2 left-2 bg-accent-soft text-accent-text text-[10px] font-medium px-2 py-0.5 rounded-full border border-accent/10">
              {product.category}
            </span>
          )}
        </Link>

        {/* Info Area */}
        <div className="p-4 space-y-2">
          {storeId && (
            <Link
              to={`/store/${storeId}`}
              className="text-[11px] font-medium text-brand hover:text-accent flex items-center gap-1 w-fit"
            >
              <span>{storeName}</span>
              <ExternalLink size={10} />
            </Link>
          )}

          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-medium text-sm text-ink line-clamp-1 group-hover:text-brand transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer / Pricing */}
      <div className="px-4 pb-4 pt-2 border-t border-border flex items-center justify-between mt-auto">
        <div>
          <span className="font-display font-semibold text-sm text-ink">
            ${product.discountPrice || product.originalPrice}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-ink-muted line-through ml-2">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <Link
          to={`/product/${product._id}`}
          className="text-xs font-medium text-accent hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}