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
    const token = auth.token || localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      try{
      
        await auth.callRefreshToken();
        const newToken = auth.token;
        if(!newToken){
          return Promise.reject(error);
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      }catch(err){
        auth.logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;