import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetProduct } from "../../api/product";
import { useAddToCart } from "../../api/cart";
import { useToggleWishlist, useGetWishlist } from "../../api/wishlist";
import RatingStars from "../../components/common/RatingStars";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import AuthPromptModal from "../../components/authPromptModal";
import { ShoppingBag, Store as StoreIcon, Heart, Plus, Minus } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetProduct(id);
  const currentUser = useSelector((state) => state.user.currentUser?.data);

  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cart & Wishlist Mutations
  const { mutate: addToCart, isPending: isAddingCart } = useAddToCart();
  const { data: wishlistData } = useGetWishlist(!!currentUser);
  const { mutate: toggleWishlist } = useToggleWishlist();

  const product = data?.data;

  const wishlistArray = wishlistData?.data || [];
  const isWishlisted = wishlistArray.some((item) => (item._id || item) === product?._id);

  const handleDecrement = () => setQuantity((prev) => Math.max(prev - 1, 1));
  const handleIncrement = () => {
    if (product?.stock && quantity >= product.stock) return;
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    addToCart({ productId: product._id, quantity });
  };

  const handleWishlistToggle = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product._id);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSkeleton type="card" count={1} />
      </div>
    );
  }

  if (!product) return <div className="text-center py-12 text-ink-muted">Product not found.</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-sans">
        <Breadcrumbs items={[{ label: "Products", link: "/products" }, { label: product.name }]} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden flex items-center justify-center p-4 relative">
            <button
              onClick={handleWishlistToggle}
              aria-label="Wishlist"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-xs border border-border flex items-center justify-center text-ink hover:text-danger transition-colors cursor-pointer"
            >
              <Heart
                size={18}
                className={isWishlisted ? "fill-danger text-danger" : "text-ink-muted"}
              />
            </button>
            <img
              src={product.images?.[0]?.url || "/placeholder.png"}
              alt={product.name}
              className="max-h-96 object-contain rounded-md"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <span className="bg-accent-soft text-accent-text text-xs font-medium px-2.5 py-1 rounded-full uppercase">
              {product.category}
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink">{product.name}</h1>

            <div className="flex items-center gap-2">
              <RatingStars rating={product.ratings} />
              <span className="text-xs text-ink-muted">({product.reviews?.length || 0} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-brand">
                ${product.discountPrice || product.originalPrice}
              </span>
              {product.discountPrice && product.originalPrice && (
                <span className="text-sm text-ink-muted line-through">${product.originalPrice}</span>
              )}
            </div>

            <p className="text-sm text-ink leading-relaxed border-t border-border pt-4">
              {product.description}
            </p>

            {/* Quantity Stepper */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-ink block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-md bg-background h-10">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="px-3 h-full text-ink-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-semibold text-ink min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={product?.stock ? quantity >= product.stock : false}
                    className="px-3 h-full text-ink-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {product?.stock && (
                  <span className="text-xs text-ink-muted">{product.stock} in stock</span>
                )}
              </div>
            </div>

            {/* Store Info Card */}
            {product.store && (
              <div className="bg-surface-muted p-3 rounded-lg border border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StoreIcon size={18} className="text-brand" />
                  <span className="text-xs font-medium text-ink">{product.store.name}</span>
                </div>
                <Link to={`/store/${product.store._id}`} className="text-xs text-accent font-medium hover:underline">
                  View Store
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAddingCart}
                className="flex-1 bg-accent text-white font-medium py-3 rounded-md flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag size={18} />
                {isAddingCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthPromptModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}