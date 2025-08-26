import axios from "axios";

export const aisleService = {

    async getAll(){
        const response = await axios.get("/api/aisles");
        return response.data.result;
    },

    async getAisleById(id){
        const response = await axios.get(`/api/aisles/${id}`);
        return response.data.result;
    },

    async create(aisle){
        const response = await axios.post("/api/aisles",aisle);
        return response.data.result;
    },

    async update(id,aisle){
        const response = await axios.put(`/api/aisles/${id}`,aisle);
        return response.data.result;
    },

    async enbleAisle(id){
        const response = await axios.put(`/api/aisles/${id}`);
        return response.data.result;
    }
} 