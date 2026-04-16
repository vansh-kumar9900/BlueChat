import React, { useMemo, useState } from "react";
import { initials } from "../utils/avatar";

export default function Sidebar({
  me,
  users,
  chats,
  unreadCounts,
  activeChatId,
  onOpenDirect,
  onOpenChat,
  onOpenGroupModal
}) {
  const [q, setQ] = useState("");

  const filteredUsers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => u.username.toLowerCase().includes(s));
  }, [users, q]);

  return (
    <div className="w-[320px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col">
      {/* Search + Create Group */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users…"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={onOpenGroupModal}
          className="w-full px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          + Create Group
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Chats section */}
        {chats.length > 0 && (
          <>
            <div className="px-3 pt-3 pb-1 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              Chats
            </div>
            {chats.map((c) => {
              const isActive = String(c._id) === String(activeChatId);
              const unread = unreadCounts?.[c._id] || 0;

              const title = c.isGroup
                ? c.name || "Group"
                : c.members.find((m) => String(m._id) !== String(me._id))?.username || "User";

              return (
                <button
                  key={c._id}
                  onClick={() => onOpenChat(c)}
                  className={[
                    "w-full text-left px-3 py-3 border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors",
                    isActive ? "bg-brand-50 dark:bg-brand-950/40 border-l-2 border-l-brand-600" : ""
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200 grid place-items-center font-semibold text-sm flex-shrink-0">
                      {c.isGroup ? "👥" : title[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {title}
                        </div>
                        {unread > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-600 text-white text-[11px] grid place-items-center ml-2 flex-shrink-0">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {c.isGroup ? `${c.members?.length || 0} members` : "Direct message"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* All users section */}
        <div className="px-3 pt-3 pb-1 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          All Users
        </div>
        {filteredUsers
          .filter((u) => String(u._id) !== String(me._id))
          .map((u) => (
            <button
              key={u._id}
              onClick={() => onOpenDirect(u)}
              className="w-full text-left px-3 py-3 border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200 grid place-items-center font-semibold text-sm">
                    {initials(u.username)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 ${
                      u.onlineStatus ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                    {u.username}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {u.onlineStatus
                      ? "Active now"
                      : u.lastSeen
                        ? `Last seen ${new Date(u.lastSeen).toLocaleString()}`
                        : "Offline"}
                  </div>
                </div>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
