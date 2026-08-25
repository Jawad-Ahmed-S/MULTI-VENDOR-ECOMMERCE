import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import { useCreateStore } from "../../api/store.js";

export default function CreateStorePage() {
  const navigate = useNavigate();
  const createStoreMutation = useCreateStore();

  const [bannerFile, setBannerFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBannerChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setBannerFile(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("email", formData.email);
    data.append("phone", formData.phone);

    // Format address object matching Mongoose Schema
    const addressObject = {
      address: formData.address,
      city: formData.city,
      country: formData.country,
      zipCode: formData.zipCode,
    };
    data.append("address", JSON.stringify(addressObject));

    if (bannerFile) {
      data.append("image", bannerFile);
    }

    createStoreMutation.mutate(data, {
      onSuccess: () => navigate("/seller/stores"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface border border-border rounded-lg p-6 font-sans">
      <h1 className="font-display font-semibold text-2xl text-ink mb-1">Create Store</h1>
      <p className="text-ink-muted text-sm mb-6">Set up a storefront to publish products.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-brand mb-1">Store Name</label>
          <input
            name="name"
            placeholder="e.g. Acme Tech Store"
            onChange={handleChange}
            required
            className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            placeholder="Tell customers about your store..."
            onChange={handleChange}
            required
            className="w-full p-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="store@example.com"
              onChange={handleChange}
              required
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Phone</label>
            <input
              name="phone"
              placeholder="+1234567890"
              onChange={handleChange}
              required
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Address Fields Matching Schema */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Street Address</label>
            <input
              name="address"
              placeholder="123 Main St"
              onChange={handleChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">City</label>
            <input
              name="city"
              placeholder="Karachi"
              onChange={handleChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Country</label>
            <input
              name="country"
              placeholder="Pakistan"
              onChange={handleChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand mb-1">Zip Code</label>
            <input
              name="zipCode"
              placeholder="75500"
              onChange={handleChange}
              className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Banner Upload Area */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-brand">Store Banner Image</label>
          <div className="relative border-2 border-dashed border-border hover:border-accent/50 bg-background rounded-lg p-5 text-center transition-colors cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-1">
              <UploadCloud className="w-6 h-6 text-brand group-hover:text-accent transition-colors" />
              <div className="text-xs text-ink-muted">
                <span className="font-semibold text-accent">Click to upload banner</span> or drag and drop
              </div>
              <span className="text-[10px] text-ink-muted">PNG, JPG, WEBP up to 5MB</span>
            </div>
          </div>

          {bannerFile && (
            <div className="relative border border-border rounded-md overflow-hidden bg-surface h-24 mt-2">
              <img
                src={URL.createObjectURL(bannerFile)}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setBannerFile(null)}
                className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={createStoreMutation.isPending}
          className="w-full h-10 bg-accent text-white rounded-md text-sm font-medium hover:opacity-95 transition-opacity mt-4 cursor-pointer disabled:opacity-50"
        >
          {createStoreMutation.isPending ? "Creating Store..." : "Create Store"}
        </button>
      </form>
    </div>
  );
}