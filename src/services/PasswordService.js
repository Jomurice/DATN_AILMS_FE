import api from "./axios";

export const passwordService = {
    async update(payload, token) {
        return await api.put('api/change-password', payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    },

    async forgotPass(payload) {
        return await api.post('api/forgot-password', payload,{
        headers: {
          "Content-Type": "application/json",
        },
    });
    },

    async verifyOTP(payload) {
        return await api.post('api/verify-otp',payload,{
        headers: {
          "Content-Type": "application/json",
        },
    });
    },

    async resetPassword(payload) {
        return await api.post('api/reset-password',payload,{
        headers: {
          "Content-Type": "application/json",
        },
    });
    }
};