import axios from "axios";
import { getApiBaseUrl } from "./base-url";

const api = axios.create({
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/admin")) {
        localStorage.removeItem("admin_token");
        document.cookie = "admin_token=; path=/; max-age=0";
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
