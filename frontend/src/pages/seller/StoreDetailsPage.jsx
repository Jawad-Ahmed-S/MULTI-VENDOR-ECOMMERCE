import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetMyStore, useUpdateStore } from "../../api/store.js";
import { useGetStoreProducts, useDeleteProduct } from "../../api/product.js";
import ProductTable from "../../components/seller/ProductTable.jsx";
import { Store, PlusCircle, Save, Upload, ShoppingBag, Lock, Unlock, BarChart3 } from "lucide-react";

export default function StoreDetailsPage() {
  const { storeId } = useParams();
  const { data: storeRes, isLoading: storeLoading } = useGetMyStore(storeId);
  const { data: productsRes, isLoading: productsLoading } = useGetStoreProducts(storeId);
  const { mutate: updateStore, isLoading: isUpdating } = useUpdateStore();
  const { mutate: deleteProduct } = useDeleteProduct();

  const store = storeRes?.data || storeRes;
  const products = productsRes?.data || productsRes || [];

  const [prevStoreId, setPrevStoreId] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });

  if (store && store._id !== prevStoreId) {
    setPrevStoreId(store._id);
    const existingBanner = typeof store.banner === "object" ? store.banner?.url : store.banner;
    setBannerPreview(existingBanner || "");

    const addrObj = typeof store.address === "object" && store.address !== null ? store.address : {};

    setFormData({
      name: store.name || "",
      description: store.description || "",
      phone: store.phone || "",
      email: store.email || "",
      address: addrObj.address || (typeof store.address === "string" ? store.address : ""),
      city: addrObj.city || "",
      country: addrObj.country || "",
      zipCode: addrObj.zipCode || "",
    });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("phone", formData.phone);
    payload.append("email", formData.email);

    const addressObject = {
      address: formData.address,
      city: formData.city,
      country: formData.country,
      zipCode: formData.zipCode,
    };
    payload.append("address", JSON.stringify(addressObject));

    if (bannerFile) {
      payload.append("image", bannerFile);
    }

    updateStore(
      { storeId, storeData: payload },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId);
    }
  };

  if (storeLoading)
    return <div className="p-6 text-sm text-ink-muted text-center font-sans">Loading store details...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 font-sans px-4 sm:px-6">
      
      <div className="bg-surface border border-border rounded-lg overflow-hidden font-sans">
        <div className="h-44 bg-surface-muted relative">
          {bannerPreview ? (
            <img src={bannerPreview} alt={store?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-ink-muted text-sm">No Banner Uploaded</div>
          )}
        </div>

        <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{store?.name}</h1>
            <p className="text-sm text-ink-muted mt-0.5">Manage store information, orders, and catalog.</p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Secondary Action: Add Product */}
            <Link to={`/seller/store/${storeId}/product/create`}>
              <button className="flex items-center gap-2 bg-surface border border-border text-ink hover:bg-surface-muted rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
                <PlusCircle className="w-4 h-4 text-brand" />
                Add Product
              </button>
            </Link>

            {/* Secondary Action: View Performance */}
            <Link to={`/seller/store/${storeId}/performance`}>
              <button className="flex items-center gap-2 bg-surface border border-border text-ink hover:bg-surface-muted rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
                <BarChart3 className="w-4 h-4 text-brand" />
                View Performance
              </button>
            </Link>

            {/* Primary Action: Manage Orders */}
            <Link to={`/seller/store/${storeId}/orders`}>
              <button className="flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer">
                <ShoppingBag className="w-4 h-4" />
                Manage Orders
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Store Information Form with Lock & Blur Toggle */}
      <form onSubmit={handleUpdate} className="bg-surface border border-border rounded-lg p-6 space-y-6 relative">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
            <Store className="w-5 h-5 text-brand" />
            Store Information
          </h2>

          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-surface-muted transition-colors cursor-pointer text-ink"
          >
            {isEditing ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-accent" /> Lock Form
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-brand" /> Edit Store Settings
              </>
            )}
          </button>
        </div>

        {/* Blur Wrapper */}
        <div className="relative">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${
              !isEditing ? "blur-xs pointer-events-none select-none" : ""
            }`}
          >
            <div>
              <label className="block text-xs font-medium text-brand mb-1">Store Name</label>
              <input
                type="text"
                name="name"
                disabled={!isEditing}
                value={formData.name}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Upload Store Banner</label>
              <label
                className={`flex items-center gap-2 px-3 py-2 bg-surface-muted border border-border rounded-md text-xs font-medium text-ink transition-colors w-full h-10 ${
                  isEditing ? "cursor-pointer hover:bg-border" : "cursor-not-allowed opacity-70"
                }`}
              >
                <Upload className="w-4 h-4 text-brand shrink-0" />
                <span className="truncate">{bannerFile ? bannerFile.name : "Choose Banner File..."}</span>
                <input type="file" accept="image/*" disabled={!isEditing} onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Email</label>
              <input
                type="email"
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                disabled={!isEditing}
                value={formData.address}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">City</label>
              <input
                type="text"
                name="city"
                disabled={!isEditing}
                value={formData.city}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Country</label>
              <input
                type="text"
                name="country"
                disabled={!isEditing}
                value={formData.country}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                disabled={!isEditing}
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-brand mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                disabled={!isEditing}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none disabled:bg-surface-muted/50"
              />
            </div>
          </div>

          {/* Centered Unlock Button Overlay when Locked */}
          {!isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/20 backdrop-blur-[1px] rounded-md">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-surface/90 border border-border text-ink font-medium text-xs px-4 py-2 rounded-md shadow-xs hover:bg-surface-muted flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-brand" /> Unlock Store Settings to Edit
              </button>
            </div>
          )}
        </div>

        {/* Save Button (Only Active when Unlocked) */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? "Saving..." : "Save Store Changes"}
            </button>
          </div>
        )}
      </form>

      {/* Associated Products Table */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-ink">Associated Products</h2>
        {productsLoading ? (
          <div className="text-sm text-ink-muted">Loading products...</div>
        ) : (
          <ProductTable products={products} onDelete={handleDeleteProduct} />
        )}
      </div>
    </div>
  );
}