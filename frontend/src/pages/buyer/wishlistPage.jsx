import { Link } from "react-router-dom";
import { Heart, HeartOff, ShoppingBag } from "lucide-react";
import { useGetWishlist, useToggleWishlist } from "../../api/wishlist.js";

// Product docs in this app can come from slightly different shapes depending
// on which endpoint populated them — these helpers just pick the first field
// that exists instead of assuming one exact schema.
function getProductImage(product) {
  return (
    product?.images?.[0]?.url ||
    product?.image?.url ||
    product?.thumbnail?.url ||
    null
  );
}

function getProductHref(product) {
  return `/product/${product?.slug || product?._id}`;
}

function formatPrice(price) {
  if (price === undefined || price === null) return null;
  return `$${Number(price).toFixed(2)}`;
}

export default function WishlistPage() {
  const { data: res, isLoading, isError, error } = useGetWishlist();
  const toggleWishlist = useToggleWishlist();

  const items = res?.data || res || [];
  const list = Array.isArray(items) ? items : [];

  const handleRemove = (e, productId) => {
    // Stop the click from also following the card's Link to the product page.
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist.mutate(productId);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6 font-sans">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">Your Wishlist</h1>
        <p className="text-ink-muted text-sm mt-1">
          Items you've saved for later{list.length > 0 ? ` — ${list.length} item${list.length === 1 ? "" : "s"}` : ""}.
        </p>
      </div>

      {isLoading ? (
        <div className="text-ink-muted text-sm">Loading your wishlist...</div>
      ) : isError ? (
        <div className="bg-danger-soft text-danger-text p-4 rounded-md border border-border text-sm">
          {error?.response?.data?.message || "Failed to load your wishlist."}
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed border-border rounded-lg p-12 text-center">
          <ShoppingBag size={28} strokeWidth={1.5} className="text-ink-muted" />
          <p className="text-ink font-medium text-sm">Your wishlist is empty</p>
          <p className="text-ink-muted text-xs max-w-xs">
            Tap the heart icon on any product to save it here for later.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-1.5 bg-accent text-white rounded-md px-4 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {list.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={(e) => handleRemove(e, product._id)}
              removing={toggleWishlist.isPending && toggleWishlist.variables === product._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({ product, onRemove, removing }) {
  const image = getProductImage(product);
  const price = formatPrice(product.price);

  return (
    <Link
      to={getProductHref(product)}
      className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-border-strong transition-colors"
    >
      <div className="relative aspect-square bg-surface-muted rounded-t-lg overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>
        )}

        <button
          onClick={onRemove}
          disabled={removing}
          title="Remove from wishlist"
          className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm text-accent hover:bg-danger-soft hover:text-danger transition-colors cursor-pointer disabled:opacity-50"
        >
          {removing ? (
            <HeartOff size={16} strokeWidth={2} />
          ) : (
            <Heart size={16} strokeWidth={2} fill="currentColor" />
          )}
        </button>

        {product.category && (
          <span className="absolute bottom-2 left-2 bg-accent-soft text-accent-text px-2 py-0.5 rounded-full text-[10px] font-medium">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-3 space-y-1">
        <p className="text-ink text-[13px] font-medium leading-snug line-clamp-2">
          {product.name}
        </p>
        {product.store?.name && (
          <p className="text-ink-muted text-[11px]">{product.store.name}</p>
        )}
        {price && <p className="text-brand text-sm font-medium pt-0.5">{price}</p>}
      </div>
    </Link>
  );
}