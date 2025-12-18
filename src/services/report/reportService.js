import api from "../axios";

export const reportService = {
  async getInventorySummary(payload) {

    const params = {
      startDate: payload.startDate,
      endDate: payload.endDate,
      warehouseId: payload.warehouseId,
      productId: payload.productId,
      page: payload.page,
      size: payload.size
    };

    Object.keys(params).forEach(
      key => (params[key] === '' || params[key] == null) && delete params[key]
    );

    const response = await api.get('/api/reports/inventory-summary', { params });
    return response.data;
  }
};
