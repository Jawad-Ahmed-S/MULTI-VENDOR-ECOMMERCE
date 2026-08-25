import { PackageOpen } from "lucide-react";

export default function EmptyState({ title = "No items found", message = "Try searching for something else or browse categories.", actionBtn }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-lg bg-surface">
      <div className="p-3 bg-surface-muted rounded-full text-brand mb-3">
        <PackageOpen size={32} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink mb-1">{title}</h3>
      <p className="text-xs text-ink-muted max-w-sm mb-4">{message}</p>
      {actionBtn}
    </div>
  );
}