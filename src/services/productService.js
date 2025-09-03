// src/services/productService.js
import api from "./axios"

// ===== DỮ LIỆU MẪU (bám backend) =====
let sampleProducts = [
  {
    id: "379230b1-879e-4148-b5d3-285127d615de",
    sku: "SKU-DXPS13",
    name: "Laptop Dell XPS 13",
    brand: "Dell",
    specifications: "CPU: Intel Core i7; RAM: 16GB; SSD: 512GB; Màn 13.4\" FHD+",
    color: "Bạc",
    storage: "512GB",
    category: { id: "465f30bd-1b64-4139-89ce-c31682bd8788", name: "Ultrabook" },
    productDetails: [
      { id: "pd-1", serialNumber: "DXPS13-0001", status: "AVAILABLE", bin: { id: "bin-01", name: "A1-01" } },
      { id: "pd-2", serialNumber: "DXPS13-0002", status: "RESERVED",  bin: { id: "bin-02", name: "A1-02" } }
    ],
    images: ["https://dellxps.com.vn/library/module_new/dell-xps-13-9315-i7-1250u-ram-16gb-ssd-512gb-man-hinh-13-4-inch-fhd-ips-likenew_s4319.jpg"]
  },
  {
    id: "f9a0d2d1-1111-4c11-a0c0-111111111111",
    sku: "SKU-M15AIR",
    name: "MacBook Air 15”",
    brand: "Apple",
    specifications: "Chip M2; RAM: 8GB; SSD: 256GB; Màn 15.3\"",
    color: "Midnight",
    storage: "256GB",
    category: { id: "9e0b6b4f-4a9a-4f6d-8e6b-111111111111", name: "Laptop" },
    productDetails: [{ id: "pd-3", serialNumber: "MBA15-0001", status: "AVAILABLE", bin: { id: "bin-03", name: "B2-10" } }],
    images: ["https://via.placeholder.com/900x600?text=MacBook+Air+15"]
  },
  {
    id: "a2b3c4d5-2222-4c22-a0c0-222222222222",
    sku: "SKU-UDOCK",
    name: "Ugreen USB-C Dock",
    brand: "Ugreen",
    specifications: "8-in-1",
    color: "Gray",
    storage: null,
    category: { id: "c22c1a1a-7b52-4a9f-9a33-222222222222", name: "Phụ kiện" },
    productDetails: [],
    images: ["https://via.placeholder.com/900x600?text=Ugreen+Dock"]
  }
]

// ===== Helpers =====
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
  // LIST
  async getAllProducts() {
    try {
      const { data } = await api.get("/api/products")
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null)
      const items = (out ?? sampleProducts).map(normalizeProduct)
      return items.map(p => ({ ...p, quantity: quantityOf(p) }))
    } catch {
      return sampleProducts.map(p => ({ ...normalizeProduct(p), quantity: quantityOf(p) }))
    }
  },

  // DETAIL
 async getProductById(id) {
  try {
    const { data } = await api.get(`/api/products/${encodeURIComponent(id)}`)
    let p = data?.result ?? data
    if (p && (p.id || p.sku)) {
      p = normalizeProduct(p)
      if (!Array.isArray(p.productDetails)) {
        const details = await fetchDetailsByProductId(p.id || id)
        p = { ...p, productDetails: details }
      }
      return { ...p, quantity: quantityOf(p) }
    }
  } catch (err) {
    // bỏ qua để vào fallback
  }

  // Fallback A: lấy list từ BE rồi tìm theo id/sku
  try {
    const list = await this.getAllProducts()
    const found = list.find(x => String(x.id) === String(id)) || list.find(x => String(x.sku) === String(id))
    if (found) return found
  } catch {}

  // Fallback B: sample
  const fb = sampleProducts.find(x => String(x.id) === String(id)) || sampleProducts.find(x => String(x.sku) === String(id))
  return fb ? { ...normalizeProduct(fb), quantity: quantityOf(fb) } : null
},

  // CREATE
  async createProduct(payload) {
    try {
      const { data } = await api.post("/api/products", toCreatePayload(payload))
      const p = data?.result ?? data
      return normalizeProduct(p)
    } catch {
      const newItem = normalizeProduct({
        id: crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(16)+Math.random().toString(16).slice(2)),
        sku: payload.sku,
        name: payload.name,
        brand: payload.brand ?? null,
        specifications: payload.specifications ?? null,
        color: payload.color ?? null,
        storage: payload.storage ?? null,
        category: payload.categoryId ? { id: payload.categoryId, name: "—" } : null,
        productDetails: [],
        images: payload.images ?? []
      })
      sampleProducts = [newItem, ...sampleProducts]
      return newItem
    }
  },

  // UPDATE
  async updateProduct(id, payload) {
    try {
      const { data } = await api.put(`/api/products/${encodeURIComponent(id)}`, toUpdatePayload(payload))
      return normalizeProduct(data?.result ?? data)
    } catch {
      sampleProducts = sampleProducts.map(p =>
        p.id === id
          ? normalizeProduct({
              ...p,
              sku: payload.sku,
              name: payload.name,
              brand: payload.brand ?? null,
              specifications: payload.specifications ?? null,
              color: payload.color ?? null,
              storage: payload.storage ?? null,
              category: payload.categoryId ? { id: payload.categoryId, name: p?.category?.name ?? "—" } : p.category
            })
          : p
      )
      return sampleProducts.find(p => p.id === id)
    }
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
