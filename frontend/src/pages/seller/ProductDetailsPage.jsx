import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetMyProduct, useUpdateProduct, useDeleteProduct } from "../../api/product.js";
import { Package, Save, Trash2, Plus, Minus, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data: productRes, isLoading } = useGetMyProduct(productId);
  const { mutate: updateProduct, isLoading: isUpdating } = useUpdateProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  const product = productRes?.data || productRes;

  const [prevProductId, setPrevProductId] = useState(null);
  const [imagesList, setImagesList] = useState([]); 
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    originalPrice: 0,
    discountPrice: 0,
    stock: 0,
  });

  if (product && product._id !== prevProductId) {
    setPrevProductId(product._id);
    const existingImages = Array.isArray(product.images)
      ? product.images.map((img) =>
          typeof img === "object"
            ? { url: img.url || "", public_id: img.public_id || "", isExisting: true }
            : { url: img, public_id: "", isExisting: true }
        )
      : [];

    setImagesList(existingImages);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      originalPrice: product.originalPrice || 0,
      discountPrice: product.discountPrice || 0,
      stock: product.stock || 0,
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStockAdjust = (delta) => {
    setFormData((prev) => ({
      ...prev,
      stock: Math.max(0, Number(prev.stock) + delta),
    }));
  };

  // Multi-Image Upload via file input
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImagesList((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= imagesList.length) return;
    setImagesList((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("originalPrice", formData.originalPrice);
    payload.append("discountPrice", formData.discountPrice);
    payload.append("stock", formData.stock);

    // Keep track of existing images to preserve
    const existingImages = imagesList
      .filter((img) => img.isExisting)
      .map((img) => ({ url: img.url, public_id: img.public_id }));

    payload.append("existingImages", JSON.stringify(existingImages));

    // Append new binary files to FormData
    imagesList.forEach((img) => {
      if (!img.isExisting && img.file) {
        payload.append("images", img.file);
      }
    });

    updateProduct({ productId, productData: payload });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId, {
        onSuccess: () => navigate("/seller/products"),
      });
    }
  };

  if (isLoading) return <div className="p-6 text-sm text-ink-muted text-center font-sans">Loading product details...</div>;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 font-sans px-4 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-brand font-medium hover:text-accent transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </button>

      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{product?.name}</h1>
          <p className="text-sm text-ink-muted mt-0.5">Edit inventory, gallery images, and product details.</p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-danger border border-danger/20 hover:bg-danger-soft px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Stock & Image Gallery */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-border rounded-lg p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-brand" /> Quick Stock Control
            </h3>
            <div className="flex items-center justify-between bg-surface-muted/60 p-3 rounded-md border border-border">
              <button
                type="button"
                onClick={() => handleStockAdjust(-1)}
                className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center hover:bg-border-strong text-ink transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display font-semibold text-xl text-ink">{formData.stock}</span>
              <button
                type="button"
                onClick={() => handleStockAdjust(1)}
                className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center hover:bg-border-strong text-ink transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-ink-muted">Adjust units in stock. Click Save Changes to commit.</p>
          </div>

          {/* Gallery Management */}
          <div className="bg-surface border border-border rounded-lg p-5 space-y-4">
            <h3 className="font-display text-sm font-semibold text-ink flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand" /> Product Gallery ({imagesList.length})
            </h3>

            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-md text-xs font-medium text-brand hover:border-accent hover:bg-surface-muted/50 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Upload New File(s)</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {imagesList.map((img, idx) => {
                const displaySrc = img.isExisting ? img.url : img.previewUrl;
                return (
                  <div key={img.public_id || idx} className="flex items-center gap-3 p-2 bg-surface-muted/40 border border-border rounded-md">
                    <img src={displaySrc} alt={`Product ${idx}`} className="w-12 h-12 object-cover rounded bg-surface-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-brand font-medium truncate block">Image {idx + 1}</span>
                      {idx === 0 && <span className="text-[10px] bg-accent-soft text-accent-text px-1.5 py-0.5 rounded">Primary</span>}
                      {!img.isExisting && <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded ml-1">New</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, idx - 1)}
                          className="p-1 hover:bg-border rounded text-ink-muted text-xs cursor-pointer"
                          title="Move Up"
                        >
                          ↑
                        </button>
                      )}
                      {idx < imagesList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, idx + 1)}
                          className="p-1 hover:bg-border rounded text-ink-muted text-xs cursor-pointer"
                          title="Move Down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 hover:bg-danger-soft text-danger rounded cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {imagesList.length === 0 && (
                <div className="text-center py-6 text-xs text-ink-muted border border-dashed border-border rounded-md">
                  No images uploaded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Product Details Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand mb-1">Product Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand mb-1">Stock Count</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand mb-1">Original Price ($)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand mb-1">Discount Price ($)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand mb-1">Description</label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-surface border border-border rounded-md text-sm text-ink focus:border-accent focus:ring-1 focus:ring-accent-soft outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isUpdating ? "Saving Changes..." : "Save Product Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}