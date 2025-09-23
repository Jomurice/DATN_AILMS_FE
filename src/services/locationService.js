
import api from "./axios";

export const locationService = {

    async getAllLocation(){
        const response = await api.get("/api/locations");
        return response.data?.result;
    },

    async getByIdLocation(id){
        const response = await api.get(`/api/locations/${id}`);
        return response.data.result;
    },

    async createLocation(payload){
        const response = await api.post('/api/products', payload);
        return response.data;
    },

    async updateLocatin(id, payload){
        const response = await api.put();
        return response.data;
    }
    
}