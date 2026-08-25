import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import { useGetMyStores } from "../../api/store.js";
import { useCreateProduct } from "../../api/product.js";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlStoreId = searchParams.get("storeId");

  const { data: storesRes } = useGetMyStores();
  const createProductMutation = useCreateProduct();

  const stores = storesRes?.data || storesRes || [];
  const [selectedStoreId, setSelectedStoreId] = useState(urlStoreId || "");
  const activeStoreId = selectedStoreId || (Array.isArray(stores) && stores.length > 0 ? stores[0]._id : "");

  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setImageFiles((prev) => [...prev, ...selected].slice(0, 5));
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeStoreId) return;

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("originalPrice", formData.originalPrice);
    if (formData.discountPrice) data.append("discountPrice", formData.discountPrice);
    data.append("stock", formData.stock);

    if (formData.tags) {
      const tagsArray = formData.tags.split(",").map((t) => t.trim());
      data.append("tags", JSON.stringify(tagsArray));
    }

    imageFiles.forEach((file) => {
      data.append("images", file);
    });
    console.log("Data: ", Object.fromEntries(data.entries()));
    createProductMutation.mutate(
      { storeId: activeStoreId, productData: data },
      {
        onSuccess: () => navigate("/seller/products"),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface border border-border rounded-lg p-6 font-sans">
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Add Product</h1>
      <p className="text-ink-muted text-sm mb-6">List a new product item into one of your stores.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-brand mb-1">Target Store</label>
          <select
            value={activeStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            required
            className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
          >
            <option value="">-- Select Store --</option>
            {Array.isArray(stores) &&
              stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand mb-1">Product Title</label>
          <input
            name="name"
            placeholder="e.g. Wireless Ergonomic Mouse"
            onChange={handleChange}
            required
            className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            placeholder="Product details, specs, features..."
            onChange={handleChange}
            required
            className="w-full p-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Category</label>
            <input
              name="category"
              placeholder="Electronics, Apparel, etc."
              onChange={handleChange}
              required
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Tags (Comma Separated)</label>
            <input
              name="tags"
              placeholder="tech, wireless, office"
              onChange={handleChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Original Price ($)</label>
            <input
              name="originalPrice"
              type="number"
              placeholder="49"
              onChange={handleChange}
              required
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Discount Price ($)</label>
            <input
              name="discountPrice"
              type="number"
              placeholder="39"
              onChange={handleChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Stock Count</label>
            <input
              name="stock"
              type="number"
              placeholder="100"
              onChange={handleChange}
              required
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Inline Multi-Image Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand">Product Images (Up to 5)</label>
          <div className="relative border-2 border-dashed border-border hover:border-accent/50 bg-background rounded-lg p-5 text-center transition-colors cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-1">
              <UploadCloud className="w-6 h-6 text-brand group-hover:text-accent transition-colors" />
              <div className="text-xs text-ink-muted">
                <span className="font-semibold text-accent">Click to upload images</span> or drag and drop
              </div>
              <span className="text-[10px] text-ink-muted">PNG, JPG, WEBP up to 5MB each</span>
            </div>
          </div>

          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
              {imageFiles.map((file, idx) => (
                <div key={idx} className="relative group border border-border rounded-md overflow-hidden bg-surface h-20">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`upload-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={createProductMutation.isPending}
          className="w-full h-10 bg-accent text-white rounded-md text-sm font-medium hover:opacity-95 transition-opacity mt-4 cursor-pointer disabled:opacity-50"
        >
          {createProductMutation.isPending ? "Uploading & Creating..." : "Submit Product Listing"}
        </button>
      </form>
    </div>
  );
}