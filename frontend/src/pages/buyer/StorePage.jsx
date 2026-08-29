import { useParams } from "react-router-dom";
import { useGetSingleStore, useGetStoreProducts } from "../../api/store.js";
import ProductGrid from "../../components/buyer/ProductGrid";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import RatingStars from "../../components/common/RatingStars";
import Breadcrumbs from "../../components/common/Breadcrumbs";

export default function StorePage() {
  const { id } = useParams();
  const { data: storeData, isLoading: loadingStore } = useGetSingleStore(id);
  const { data: productsData, isLoading: loadingProducts } = useGetStoreProducts(id);

  const store = storeData?.data;
  const products = productsData?.data || [];
  const storeInitial = store?.name?.charAt(0).toUpperCase() || "S";

  // Build clean address string
  const formattedAddress = [
    store?.address?.address,
    store?.address?.city,
    store?.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (loadingStore) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <LoadingSkeleton count={1} />
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-background min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: "Stores", link: "/stores" },
          { label: store?.name || "Store" },
        ]}
      />

      {/* Main Hero Store Card */}
      <section className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* Banner Image Area */}
        <div className="relative h-52 md:h-64 bg-surface-muted border-b border-border overflow-hidden">
          {store?.banner?.url ? (
            <>
              <img
                src={store.banner.url}
                alt={`${store?.name} Banner`}
                className="w-full h-full object-cover"
              />
              {/* Subtle overlay gradient to maintain readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm font-medium">
              No Banner Image Available
            </div>
          )}

          {/* Verification Badge */}
          {store?.approvalStatus === "approved" && (
            <div className="absolute top-4 right-4 bg-accent-soft text-accent-text border border-border/40 text-xs font-medium px-3.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Verified Merchant
            </div>
          )}
        </div>

        {/* Store Information Body */}
        <div className="p-6 md:p-8 relative">
          
          {/* Top Section: Avatar, Title, Description, Ratings */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
            
            {/* Store Avatar & Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-brand text-background border-4 border-surface flex items-center justify-center font-display text-3xl font-semibold shrink-0 -mt-14 md:-mt-16 z-10">
                {storeInitial}
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-2xl md:text-[28px] font-semibold text-ink leading-tight">
                  {store?.name}
                </h1>
                {store?.description && (
                  <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
                    {store.description}
                  </p>
                )}
              </div>
            </div>

            {/* Rating Pills Group */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-accent-soft text-accent-text px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 border border-accent/20">
                <RatingStars rating={store?.ratings} />
                <span className="font-semibold">({store?.ratings || 0})</span>
              </div>
              <div className="bg-surface-muted text-ink-muted px-4 py-2 rounded-lg text-xs font-medium border border-border">
                <span className="text-ink font-semibold">{store?.totalReviews || 0}</span> Reviews
              </div>
            </div>
          </div>

          {/* Structured Contact & Location Info Bar */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Location Card */}
            {formattedAddress && (
              <div className="flex items-center gap-3.5 p-3.5 rounded-md bg-surface-muted/50 border border-border">
                <div className="w-9 h-9 rounded-md bg-surface border border-border flex items-center justify-center text-brand shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider">Location</p>
                  <p className="text-xs text-ink font-medium truncate">{formattedAddress}</p>
                </div>
              </div>
            )}

            {/* Email Contact Card */}
            {store?.email && (
              <div className="flex items-center gap-3.5 p-3.5 rounded-md bg-surface-muted/50 border border-border">
                <div className="w-9 h-9 rounded-md bg-surface border border-border flex items-center justify-center text-brand shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider">Email Support</p>
                  <a href={`mailto:${store.email}`} className="text-xs text-ink font-medium hover:text-accent transition-colors truncate block">
                    {store.email}
                  </a>
                </div>
              </div>
            )}

            {/* Phone Contact Card */}
            {store?.phone && (
              <div className="flex items-center gap-3.5 p-3.5 rounded-md bg-surface-muted/50 border border-border">
                <div className="w-9 h-9 rounded-md bg-surface border border-border flex items-center justify-center text-brand shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-ink-muted uppercase tracking-wider">Phone</p>
                  <a href={`tel:${store.phone}`} className="text-xs text-ink font-medium hover:text-accent transition-colors truncate block">
                    {store.phone}
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Store Inventory Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Store Inventory
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {products.length} {products.length === 1 ? "product" : "products"} available
            </p>
          </div>
        </div>

        {loadingProducts ? (
          <LoadingSkeleton type="card" count={4} />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}