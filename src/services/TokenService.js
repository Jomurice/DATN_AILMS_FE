import { jwtDecode } from "jwt-decode";
import { defineStore } from "pinia";

export const tokenService = defineStore("auth", {
  state: () => ({
    token: null,
    user: null, // payload decode
    role: "",
  }),
  getters: {
    userId: (state) =>
      state.user?.id ||
      state.user?.userId ||
      state.user?.uid ||
      state.user?.sub ||
      state.user?.scope ||
      "",
    userName: (state) =>
      state.user?.username ||
      state.user?.preferred_username ||
      state.user?.name ||
      state.user?.email ||
      state.user?.sub ||
      // fallback cuối
      "",
    userRole: (state) =>
      state.user?.scope || // fallback cuối
      "",

  },
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem("accessToken", token);
      try {
        const t = jwtDecode(token);

        this.user = t;

        // if (t.exp * 1000 < Date.now()) {
        //   this.logout();
        //   return;
        // };

        this.role = typeof t.scope === "string" ? t.scope.slice(5) : ""
      } catch (e) {
        this.user = null;
      }
    },
    loadToken() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        this.setToken(token);
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.role = "";
      localStorage.removeItem("accessToken");
    },
  },
});
