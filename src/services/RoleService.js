import api from "./axios";

export const roleService = {
    async getAll(){
        const response = await api.get('/api/roles');
        return response.data?.result;
    },

    async getRoleById(id){
        const response = await api.get(`/api/roles/${id}`);
        return response.data?.result;
    }
} 