import api from "../axios";

export const purchaseOrderService = {


  // async getAllPurchaseOrder() {
  //   try {
  //       console.log("🚀 Đang gọi API Outbound...");
  //       const response = await api.get('/api/outbound-orders');
        
  //       console.log("✅ Dữ liệu gốc từ BE:", response.data); // F12 xem dòng này

  //       // 1. Lấy cục data chính
  //       const result = response.data?.result || response.data;

  //       // 2. Kiểm tra các trường hợp
  //       // TH1: Trả về Page (có .content)
  //       if (result && result.content && Array.isArray(result.content)) {
  //           console.log("👉 Phát hiện dạng PAGE. Lấy .content");
  //           return result.content;
  //       }

  //       // TH2: Trả về List (bản thân nó là mảng)
  //       if (Array.isArray(result)) {
  //           console.log("👉 Phát hiện dạng LIST.");
  //           return result;
  //       }

  //       console.warn("⚠️ Không tìm thấy mảng dữ liệu nào hợp lệ!", result);
  //       return [];

  //   } catch (e) {
  //       console.error("❌ Lỗi gọi API Outbound:", e);
  //       return [];
  //   }
  // },

  async getAllPurchaseOrders() {
    const response = await api.get('/api/purchase-orders');
    return response.data.result;
  },
  
  async getPurchaseOrderById(orderId, params = {}) {
    const response = await api.get(`/api/purchase-orders/${orderId}`, { params });
    return response.data.result;
  },


  async createPurchaseOrder(payload) {
    const response = await api.post('/api/purchase-orders', payload);
    return response.data.result;
  },

  async updatePurchaseOrder(orderId, payload) {
    const response = await api.put(`/api/purchase-orders/${orderId}`, payload);
    return response.data.result;
  },

  async deletePurchaseOrder(orderId) {
    const response = await api.delete(`/api/purchase-orders/${orderId}`);
    return response.data.result;
  },


  async completePurchaseOrder(orderId, userId) {
    const response = await api.post(`/api/purchase-orders/${orderId}/complete`, null, {
      params: { userId }
    });
    return response.data.result;
  },

  
  async getSerials(orderId, sku = null) {
    const response = await api.get(`/api/purchase-orders/${orderId}/serials`, {
      params: sku ? { sku } : {}
    });
    return response.data.result;
  },


  async searchPurchaseOrders({ page = 0, size = 10, status = null, keyword = null }) {
    const response = await api.get('/api/purchase-orders/search-po', {
      params: { page, size, status, keyword }
    });
    return response.data.result;
  },

  
  async downloadQrCodes(orderId) {
    const response = await api.get(`/api/purchase-orders/${orderId}/qrcodes`, {
      responseType: "blob"
    });

    const blob = new Blob([response.data], { type: "application/zip" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcodes.zip";
    a.click();

    window.URL.revokeObjectURL(url);
  }
};