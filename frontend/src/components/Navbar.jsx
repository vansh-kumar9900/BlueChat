import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { me, logout } = useAuth();
  const { dark, setDark } = useTheme();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
      <div className="font-bold text-brand-600 dark:text-brand-400 text-lg">💬 BlueChat</div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 grid place-items-center transition-colors"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? "☀️" : "🌙"}
        </button>

        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {me?.username}
        </div>

        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
