import React, { useMemo, useState } from "react";

export default function GroupModal({ open, onClose, users, onCreate }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);

  const canCreate = useMemo(() => name.trim() && selected.length >= 2, [name, selected]);

  if (!open) return null;

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ name: name.trim(), memberIds: selected });
    setName("");
    setSelected([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 grid place-items-center p-4 z-50">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Create Group</div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Select at least 2 members:
          </div>

          <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(u._id)}
                  onChange={() => toggle(u._id)}
                  className="accent-brand-600"
                />
                <span className="text-sm text-slate-900 dark:text-slate-100">{u.username}</span>
              </label>
            ))}
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500">
            {selected.length} selected
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
