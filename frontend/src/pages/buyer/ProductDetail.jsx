import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAddToCart } from "../../api/cart";
import { useToggleWishlist, useGetWishlist } from "../../api/wishlist";
import { useCreateOrGetConversation } from "../../api/conversation";
import RatingStars from "../../components/common/RatingStars";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import AuthPromptModal from "../../components/authPromptModal";
import { ShoppingBag, Store as StoreIcon, Heart, Plus, Minus, MessageCircle,Star, Trash2 } from "lucide-react";
import { useGetProduct, useGetProductReviews, useAddReview, useDeleteReview } from "../../api/product";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetProduct(id);
  const currentUser = useSelector((state) => state.user.currentUser?.data);

  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Cart & Wishlist Mutations
  const { mutate: addToCart, isPending: isAddingCart } = useAddToCart();
  const { data: wishlistData } = useGetWishlist(!!currentUser);
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: createOrGetConversation, isPending: isContactingSeller } =
    useCreateOrGetConversation();

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

  const handleContactSeller = () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    createOrGetConversation(
      { buyer: currentUser._id, seller: product.store._id },
      {
        onSuccess: (res) => {
          // hand the freshly created/fetched conversation straight to the inbox
          // page so it opens pre-selected instead of landing on an empty list
          navigate("/messages", { state: { conversation: res.data } });
        },
      }
    );
  };

  const [reviewRating, setReviewRating] = useState(0);
const [reviewComment, setReviewComment] = useState("");

const { data: reviewsData, isLoading: isLoadingReviews } = useGetProductReviews(id, !!currentUser);
const { mutate: submitReview, isPending: isSubmittingReview } = useAddReview();
const { mutate: removeReview, isPending: isDeletingReview } = useDeleteReview();

const reviews = reviewsData?.data || [];
const myReview = reviews.find((r) => (r.user?._id || r.user) === currentUser?._id);

const handleSubmitReview = () => {
  if (!currentUser) {
    setShowAuthModal(true);
    return;
  }
  if (!reviewRating) {
    return;
  }
  submitReview(
    { productId: product._id, rating: reviewRating, comment: reviewComment },
    {
      onSuccess: () => {
        setReviewRating(0);
        setReviewComment("");
      },
    }
  );
};

const handleDeleteReview = () => {
  removeReview(product._id);
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

              {product.store && (
                <button
                  onClick={handleContactSeller}
                  disabled={isContactingSeller}
                  className="flex-1 bg-background text-ink font-medium py-3 rounded-md border border-border flex items-center justify-center gap-2 hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle size={18} />
                  {isContactingSeller ? "Opening chat..." : "Contact Seller"}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Reviews Section */}
<div className="border-t border-border pt-6 space-y-4">
  <h2 className="font-display text-lg font-semibold text-ink">Reviews</h2>

  {!currentUser ? (
    <div className="bg-surface-muted border border-border rounded-lg p-4 text-sm text-ink-muted">
      <button
        onClick={() => setShowAuthModal(true)}
        className="text-accent font-medium hover:underline cursor-pointer"
      >
        Log in
      </button>{" "}
      to see and write reviews for this product.
    </div>
  ) : (
    <>
      {/* Write / Update Review */}
      <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-ink">
          {myReview ? "Update your review" : "Write a review"}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setReviewRating(star)}
              className="cursor-pointer"
            >
              <Star
                size={20}
                className={star <= (reviewRating || myReview?.rating || 0) ? "fill-brand text-brand" : "text-ink-muted"}
              />
            </button>
          ))}
        </div>
        <textarea
          value={reviewComment || myReview?.comment || ""}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={3}
          className="w-full text-sm border border-border rounded-md p-2 bg-background text-ink resize-none focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSubmitReview}
            disabled={isSubmittingReview || !reviewRating}
            className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
          >
            {isSubmittingReview ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
          </button>
          {myReview && (
            <button
              onClick={handleDeleteReview}
              disabled={isDeletingReview}
              className="flex items-center gap-1 text-sm text-danger px-3 py-2 rounded-md border border-border hover:bg-surface-muted disabled:opacity-50 cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Review List */}
      {isLoadingReviews ? (
        <LoadingSkeleton type="card" count={2} />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-ink-muted">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="border border-border rounded-lg p-3 bg-surface">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{review.user?.name || "Anonymous"}</span>
                <RatingStars rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-sm text-ink-muted mt-1">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )}
</div>
      </div>
      
      
      <AuthPromptModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
    </>
  );
}