import api from "./axios";

const sampleProducts = [
  {
    id: "379230b1-879e-4148-b5d3-285127d615de",
    sku: "SKU-DXPS13",
    name: "Laptop Dell XPS 13",
    brand: null,
    specifications: null,
    color: null,
    storage: null,
    categoryId: "465f30bd-1b64-4139-89ce-c31682bd8788",
    quantity: 8
  },
  
  {
    id: "f9a0d2d1-1111-4c11-a0c0-111111111111",
    sku: "SKU-M15AIR",
    name: "MacBook Air 15”",
    brand: "Apple",
    specifications: "M2, 8GB, 256GB",
    color: "Midnight",
    storage: "256GB",
    categoryId: "cat-laptop",
    quantity: 3
  },
  {
    id: "a2b3c4d5-2222-4c22-a0c0-222222222222",
    sku: "SKU-UDOCK",
    name: "Ugreen USB-C Dock",
    brand: "Ugreen",
    specifications: "8-in-1",
    color: "Gray",
    storage: null,
    categoryId: "cat-accessory",
    quantity: 0
  }
];

const sampleCategories = [
  { id: "465f30bd-1b64-4139-89ce-c31682bd8788", name: "Ultrabook" },
  { id: "cat-laptop", name: "Laptop" },
  { id: "cat-accessory", name: "Phụ kiện" }
];

export const productService = {
  async getAllProducts() {
    try {
      const { data } = await api.get("/api/products");
      return (Array.isArray(data?.result) ? data.result : data) ?? sampleProducts;
    } catch {
      return sampleProducts;
    }
  },
  async getProductById(id) {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      return data?.result ?? data ?? sampleProducts.find(p => p.id === id);
    } catch {
      return sampleProducts.find(p => p.id === id);
    }
  },
  async getCategories() {
    try {
      const { data } = await api.get("/api/categories");
      return Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : sampleCategories);
    } catch {
      return sampleCategories;
    }
  }
};


