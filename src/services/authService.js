import api from "./axios";

export const authService = {
  async login(username, password) {
    const response = await api.post("/auth/token", { username, password });
    const token = response.data.result?.access_token || response.data.result?.token;
    if (token) {
      localStorage.setItem("token", token);
    }
    return token;
  },
  logout() {
    localStorage.removeItem("token");
  },
  getToken() {
    return localStorage.getItem("token");
  }
};
