import api from "./axios";

export const authService = {
  async login(username, password) {
    const response = await api.post("/auth/token", { username, password });
    return response.data.result?.token;
  
  },

  async forgotPass(email){
    const response = await api.post("/auth/forgot-pass",{email});
    return response.data.result;
  },

  async verifyOTP(otp){
    await api.post("/auth/verify-otp",{otp});
  }
};
