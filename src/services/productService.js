// src/services/productService.js
import api from "./axios"


function quantityOf(p) {
  if (typeof p?.quantity === "number") return p.quantity
  return Array.isArray(p?.productDetails) ? p.productDetails.length : 0
}

function normalizeProduct(p) {
  if (!p) return p
  return {
    images: [],
    ...p,
    // đảm bảo luôn có object category (nếu BE chỉ trả id, FE vẫn dùng được)
    category: p.category
      ? (typeof p.category === "object" ? p.category : { id: p.category })
      : (p.categoryId ? { id: p.categoryId } : null),
  }
}

function toCreatePayload(p) {
  const { sku, name, brand, specifications, color, storage, categoryId } = p
  return {
    sku, name, brand, specifications, color, storage,
    category: categoryId ? { id: categoryId } : null,
  }
}
const toUpdatePayload = toCreatePayload

// === APIs phụ trợ ===
// lấy danh sách serial theo productId (nếu backend không expand kèm product)
async function fetchDetailsByProductId(productId) {
  try {
    const { data } = await api.get(`/api/product-details`, { params: { productId } })
    return Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : [])
  } catch {
    const sp = sampleProducts.find(x => x.id === productId)
    return Array.isArray(sp?.productDetails) ? sp.productDetails : []
  }
}


export const productService = {

  async getAll() {
    const response = await api.get('/api/products');
    return response.data?.result;
  },


 async getById(id) {
  const response = await api.get(`/api/products/${id}`);
  return response.data?.result;
},

  // CREATE
  async create(payload) {
    await api.post('/api/products',payload);
    return;
  },

  // UPDATE
  async update(id, payload) {
    await api.put(`api/products/${id}`,payload);
    return;
  },

  // DELETE
  async removeProduct(id) {
    try {
      await api.delete(`/api/products/${encodeURIComponent(id)}`)
      return true
    } catch {
      sampleProducts = sampleProducts.filter(p => p.id !== id)
      return true
    }
  }
}
