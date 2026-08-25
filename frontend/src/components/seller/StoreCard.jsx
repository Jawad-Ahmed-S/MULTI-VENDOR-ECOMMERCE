import { Link } from "react-router-dom";
import { PlusCircle, AlertCircle, Phone, Mail, MapPin } from "lucide-react";

export default function StoreCard({ store }) {
  const storeDetailsPath = `/seller/store/${store._id}`;
  
  // Safely extract banner URL
  const bannerUrl = typeof store.banner === "object" ? store.banner?.url : store.banner;

  // Safely extract address string whether stored as object or plain string
  const formatAddress = (addr) => {
    if (!addr) return null;
    if (typeof addr === "object") {
      const parts = [addr.address, addr.city, addr.country].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : null;
    }
    return String(addr);
  };

  const displayAddress = formatAddress(store.address);

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-accent-text">
          Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-danger-soft text-danger-text">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-brand">
        Pending Approval
      </span>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col justify-between hover:border-border-strong hover:shadow-sm transition-all duration-200">
      <Link to={storeDetailsPath} className="block group">
        <div className="h-28 bg-surface-muted w-full overflow-hidden relative">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-ink-muted text-xs">
              No Banner
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-semibold text-lg text-ink group-hover:text-brand transition-colors">
              {store.name}
            </h3>
            {getStatusBadge(store.approvalStatus)}
          </div>

          <p className="text-ink text-sm mb-4 line-clamp-2">{store.description}</p>

          <div className="space-y-1.5 text-xs text-ink-muted mb-4">
            {store.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{store.phone}</span>
              </div>
            )}
            {store.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{store.email}</span>
              </div>
            )}
            {displayAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{displayAddress}</span>
              </div>
            )}
          </div>

          {store.approvalStatus === "rejected" && store.rejectionReason && (
            <div className="bg-danger-soft border border-danger/20 rounded-md p-3 text-xs text-danger-text flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Rejection Reason:</strong> {store.rejectionReason}
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 border-t border-border mt-auto pt-4">
        <Link to={`/seller/store/${store._id}/product/create`} className="block">
          <button className="w-full flex items-center justify-center gap-2 bg-accent text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-accent/90 transition-colors cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            Add Product to Store
          </button>
        </Link>
      </div>
    </div>
  );
}