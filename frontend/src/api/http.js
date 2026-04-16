import axios from "axios";

export const BASE_URL = "https://bluechat-6pue.onrender.com";

export function createHttp(token) {
  const http = axios.create({ baseURL: API_BASE });

  http.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return http;
}

