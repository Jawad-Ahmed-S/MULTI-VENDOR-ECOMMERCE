import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-border rounded-md text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs text-ink font-medium px-3">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-border rounded-md text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-muted transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}