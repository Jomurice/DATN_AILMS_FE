import api from './axios';

export const locationService ={
 
    async getWarehouseByLocation(locationId){
        const response = await api.get(`api/locations/${locationId}/warehouses`);
        return response.data.result;
    },

    async getAllLocation(){
        const response = await api.get('/api/locations');
        return response.data.result;
    },

    async getLocationById(locationId){
        const response  = await api.get(`/api/locations/${locationId}`);
        return response.data.result;
    },

    async createLocation(payload){
        const response = await api.post('/api/locations', payload);
        return response.data.result;
    },

    async updateLocation(locationId, payload){
        const responce = await api.put(`/api/locations/${locationId}`, payload);
        return responce.data.result;
    },

    async deleteLocation(locationId){
        const response = await api.delete(`/api/locationId`);
        return response.data.result;
    }
}