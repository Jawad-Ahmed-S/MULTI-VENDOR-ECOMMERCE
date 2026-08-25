import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import BuyerLayout from "./pages/buyer/layout.jsx"
import SellerLayout from "./pages/seller/layout.jsx"
import AdminLayout from "./pages/admin/layout.jsx"

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
// import Wishlist from "./pages/Wishlist.jsx"
// import Cart from "./pages/Cart.jsx"


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/stores" element={<StoreDirectory />} />
          {/* <Route path="/store/:id" element={<StorePage />} /> */}
          {/* <Route path="/wishlist" element={<Wishlist />} />*/}
          <Route path="/cart" element={<CartPage />} /> 
          <Route path="/orders" element={<MyOrdersPage />} /> 
          <Route path="/checkout" element={<CheckoutPage />} /> 
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} /> 
          <Route path="/order/:orderId" element={<OrderDetailPage />} /> 
        </Route>

        
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
        </Route>

        
        <Route element={<AdminLayout />}>
          <Route path='/admin' element={<AdminDashboardPage />} />
          <Route path='/admin/orders' element={<AdminAllOrdersPage />} />
          <Route path='/admin/stores' element={<AdminStoresPage />} />
          <Route path='/admin/products' element={<AdminProductsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}