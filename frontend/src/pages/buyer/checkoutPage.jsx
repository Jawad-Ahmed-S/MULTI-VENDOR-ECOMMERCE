import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGetCart } from "../../api/cart";
import { useCreateOrder } from "../../api/order";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { MapPin, CreditCard, ShoppingBag, ArrowRight } from "lucide-react";
import api from "../../api/axiosInstance";
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartRes, isLoading: isCartLoading } = useGetCart();
  const { mutate: createOrder, isPending: isPlacingOrder } = useCreateOrder();

  const cartItems = cartRes?.data || [];

  // Form State
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    zipCode: "",
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.discountPrice || item.product?.originalPrice || 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingPrice = subtotal > 1000 ? 0 : 150;
  const totalPrice = subtotal + shippingPrice;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };
const handleSubmitOrder = async (e) => {
  e.preventDefault();

  if (paymentMethod === "COD") {
    
    createOrder(
      { shippingAddress, paymentMethod: "COD" },
      { onSuccess: (res) => navigate(`/order/${res.data._id}`) }
    );
  } else if (paymentMethod === "Stripe") {
    try {
      
      const response = await api.post("/payment/create-checkout-session", {
        shippingAddress,
      });

      
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Session Error:", error);
    }
  }
};
  if (isCartLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
        <LoadingSkeleton type="card" count={2} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center font-sans space-y-4">
        <h2 className="font-display font-semibold text-xl text-ink">Your cart is empty</h2>
        <p className="text-xs text-ink-muted">Add items to your cart before proceeding to checkout.</p>
        <Link to="/products">
          <button className="bg-accent text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-accent/90 transition-colors cursor-pointer">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 font-sans">
      <Breadcrumbs items={[{ label: "Cart", link: "/cart" }, { label: "Checkout" }]} />

      <h1 className="font-display font-semibold text-2xl text-ink">Checkout</h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display font-semibold text-base text-ink flex items-center gap-2 border-b border-border pb-3">
              <MapPin size={18} className="text-brand" /> 1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Kashan Ahmed"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:border-accent text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 03001234567"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:border-accent text-ink"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-ink">Street Address</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="House/Apartment #, Street name, Area"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:border-accent text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Karachi"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:border-accent text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-ink">Zip / Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  placeholder="e.g. 75500"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 text-xs bg-background border border-border rounded-md focus:outline-none focus:border-accent text-ink"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <h2 className="font-display font-semibold text-base text-ink flex items-center gap-2 border-b border-border pb-3">
              <CreditCard size={18} className="text-brand" /> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cash on Delivery Option */}
              <label
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 border rounded-lg flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-accent bg-accent-soft/30"
                    : "border-border hover:border-border-strong bg-background"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 accent-accent"
                />
                <div>
                  <h4 className="font-medium text-xs text-ink">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Pay with cash when your parcel is delivered.</p>
                </div>
              </label>

              {/* Stripe Credit Card Option */}
              <label
                onClick={() => setPaymentMethod("Stripe")}
                className={`p-4 border rounded-lg flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === "Stripe"
                    ? "border-accent bg-accent-soft/30"
                    : "border-border hover:border-border-strong bg-background"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Stripe"
                  checked={paymentMethod === "Stripe"}
                  onChange={() => setPaymentMethod("Stripe")}
                  className="mt-1 accent-accent"
                />
                <div>
                  <h4 className="font-medium text-xs text-ink">Credit / Debit Card</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Pay securely via Stripe (Card).</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Sidebar */}
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4 sticky top-6">
          <h3 className="font-display font-semibold text-base text-ink border-b border-border pb-3 flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand" /> Items Summary
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const prod = item.product;
              if (!prod) return null;
              const price = prod.discountPrice || prod.originalPrice;

              return (
                <div key={item._id || prod._id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 line-clamp-1">
                    <span className="font-medium text-ink">{prod.name}</span>
                    <span className="text-ink-muted">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-ink">${(price * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span className="font-medium text-ink">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Shipping Fee</span>
              <span className="font-medium text-ink">${shippingPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold text-ink">
              <span>Total Amount</span>
              <span className="text-brand">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPlacingOrder}
            className="w-full h-11 bg-accent text-white text-xs font-medium rounded-md flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPlacingOrder ? "Placing Order..." : "Confirm & Place Order"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}