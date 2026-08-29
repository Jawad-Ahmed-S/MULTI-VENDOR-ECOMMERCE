import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import Login from "./pages/login.jsx"
import Register from "./pages/register.jsx"
import BuyerLayout from "./pages/buyer/layout.jsx"
import SellerLayout from "./pages/seller/layout.jsx"
import AdminLayout from "./pages/admin/layout.jsx"
import NotFound from "./pages/NotFound.jsx"

// Buyer pages
import Home from "./pages/buyer/home.jsx"
import CategoryPage from "./pages/buyer/CategoryPage.jsx"
import ProductDetail from "./pages/buyer/ProductDetail.jsx"
import ProductListing from "./pages/buyer/ProductListing.jsx"
import SearchResults from "./pages/buyer/SearchResults.jsx"
import StoreDirectory from "./pages/buyer/StoreDirectory.jsx"
import SellerDashboard from "./pages/seller/SellerDashboard.jsx"
import MyStoresPage from "./pages/seller/MyStoresPage.jsx"
import MyProductsPage from "./pages/seller/MyProductsPage.jsx"
import CreateStorePage from "./pages/seller/CreateStorePage.jsx"
import CreateProductPage from "./pages/seller/CreateProductPage.jsx"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx"
import AdminStoresPage from "./pages/admin/AdminStoresPage.jsx"
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx"
import ProductDetailsPage from "./pages/seller/ProductDetailsPage.jsx"
import StoreDetailsPage from "./pages/seller/StoreDetailsPage.jsx"
import CartPage from "./pages/buyer/cartPage.jsx"
import CheckoutPage from "./pages/buyer/checkoutPage.jsx"
import OrderDetailPage from "./pages/buyer/orderDetails.jsx"
import MyOrdersPage from "./pages/buyer/ordersPage.jsx"
import SellerStoreOrdersPage from "./pages/seller/SellerStoreOrdersPage.jsx"
import AdminAllOrdersPage from "./pages/admin/AdminAllOrdersPage.jsx"
import SellerAllOrdersPage from "./pages/seller/SellerAllOrdersPage.jsx"
import CheckoutSuccessPage from "./pages/buyer/CheckoutSuccessPage.jsx"
import MessagesPage from "./pages/messagesPage.jsx"
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx"
import WishlistPage from "./pages/buyer/wishlistPage.jsx"
import StorePage from "./pages/buyer/StorePage.jsx"
import CreateEventPage from "./pages/seller/createEventPage.jsx"
import StoreEventsPage from "./pages/seller/storeEventsPage.jsx"
import ActivationSuccess from "./pages/ActivationSucess.jsx"
import UserDetailsPage from "./pages/UserDetailsPage.jsx"

// Maps each role to the base URL it should land on / be redirected to.
const HOME_BY_ROLE = {
  admin: "/admin",
  seller: "/seller",
  user: "/",
};

// Guards a group of routes behind a set of allowed roles.
// If the current user's role isn't allowed here, send them to their own
// section instead of letting them view (or dead-end on) someone else's pages.
function ProtectedRoute({ allowedRoles }) {
  const currentUser = useSelector((state) => state.user?.currentUser?.data);
  const role = currentUser?.role || "user";

  if (!allowedRoles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || "/"} replace />;
  }

  return <Outlet />;
}

export default function AppRouter() {
  const currentUser = useSelector((state) => state.user?.currentUser?.data);
  const role = currentUser?.role || "user";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/activation-success" element={<ActivationSuccess />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route element={<BuyerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<UserDetailsPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/stores" element={<StoreDirectory />} />
            <Route path="/store/:id" element={<StorePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/order/:orderId" element={<OrderDetailPage />} />
            {/* Only registered while the current user is on this side, so an
                unknown URL always resolves to this role's own 404, not a
                neighboring section's wildcard. */}
            {role === "user" && <Route path="*" element={<NotFound />} />}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
          <Route element={<SellerLayout />}>
            <Route path='/seller' element={<SellerDashboard />} />
            <Route path="/seller/stores" element={<MyStoresPage />} />
            <Route path="/seller/store/:storeId" element={<StoreDetailsPage />} />
            <Route path="/seller/products" element={<MyProductsPage />} />
            <Route path="/seller/product/:productId" element={<ProductDetailsPage />} />
            <Route path="/seller/store/create" element={<CreateStorePage />} />
            <Route path="/seller/store/:storeId/product/create" element={<CreateProductPage />} />
            <Route path="/seller/store/:storeId/orders" element={<SellerStoreOrdersPage />} />
            <Route path="/seller/orders" element={<SellerAllOrdersPage />} />
            <Route path="/seller/:storeId/events/create" element={<CreateEventPage />} />
            <Route path="/seller/events" element={<StoreEventsPage />} />
            <Route path="/seller/messages" element={<MessagesPage />} />
            {role === "seller" && <Route path="*" element={<NotFound />} />}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path='/admin' element={<AdminDashboardPage />} />
            <Route path='/admin/orders' element={<AdminAllOrdersPage />} />
            <Route path='/admin/stores' element={<AdminStoresPage />} />
            <Route path='/admin/products' element={<AdminProductsPage />} />
            <Route path='/admin/users' element={<AdminUsersPage />} />
            {role === "admin" && <Route path="*" element={<NotFound />} />}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}