import axios from "axios";
import { tokenService } from "@/services/TokenService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    const auth = tokenService();
    // Chỉ lấy token từ state, không await loadToken ở đây để tránh nghẽn
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ================= RESPONSE =================
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const auth = tokenService();

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await auth.callRefreshToken();
        const newToken = auth.token;

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest); // 🔁 retry request cũ
      } catch (err) {
        processQueue(err, null);
        auth.logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
