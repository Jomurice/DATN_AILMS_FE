import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";
import axios from "axios";

export const tokenService = defineStore("auth", {
  state: () => ({
    token: null,
    refreshToken: null,
    user: null,
    role: "",
    refreshPromise: null,
  }),

  getters: {
    userId: (state) =>
      state.user?.id || state.user?.userId || state.user?.uid || state.user?.sub || "",

    userName: (state) =>
      state.user?.username ||
      state.user?.preferred_username ||
      state.user?.name ||
      state.user?.sub ||
      "",

    userRole: (state) => state.role,
  },

  actions: {
    // ================= SET TOKEN =================
    setToken(token, refreshToken) {
      this.token = token;
      localStorage.setItem("accessToken", token);

      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem("refreshToken", refreshToken);
      }

      try {
        const decoded = jwtDecode(token);
        this.user = decoded;
        this.role =
          decoded.scope
            ?.split(" ")
            ?.find(s => s.startsWith("ROLE_"))
            ?.replace("ROLE_", "") || "";
      } catch {
        this.user = null;
      }
    },

    // ================= LOAD TOKEN =================
    async loadToken() {
      const token = localStorage.getItem("accessToken");
      const rToken = localStorage.getItem("refreshToken");

      if (!token) return false;

      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        const BUFFER = 30;

        if (decoded.exp && decoded.exp - now > BUFFER) {
          this.token = token;
          this.refreshToken = rToken;
          this.user = decoded;
          this.role =
            decoded.scope
              ?.split(" ")
              ?.find(s => s.startsWith("ROLE_"))
              ?.replace("ROLE_", "") || "";
          return true;
        }

        // token sắp / đã hết hạn → refresh
        return await this.callRefreshToken();
      } catch {
        return false;
      }
    },

    // ================= REFRESH TOKEN =================
    async callRefreshToken() {
      if (this.refreshPromise) {
        return this.refreshPromise;
      }

      const refreshToken =
        this.refreshToken || localStorage.getItem("refreshToken");

      if (!refreshToken) return false;
      this.refreshPromise = (async () => {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { token: refreshToken },
            { headers: { Authorization: "" } }
          );

          const result = response.data.result;
          if (result?.token) {
            this.setToken(result.token, result.refreshToken || refreshToken);
            return true;
          }
          return false;
        } catch (e) {
          this.logout();
          return false;
        } finally {
          this.refreshPromise = null; // 🔓 Refresh xong thì giải phóng lock
        }
      })();
    },

    // ================= LOGOUT =================
    logout() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.role = "";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});
