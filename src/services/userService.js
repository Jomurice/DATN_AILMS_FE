import api from "./axios";


export const userService = {

    async getAllUsers(){
        const response = await api.get("/api/users");
        return response.data.result;
    },

    async getUserById(userId){
        const response = await api.get(`/api/users/${userId}`);
        return response.data.result;
    },

    async createUser(userData){
        const response = await api.post("/api/users", userData);
        return response.data.result;
    },

    async updateUser(userId, userData){
        const response = await api.put(`/api/users/${userId}`, userData);
        return response.data.result;
    },
    
    async enableUser(userId){
        const response = await api.put(`/api/users/enable/${userId}`);
        return response.data.result;
    },
};