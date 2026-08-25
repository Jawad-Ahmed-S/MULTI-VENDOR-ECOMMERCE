import { Check, X, Trash2, Building2 } from "lucide-react";

export default function AdminStoreTable({ stores, onApprove, onReject, onDelete }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-accent-text border border-accent/20">Approved</span>;
      case "rejected":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-soft text-danger-text border border-danger/20">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-muted text-ink-muted border border-border">Pending</span>;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted border-b border-border text-xs text-brand font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!Array.isArray(stores) || stores.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-ink-muted">
                  No stores match the selected filter.
                </td>
              </tr>
            ) : (
              stores.map((store) => {
                // Safely resolve banner URL whether stored as object { url, public_id } or plain string
                const bannerUrl = typeof store.banner === "object" ? store.banner?.url : store.banner;
                const isApproved = store.approvalStatus === "approved";

                return (
                  <tr key={store._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-surface-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                          {bannerUrl ? (
                            <img src={bannerUrl} alt={store.name} className="w-full h-full object-cover rounded-md" />
                          ) : (
                            <Building2 className="w-5 h-5 text-brand" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-ink">{store.name}</div>
                          <div className="text-xs text-ink-muted truncate max-w-xs">{store.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <div>{store.email}</div>
                      <div>{store.phone}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(store.approvalStatus)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isApproved && (
                          <button
                            onClick={() => onApprove(store._id)}
                            title="Approve Store"
                            className="p-1.5 text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {/* Hide reject button completely if approved */}
                        {!isApproved && (
                          <button
                            onClick={() => onReject(store._id)}
                            title="Reject Store"
                            className="p-1.5 text-danger-text hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(store._id)}
                          title="Delete Store"
                          className="p-1.5 text-ink-muted hover:text-danger-text rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}