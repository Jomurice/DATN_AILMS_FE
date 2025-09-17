import api from "./axios";


export const userService = {

    async getAllUsers(payload) {

        const params = {
            name: payload.name,
            role: payload.role,
            status: payload.status,
            gender: payload.gender,
            page: payload.pageable.page,
            size: payload.pageable.size
        };

        if (payload.pageable.sort && payload.pageable.sort.length > 0 && payload.pageable.sort[0] !== "") {
            params.sort = payload.pageable.sort;
        }

        Object.keys(params).forEach(
            key => (params[key] === '' || params[key] == null) && delete params[key]
        );

        const response = await api.get("/api/users", { params });
        return response.data;

    },

    async getTotalUser() {
        const response = await api.get('/api/users/stats');
        return response.data?.result;
    },

    async getUserById(userId) {
        const response = await api.get(`/api/users/${userId}`);
        return response.data?.result;
    },

    async createUser(payload) {
        const response = await api.post("/api/users", payload);
        return response.data.result;
    },

    async updateUser(userId, payload) {
        const response = await api.put(`/api/users/${userId}`, payload);
        return response.data.result;
    },

    async unEnableUser(userId) {
        const response = await api.patch(`/api/admin/users/${userId}/blocked`);
        return response.data.result;
    },

    async enableUser(userId) {
        const response = await api.patch(`/api/admin/users/${userId}/active`);
        return response.data.result;
    },
};