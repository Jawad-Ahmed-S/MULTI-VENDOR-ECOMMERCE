// FilterSidebar.jsx
import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";

// Default e-commerce category list used as a fallback
const DEFAULT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Grocery",
  "Sports",
  "Toys",
  "Books",
];

export default function FilterSidebar({
  categories = DEFAULT_CATEGORIES,
  selectedCategory = "",
  onSelectCategory,
  searchQuery = "",
  onSearchChange,
  minPrice,
  maxPrice,
  onPriceApply,
  activeSale = false,
  onActiveSaleChange,
  onReset,
}) {
  // If no categories passed or empty array, fall back to default list
  const categoryList = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // Local draft values so typing doesn't fire a network request on every keystroke
  const [minDraft, setMinDraft] = useState(minPrice ?? "");
  const [maxDraft, setMaxDraft] = useState(maxPrice ?? "");

  // Keep drafts in sync when filters change externally (e.g. Reset or direct URL changes)
  const [prevMin, setPrevMin] = useState(minPrice);
  const [prevMax, setPrevMax] = useState(maxPrice);
  if (minPrice !== prevMin || maxPrice !== prevMax) {
    setPrevMin(minPrice);
    setPrevMax(maxPrice);
    setMinDraft(minPrice ?? "");
    setMaxDraft(maxPrice ?? "");
  }

  const applyPrice = () => {
    const min = minDraft === "" ? null : Number(minDraft);
    const max = maxDraft === "" ? null : Number(maxDraft);
    if (min !== null && max !== null && min > max) {
      // Auto-swap min/max if invalid range entered
      onPriceApply(max, min);
      setMinDraft(max);
      setMaxDraft(min);
      return;
    }
    onPriceApply(min, max);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") applyPrice();
  };

  // Helper for case-insensitive active state comparison
  const isSelected = (catName) => {
    if (!selectedCategory && !catName) return true;
    return selectedCategory?.toLowerCase() === catName?.toLowerCase();
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-5 space-y-6 font-sans">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center border-b border-border pb-3">
        <h3 className="font-display text-sm font-semibold text-ink">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs text-ink-muted hover:text-danger flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} /> Reset All
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full h-9 pl-8 pr-3 bg-background border border-border rounded-md text-xs text-ink outline-none focus:border-accent"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-ink-muted" />
        </div>
      </div>

      {/* Category List */}
      <div>
        <h4 className="font-display text-xs font-semibold text-ink uppercase tracking-wider mb-3">
          Categories
        </h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {/* All Categories Reset Button */}
          <button
            onClick={() => onSelectCategory("")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              isSelected("")
                ? "bg-accent-soft text-accent-text font-medium"
                : "text-ink hover:bg-surface-muted"
            }`}
          >
            All Categories
          </button>

          {/* Individual Category Items */}
          {categoryList.map((cat) => {
            const catName = typeof cat === "string" ? cat : cat.name;
            return (
              <button
                key={catName}
                onClick={() => onSelectCategory(catName)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md capitalize transition-colors cursor-pointer ${
                  isSelected(catName)
                    ? "bg-accent-soft text-accent-text font-medium"
                    : "text-ink hover:bg-surface-muted"
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="border-t border-border pt-4">
        <h4 className="font-display text-xs font-semibold text-ink uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minDraft}
            onChange={(e) => setMinDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs text-ink outline-none focus:border-accent"
          />
          <span className="text-ink-muted text-xs">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxDraft}
            onChange={(e) => setMaxDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-9 px-2 bg-background border border-border rounded-md text-xs text-ink outline-none focus:border-accent"
          />
          <button
            onClick={applyPrice}
            className="h-9 px-3 shrink-0 bg-accent text-white text-xs font-medium rounded-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            Apply
          </button>
        </div>

      </div>
      {/* Active Sale Filter */}
      <div className="border-t border-border pt-4">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <h4 className="font-display text-xs font-semibold text-ink uppercase tracking-wider">
              Active Sale
            </h4>

            <p className="text-xs text-ink-muted mt-1">
              Show products with an active sale
            </p>
          </div>

          <input
            type="checkbox"
            checked={activeSale}
            onChange={(e) => onActiveSaleChange(e.target.checked)}
            className="w-4 h-4 accent-current cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}