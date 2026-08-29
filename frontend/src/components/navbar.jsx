import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  UserRound,
  Store,
  Package,
  ClipboardList,
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  CalendarDays,
  Menu,
  X,
} from "lucide-react";
import { clearUser } from "../redux/userSlice/userSlice.js";
import { useGetCart } from "../api/cart.js";

// Role-based secondary navigation, defined once so the desktop bar and the
// mobile sidebar always stay in sync.
const NAV_LINKS_BY_ROLE = {
  admin: [
    { to: "/admin", icon: LayoutDashboard, label: "Admin Dashboard" },
    { to: "/admin/stores", icon: Store, label: "Stores Moderation" },
    { to: "/admin/products", icon: Package, label: "Products Moderation" },
    { to: "/admin/orders", icon: Package, label: "Orders Management" },
    { to: "/admin/users", icon: Package, label: "Users Management" },
  ],
  seller: [
    { to: "/seller", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/seller/stores", icon: Store, label: "My Stores" },
    { to: "/seller/products", icon: Package, label: "My Products" },
    { to: "/seller/orders", icon: ShoppingBag, label: "My Orders" },
    { to: "/seller/messages", icon: MessageCircle, label: "Conversations" },
    { to: "/seller/events", icon: CalendarDays, label: "Events Management" },
  ],
  user: [
    { to: "/products", icon: ShoppingBag, label: "All Products" },
    { to: "/stores", icon: Store, label: "Stores" },
    { to: "/orders", icon: ClipboardList, label: "My Orders" },
    { to: "/messages", icon: MessageCircle, label: "Conversations" },
  ],
};

export default function Navbar() {
  const currentUser = useSelector((state) => {
    return state.user?.currentUser?.data;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const menuRef = useRef(null);

  const { data: cartRes } = useGetCart(!!currentUser);
  const cartItems = cartRes?.data || [];
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const role = currentUser?.role || "user";

  const navLinks = NAV_LINKS_BY_ROLE[role] || NAV_LINKS_BY_ROLE.user;
  // Wishlist / cart are shopping-only affordances — admins and sellers don't need them.
  const showShoppingIcons = role === "user";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll while the mobile sidebar is open.
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    dispatch(clearUser());
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchKeyword.trim();
    if (trimmed) {
      navigate(`/search?keyword=${encodeURIComponent(trimmed)}`);
      setMobileNavOpen(false);
    }
  };
  const homeUrl = role === "admin" ? "/admin" : role === "seller" ? "/seller" : "/";

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40 font-sans">
      {/* Main Bar */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center gap-3 md:gap-8">
        <Link to={homeUrl} className="font-display font-semibold text-ink text-2xl tracking-tight shrink-0">
          ecom
        </Link>

        {/* Universal Search Form — shopping-side only */}
        {showShoppingIcons && (
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
        )}

        {!showShoppingIcons && <div className="flex-1" />}

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          {showShoppingIcons && (
            <>
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
            </>
          )}

          {currentUser ? (
            <div className="relative hidden sm:block" ref={menuRef}>
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
            <Link
              to="/login"
              className="hidden sm:flex h-10 items-center bg-accent text-white rounded-md px-4 text-sm font-medium"
            >
              Sign in
            </Link>
          )}

          {/* Hamburger — mobile only, opens the sidebar with nav links + account actions */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            className="sm:hidden text-ink hover:text-accent cursor-pointer"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Secondary Bar - Dynamic by Role (desktop only, refined segmented style) */}
      <div className="hidden md:block border-t border-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-2 overflow-x-auto">
          <nav className="inline-flex items-center gap-1 bg-surface-muted/60 rounded-full p-1 whitespace-nowrap">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin" || to === "/seller"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-surface text-ink shadow-sm border border-border"
                      : "text-ink-muted hover:text-ink hover:bg-surface/70"
                  }`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-xs bg-background border-l border-border shadow-[0_0_24px_rgba(28,2,33,0.12)] flex flex-col">
            <div className="h-16 px-4 flex items-center justify-between border-b border-border shrink-0">
              <span className="font-display font-semibold text-ink text-xl tracking-tight">ecom</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {currentUser && (
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-surface-muted flex items-center justify-center shrink-0">
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
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-ink-muted capitalize">{role} Account</p>
                  </div>
                </div>
              )}

              {showShoppingIcons && (
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-ink border border-border rounded-md py-2 hover:bg-surface-muted"
                  >
                    <Heart size={16} strokeWidth={1.5} /> Wishlist
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileNavOpen(false)}
                    className="relative flex-1 flex items-center justify-center gap-2 text-sm font-medium text-ink border border-border rounded-md py-2 hover:bg-surface-muted"
                  >
                    <ShoppingCart size={16} strokeWidth={1.5} /> Cart
                    {totalCartItems > 0 && (
                      <span className="bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalCartItems}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              <nav className="flex flex-col py-2">
                {navLinks.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/admin" || to === "/seller"}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 text-sm font-medium ${
                        isActive ? "text-accent-text bg-accent-soft" : "text-ink hover:bg-surface-muted"
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="border-t border-border p-3 shrink-0">
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileNavOpen(false)}
                    className="block w-full text-left px-3.5 py-2.5 rounded-md text-sm text-ink hover:bg-surface-muted"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2.5 rounded-md text-sm text-danger-text hover:bg-danger-soft transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-10 items-center justify-center bg-accent text-white rounded-md px-4 text-sm font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}