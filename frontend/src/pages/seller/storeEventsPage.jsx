import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetMyStores } from "../../api/store.js";
import { useGetStoreEvents, useDeleteEvent, useUpdateEvent } from "../../api/events.js";
import { Plus, Tag, Trash2, Power, Loader2, Calendar, Store, ArrowRight } from "lucide-react";

export default function StoreEventsPage() {
  const navigate = useNavigate();

  // 1. Fetch stores
  const { data: storesData, isLoading: isLoadingStores } = useGetMyStores();

  const stores = storesData?.data || storesData || [];


  // 3. Derive active store ID directly without useEffect
  const [userSelectedStoreId, setUserSelectedStoreId] = useState("");
  const selectedStoreId = userSelectedStoreId || stores[0]?._id || "";

  // 4. Fetch events for active store
  const { data: eventsData, isLoading: isLoadingEvents } = useGetStoreEvents(selectedStoreId);

  // Safely extract events array
  const events = Array.isArray(eventsData)
    ? eventsData
    : Array.isArray(eventsData?.events)
    ? eventsData.events
    : [];

  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  const handleToggleStatus = (event) => {
    const newStatus = event.status === "running" ? "ended" : "running";
    updateEventMutation.mutate({
      eventId: event._id,
      eventData: { status: newStatus },
    });
  };

  const handleDelete = (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink">Store Flash Sales & Events</h1>
          <p className="text-xs text-ink-muted">Select a store to monitor live discounts or launch new sales campaigns.</p>
        </div>

        {selectedStoreId && (
          <button
            onClick={() => navigate(`/seller/${selectedStoreId}/events/create`)}
            className="h-9 px-4 bg-accent text-white text-xs font-medium rounded-md flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            <Plus size={14} /> Launch Sale Event
          </button>
        )}
      </div>

      {/* Store Selector Bar */}
      <div>
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">Your Stores</h2>
        {isLoadingStores ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-16 w-48 bg-surface-muted animate-pulse rounded-lg border border-border" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-6 text-center space-y-2">
            <Store className="w-8 h-8 text-ink-muted mx-auto" />
            <p className="text-xs text-ink-muted">You haven't created any stores yet.</p>
            <Link to="/seller/store/create" className="text-xs text-accent hover:underline font-medium inline-block">
              Create Your First Store
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {stores.map((st) => {
              const isSelected = st._id === selectedStoreId;
              return (
                <button
                  key={st._id}
                  onClick={() => setUserSelectedStoreId(st._id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all shrink-0 cursor-pointer text-left ${
                    isSelected
                      ? "bg-accent-soft border-accent text-accent-text shadow-xs"
                      : "bg-surface border-border hover:border-border-strong text-ink"
                  }`}
                >
                  <Store size={18} className={isSelected ? "text-accent" : "text-ink-muted"} />
                  <div>
                    <h3 className="text-xs font-semibold leading-none mb-1">{st.name}</h3>
                    <span className="text-[10px] text-ink-muted block capitalize">{st.status || "Active"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Events Listing for Selected Store */}
      {selectedStoreId && (
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
              Campaigns for {stores.find((s) => s._id === selectedStoreId)?.name || "Store"}
            </h2>
            <span className="text-xs text-ink-muted font-mono">{events.length} Total Event(s)</span>
          </div>

          {isLoadingEvents ? (
            <div className="py-16 text-center">
              <Loader2 className="w-7 h-7 text-accent animate-spin mx-auto" />
              <p className="text-xs text-ink-muted mt-2">Loading store sales events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-10 text-center space-y-3">
              <Tag className="w-8 h-8 text-ink-muted mx-auto" />
              <h3 className="text-sm font-semibold text-ink">No events for this store yet</h3>
              <p className="text-xs text-ink-muted">Put your products on discount to attract buyer attention.</p>
              <button
                onClick={() => navigate(`/seller/${selectedStoreId}/events/create`)}
                className="text-xs font-medium text-accent hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                Create Event Now <ArrowRight size={12} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((evt) => {
                const isLive = evt.status === "running" && new Date(evt.endDate) > new Date();

                return (
                  <div
                    key={evt._id}
                    className="bg-surface border border-border rounded-lg p-5 flex flex-col justify-between space-y-4 relative"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isLive
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                              : "bg-surface-muted text-ink-muted border border-border"
                          }`}
                        >
                          {isLive ? "Live Sale" : "Ended"}
                        </span>
                        <span className="text-xs font-mono font-bold text-accent">
                          {evt.discountPercentage}% OFF
                        </span>
                      </div>

                      <div>
                        <h3 className="font-medium text-sm text-ink line-clamp-1">
                          {evt.product?.name || "Product"}
                        </h3>
                        <p className="text-xs text-ink-muted">
                          Original Price: ${evt.product?.originalPrice}
                        </p>
                      </div>

                      <div className="text-[11px] text-ink-muted space-y-1 font-mono bg-background p-2.5 rounded-md border border-border">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} /> Starts: {new Date(evt.startDate).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} /> Ends: {new Date(evt.endDate).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <button
                        onClick={() => handleToggleStatus(evt)}
                        className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer"
                      >
                        <Power size={14} className={evt.status === "running" ? "text-emerald-500" : "text-ink-muted"} />
                        {evt.status === "running" ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(evt._id)}
                        className="text-xs text-danger hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}