import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateEvent } from "../../api/events.js";
import { Tag, Percent, Loader2, ArrowLeft } from "lucide-react";
import { useGetStoreProducts } from "../../api/product.js";

export default function CreateEventPage() {
  const { storeId } = useParams();
  const navigate = useNavigate();

    const { data, isLoading: isLoadingProducts } = useGetStoreProducts(storeId);
    // console.log(data)
  const products = data?.data || [];
  const createEventMutation = useCreateEvent();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedProduct = products.find((p) => p._id === selectedProductId);
  const basePrice = selectedProduct?.originalPrice || selectedProduct?.discountPrice || 0;
  
  const previewDiscountPrice =
    basePrice && discountPercentage
      ? (basePrice * (1 - Number(discountPercentage) / 100)).toFixed(2)
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedProductId || !discountPercentage || !startDate || !endDate) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    createEventMutation.mutate(
      {
        productId: selectedProductId,
        storeId,
        discountPercentage: Number(discountPercentage),
        startDate,
        endDate,
      },
      {
        onSuccess: () => navigate(`/seller/events`),
        onError: (err) => setErrorMsg(err.response?.data?.message || "Failed to create event."),
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 mb-6 cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Events
      </button>

      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-6">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink flex items-center gap-2">
            <Tag size={20} className="text-accent" /> Launch Flash Sale Event
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Pick a product from your inventory to run a promotional sale.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Select Product *
            </label>
            {isLoadingProducts ? (
              <div className="h-10 flex items-center justify-center border border-border rounded-md text-xs text-ink-muted">
                <Loader2 size={16} className="animate-spin mr-2" /> Loading store products...
              </div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
              >
                <option value="">-- Choose a Product --</option>
                {products.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name} (${prod.originalPrice || prod.discountPrice})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Discount Percentage (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="99"
                placeholder="e.g. 25"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-background border border-border rounded-md text-sm text-ink outline-none focus:border-accent"
              />
              <Percent size={15} className="absolute left-3 top-3 text-ink-muted" />
            </div>
            {previewDiscountPrice && (
              <p className="text-xs text-accent font-medium mt-1.5">
                Computed Sale Price: <span className="font-bold">${previewDiscountPrice}</span> (Original: ${basePrice})
              </p>
            )}
          </div>

          {/* Start and End Date inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-xs text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-xs text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 px-5 text-xs font-medium text-ink bg-surface border border-border rounded-md hover:bg-surface-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEventMutation.isPending}
              className="h-10 px-5 text-xs font-medium text-white bg-accent rounded-md hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createEventMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}