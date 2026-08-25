import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

export default function RejectionModal({ isOpen, onClose, onSubmit, title }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-danger-text">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-display font-semibold text-lg text-ink">{title}</h3>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand mb-1">
              Reason for Rejection
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              placeholder="Provide clear reasons for the seller..."
              required
              className="w-full p-3 bg-background border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium text-ink hover:bg-surface-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-danger-soft text-danger-text border border-danger/20 rounded-md text-sm font-medium hover:bg-danger/20 transition-colors cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}