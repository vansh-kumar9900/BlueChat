import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { http, login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await http.post("/auth/login", { username, password });
      login({ token: res.data.token, user: res.data.user });
      nav("/chat");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
      >
        <div className="text-2xl font-bold text-brand-700 dark:text-brand-300">💬 BlueChat</div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back! Sign in to continue.</div>

        {err && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className={inputClass}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium transition-colors"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          New here?{" "}
          <Link className="text-brand-600 dark:text-brand-400 font-medium hover:underline" to="/signup">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}
