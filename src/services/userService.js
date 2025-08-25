import api from "./axios";

export const userService = {

    async getAllUsers(){
        const response = await api.get("/api/users");
        return response.data.result;
    },

    async getUserById(userId){
        const response = await api.get(`/api/users/${userId}`);
        return response.data.result;
    }
};