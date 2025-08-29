import api from "./axios";

export const authService = {
  async login(username, password) {
    const response = await api.post("/auth/token", { username, password });
    return response.data.result?.token;
  
  }
};
