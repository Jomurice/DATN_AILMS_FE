import api from "./axios";

export const ZoneService = {
    async getAllZones() {
        const response = await api.get("/api/zones"); 
        return response.data.result;
    },

    async getZoneById(zoneId) {
        const response = await api.get(`/api/zones/${zoneId}`);
        return response.data.result;
    },

    async createZone(zoneData) {
        const response = await api.post("/api/zones", zoneData);
        return response.data.result;
    },

    async updateZone(zoneId, zoneData) {
        const response = await api.put(`/api/zones/${zoneId}`, zoneData);
        return response.data.result;
    },
}