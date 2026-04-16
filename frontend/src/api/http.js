import axios from "axios";

export const BASE_URL = "https://bluechat-6pue.onrender.com/api";

export function createHttp(token) {
  const http = axios.create({ baseURL: BASE_URL });

  http.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return http;
}

