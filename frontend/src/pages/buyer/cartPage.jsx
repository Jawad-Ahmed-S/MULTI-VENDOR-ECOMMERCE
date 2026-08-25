import { Link } from "react-router-dom";
import {
  useGetCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
} from "../../api/cart";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import EmptyState from "../../components/common/EmptyState";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { data: cartRes, isLoading } = useGetCart();
  const { mutate: updateQuantity } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const { mutate: clearCart } = useClearCart();

  const cartItems = cartRes?.data || [];

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.discountPrice || item.product?.originalPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 font-sans">
        <EmptyState
          title="Your Cart is Empty"
          message="Looks like you haven't added anything to your cart yet."
        />
        <div className="text-center mt-4">
          <Link to="/products">
            <button className="bg-accent text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-accent/90 transition-colors cursor-pointer">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="font-display font-semibold text-2xl text-ink flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand" /> Shopping Cart
        </h1>
        <button
          onClick={() => clearCart()}
          className="text-xs text-danger-text hover:underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item Stream */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            const firstImg = prod.images?.[0];
            const imgSrc = typeof firstImg === "object" ? firstImg?.url : firstImg;
            const price = prod.discountPrice || prod.originalPrice;

            return (
              <div
                key={item._id || prod._id}
                className="bg-surface border border-border rounded-lg p-4 flex gap-4 items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-surface-muted border border-border overflow-hidden shrink-0">
                    {imgSrc ? (
                      <img src={imgSrc} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-muted text-[10px]">No Image</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm text-ink line-clamp-1">{prod.name}</h3>
                    <p className="text-xs text-brand font-semibold">${price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Actions */}
                  <div className="flex items-center border border-border rounded-md bg-background">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity({ productId: prod._id, quantity: item.quantity - 1 })}
                      className="p-1 text-ink-muted hover:text-ink disabled:opacity-30 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 text-xs font-medium text-ink">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity({ productId: prod._id, quantity: item.quantity + 1 })}
                      className="p-1 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(prod._id)}
                    className="text-ink-muted hover:text-danger-text p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 h-fit">
          <h2 className="font-display text-base font-semibold text-ink border-b border-border pb-3">Order Summary</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Estimated Shipping</span>
              <span className="text-accent font-medium">Free</span>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-display text-base font-semibold text-ink">
            <span>Total</span>
            <span className="text-brand">${subtotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="block pt-2">
            <button className="w-full h-10 bg-accent text-white font-medium text-xs rounded-md flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer">
              Proceed to Checkout <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}