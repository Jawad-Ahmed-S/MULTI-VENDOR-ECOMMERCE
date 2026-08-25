import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, Heart, ShoppingCart, ChevronDown, UserRound, Store, Package, LayoutDashboard, Boxes } from "lucide-react";
import { clearUser } from "../redux/userSlice/userSlice.js";
import { useGetCart } from "../api/cart.js";
export default function Navbar() {
  const currentUser = useSelector((state) => {
    return state.user.currentUser.data;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const menuRef = useRef(null);

  const { data: cartRes } = useGetCart(!!currentUser);
  const cartItems = cartRes?.data || [];
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const role = currentUser?.role || "user";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    dispatch(clearUser());
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchKeyword.trim();
    if (trimmed) {
      navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 font-sans">
      {/* Main Bar */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center gap-4 md:gap-8">
        <Link to="/" className="font-display font-semibold text-ink text-2xl tracking-tight shrink-0">
          ecom
        </Link>

        {/* Universal Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer bg-transparent border-none p-0 flex items-center justify-center"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search products, brands and vendors"
            className="w-full h-10 bg-background border border-border rounded-md pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
          />
        </form>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <Link to="/wishlist" aria-label="Wishlist" className="text-ink hover:text-accent">
            <Heart size={20} strokeWidth={1.5} />
          </Link>

          <Link to="/cart" className="relative text-ink hover:text-accent">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>

          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-1.5 cursor-pointer">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-surface-muted flex items-center justify-center">
                  {currentUser.avatar?.url || currentUser.avatar ? (
                    <img
                      src={currentUser.avatar?.url || currentUser.avatar}
                      alt={currentUser.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserRound size={18} strokeWidth={1.5} className="text-ink-muted" />
                  )}
                </div>
                <ChevronDown size={14} strokeWidth={2} className="text-ink-muted hidden md:block" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg py-1.5 shadow-[0_4px_16px_rgba(28,2,33,0.08)] z-50">
                  <div className="px-3.5 py-1.5 border-b border-border mb-1">
                    <p className="text-xs font-semibold text-ink">{currentUser.name}</p>
                    <p className="text-[10px] text-ink-muted capitalize">{role} Account</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left px-3.5 py-2 text-sm text-ink hover:bg-surface-muted"
                  >
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 text-sm text-danger-text hover:bg-danger-soft transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="h-10 flex items-center bg-accent text-white rounded-md px-4 text-sm font-medium">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Secondary Bar - Dynamic by Role */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-10 flex items-center gap-6 border-t border-border">
        {role === "admin" && (
          <>
            <Link to="/admin" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Admin Dashboard
            </Link>
            <Link to="/admin/stores" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <Store size={14} /> Stores Moderation
            </Link>
            <Link to="/admin/products" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <Package size={14} /> Products Moderation
            </Link>
            <Link to="/admin/orders" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <Package size={14} /> Orders Management
            </Link>
          </>
        )}

        {role === "seller" && (
          <>
            <Link to="/seller/dashboard" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link to="/seller/stores" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <Store size={14} /> My Stores
            </Link>
            <Link to="/seller/products" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <Package size={14} /> My Products
            </Link>
            <Link to="/seller/orders" className="text-brand text-[13px] hover:text-accent-text flex items-center gap-1.5">
              <Boxes size={14} /> My Orders
            </Link>
          </>
        )}

        {role === "user" && (
          <>
            <Link to="/products" className="text-brand text-[13px] hover:text-accent-text">All Products</Link>
            <Link to="/stores" className="text-brand text-[13px] hover:text-accent-text">Stores</Link>
            <Link to="/orders" className="text-brand text-[13px] hover:text-accent-text">My Orders</Link>
          </>
        )}
      </div>
    </header>
  );
}