import { Link } from "react-router-dom";
import { Lock, X } from "lucide-react";

export default function AuthPromptModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-surface border border-border rounded-lg max-w-sm w-full p-6 space-y-4 shadow-lg text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-ink-muted hover:text-ink cursor-pointer"
        >
          <X size={18} />
        </button>
        
        <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
          <Lock size={22} />
        </div>

        <div className="space-y-1">
          <h3 className="font-display font-semibold text-lg text-ink">Sign in required</h3>
          <p className="text-xs text-ink-muted">
            You need to be logged in to save items to your wishlist.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-9 bg-surface-muted text-ink text-xs font-medium rounded-md border border-border hover:bg-border transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <Link to="/login" className="flex-1">
            <button className="w-full h-9 bg-accent text-white text-xs font-medium rounded-md hover:bg-accent/90 transition-colors cursor-pointer">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}