import React, { createContext, useContext, useMemo, useState } from "react";
import { createHttp } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [me, setMe] = useState(() => {
    const raw = localStorage.getItem("me");
    return raw ? JSON.parse(raw) : null;
  });

  const http = useMemo(() => createHttp(token), [token]);

  const login = ({ token: nextToken, user }) => {
    setToken(nextToken);
    setMe(user);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("me", JSON.stringify(user));
  };

  const logout = () => {
    setToken("");
    setMe(null);
    localStorage.removeItem("token");
    localStorage.removeItem("me");
  };

  return (
    <AuthContext.Provider value={{ token, me, http, login, logout, setMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

