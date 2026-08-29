import { useState } from "react";
import { Users, Store, Trash2, Mail, Phone, Calendar } from "lucide-react";
import {
  useAdminGetAllUsers,
  useAdminGetAllSellers,
  useAdminDeleteUser,
} from "../../api/user.js";

const TABS = [
  { key: "users", label: "Users", icon: Users },
  { key: "sellers", label: "Sellers", icon: Store },
];

// Same pill pairing the rest of the admin area uses for order/product status
// (see DESIGN.md "List card / row item"): soft tint + matching text, never a
// solid fill with white text.
const STORE_STATUS_STYLES = {
  approved: "bg-accent-soft text-accent-text",
  pending: "bg-surface-muted text-ink",
  rejected: "bg-danger-soft text-danger-text",
};

export default function AdminUsersPage() {
  const [tab, setTab] = useState("users");

  const usersQuery = useAdminGetAllUsers();
  const sellersQuery = useAdminGetAllSellers();

  const deleteUserMutation = useAdminDeleteUser();

  const activeQuery = tab === "users" ? usersQuery : sellersQuery;
  const { data: res, isLoading, isError, error } = activeQuery;

  const records = res?.data || res || [];
  const list = Array.isArray(records) ? records : [];

  const handleDelete = (userId, name) => {
    if (window.confirm(`Permanently delete ${name || "this user"}? This cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-display font-semibold text-2xl text-ink">User Management</h1>
        <p className="text-ink-muted text-sm mt-1">
          View and manage everyone on the platform — customers and sellers.
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-ink-muted hover:text-ink hover:border-border-strong"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-ink-muted text-sm">Loading {tab}...</div>
      ) : isError ? (
        <div className="bg-danger-soft text-danger-text p-4 rounded-md border border-border text-sm">
          {error?.response?.data?.message || `Failed to load ${tab}.`}
        </div>
      ) : list.length === 0 ? (
        <div className="text-ink-muted text-sm border border-dashed border-border rounded-lg p-8 text-center">
          No {tab} yet.
        </div>
      ) : tab === "sellers" ? (
        <SellersTable sellers={list} onDelete={handleDelete} />
      ) : (
        <UsersTable users={list} onDelete={handleDelete} />
      )}
    </div>
  );
}

function TableShell({ headers, children }) {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div
        className="grid text-ink-muted text-[11px] font-medium uppercase tracking-wide border-b border-border px-4 py-2.5"
        style={{ gridTemplateColumns: headers.gridTemplateColumns }}
      >
        {headers.labels.map((label) => (
          <span key={label.text} className={label.align === "right" ? "text-right" : "text-left"}>
            {label.text}
          </span>
        ))}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function RowActions({ onDelete }) {
  return (
    <button
      onClick={onDelete}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors cursor-pointer"
      title="Delete"
    >
      <Trash2 size={16} strokeWidth={2} />
    </button>
  );
}

function UsersTable({ users, onDelete }) {
  const cols = "1.4fr 1.6fr 1fr 1fr 60px";
  return (
    <TableShell
      headers={{
        gridTemplateColumns: cols,
        labels: [
          { text: "Name" },
          { text: "Email" },
          { text: "Phone" },
          { text: "Joined" },
          { text: "", align: "right" },
        ],
      }}
    >
      {users.map((u) => (
        <div
          key={u._id}
          className="grid items-center px-4 py-3 text-sm hover:bg-surface-muted/40 transition-colors"
          style={{ gridTemplateColumns: cols }}
        >
          <span className="text-ink font-medium">{u.name}</span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Mail size={14} strokeWidth={2} className="shrink-0" />
            {u.email}
          </span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Phone size={14} strokeWidth={2} className="shrink-0" />
            {u.phone || "—"}
          </span>
          <span className="flex items-center gap-1.5 text-ink-muted">
            <Calendar size={14} strokeWidth={2} className="shrink-0" />
            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
          </span>
          <span className="flex justify-end">
            <RowActions onDelete={() => onDelete(u._id, u.name)} />
          </span>
        </div>
      ))}
    </TableShell>
  );
}

function SellersTable({ sellers, onDelete }) {
  const cols = "1.2fr 1.5fr 1.6fr 0.9fr 60px";
  return (
    <TableShell
      headers={{
        gridTemplateColumns: cols,
        labels: [
          { text: "Name" },
          { text: "Email" },
          { text: "Stores" },
          { text: "Joined" },
          { text: "", align: "right" },
        ],
      }}
    >
      {sellers.map((s) => (
        <div
          key={s._id}
          className="grid items-start px-4 py-3 text-sm hover:bg-surface-muted/40 transition-colors"
          style={{ gridTemplateColumns: cols }}
        >
          <span className="text-ink font-medium pt-0.5">{s.name}</span>
          <span className="flex items-center gap-1.5 text-ink-muted pt-0.5">
            <Mail size={14} strokeWidth={2} className="shrink-0" />
            {s.email}
          </span>
          <span className="flex flex-col gap-1.5">
            {(s.stores || []).length === 0 ? (
              <span className="text-ink-muted">No stores yet</span>
            ) : (
              s.stores.map((store) => (
                <span key={store._id} className="flex items-center gap-2">
                  <Store size={14} strokeWidth={2} className="text-ink-muted shrink-0" />
                  <span className="text-ink">{store.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      STORE_STATUS_STYLES[store.approvalStatus] || STORE_STATUS_STYLES.pending
                    }`}
                  >
                    {store.approvalStatus}
                  </span>
                </span>
              ))
            )}
          </span>
          <span className="flex items-center gap-1.5 text-ink-muted pt-0.5">
            <Calendar size={14} strokeWidth={2} className="shrink-0" />
            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
          </span>
          <span className="flex justify-end pt-0.5">
            <RowActions onDelete={() => onDelete(s._id, s.name)} />
          </span>
        </div>
      ))}
    </TableShell>
  );
}