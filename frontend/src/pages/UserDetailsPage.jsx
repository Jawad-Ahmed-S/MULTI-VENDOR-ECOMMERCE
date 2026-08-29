import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUpdateMyDetails, useDeleteMyAccount } from "../api/user.js";

const emptyForm = { name: "", email: "", phone: "" };

const formFromUser = (user) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
});

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser.data);

  const updateMutation = useUpdateMyDetails();
  const deleteMutation = useDeleteMyAccount();

  const [form, setForm] = useState(emptyForm);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
  const [initializedForId, setInitializedForId] = useState(null);
  if (currentUser && initializedForId !== currentUser._id) {
    setInitializedForId(currentUser._id);
    setForm(formFromUser(currentUser));
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const isDirty =
    form.name !== (currentUser.name ?? "") ||
    form.email !== (currentUser.email ?? "") ||
    String(form.phone) !== String(currentUser.phone ?? "");

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setForm(formFromUser(currentUser));

  const handleSave = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-surface-muted border border-border overflow-hidden shrink-0">
          {currentUser.avatar?.url && (
            <img
              src={currentUser.avatar.url}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="font-display text-ink text-2xl font-semibold leading-tight">
            Account details
          </h1>
          <p className="text-ink-muted text-sm mt-0.5">
            Manage your name, email and phone number.
          </p>
        </div>
      </div>

      {/* Edit form — prepopulated from the logged-in user, no role field:
          a normal user can't change their own role. */}
      <form
        onSubmit={handleSave}
        className="bg-surface border border-border rounded-lg p-5 md:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-brand text-[13px] font-medium mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              className="w-full h-11 px-3 bg-background border border-border rounded-md text-ink text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
              required
            />
          </div>

          <div>
            <label className="block text-brand text-[13px] font-medium mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className="w-full h-11 px-3 bg-background border border-border rounded-md text-ink text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
              required
            />
          </div>

          <div>
            <label className="block text-brand text-[13px] font-medium mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              className="w-full h-11 px-3 bg-background border border-border rounded-md text-ink text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="bg-accent text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || updateMutation.isPending}
            className="border border-border text-ink rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Discard changes
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-surface border border-danger/20 rounded-lg p-5 md:p-6 mt-5">
        <h2 className="font-display text-ink text-lg font-semibold mb-1">
          Delete account
        </h2>
        <p className="text-ink-muted text-sm mb-4">
          This permanently removes your account and logs you out. This can't
          be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-danger text-sm font-medium hover:underline"
          >
            Delete my account
          </button>
        ) : (
          <div className="bg-danger-soft rounded-md p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <p className="text-danger-text text-sm">
              Are you sure? This can't be undone.
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-danger text-white rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-border text-ink rounded-md px-3 py-1.5 text-sm font-medium hover:bg-surface-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}