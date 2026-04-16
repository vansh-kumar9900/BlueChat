import axios from "axios";

export const API_BASE = "http://localhost:5001/api";

export function createHttp(token) {
  const http = axios.create({ baseURL: API_BASE });

  http.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return http;
}

