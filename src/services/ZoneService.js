import axios from "axios";

export const ZoneService = {
    async getAllZones() {
        const response = await axios.get("/api/zones"); 
        return response.data.result;
    },

    async getZoneById(zoneId) {
        const response = await axios.get(`/api/zones/${zoneId}`);
        return response.data.result;
    },

    async createZone(zoneData) {
        const response = await axios.post("/api/zones", zoneData);
        return response.data.result;
    },

    async updateZone(zoneId, zoneData) {
        const response = await axios.put(`/api/zones/${zoneId}`, zoneData);
        return response.data.result;
    },
}