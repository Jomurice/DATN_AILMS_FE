
import api from "./axios";


let sampleCategories = [
  {
    id: "9e0b6b4f-4a9a-4f6d-8e6b-111111111111",
    name: "Laptop",
    description: "Các dòng máy tính xách tay",
    productCount: 12
  },
  {
    id: "c22c1a1a-7b52-4a9f-9a33-222222222222",
    name: "Phụ kiện",
    description: "Dock, cáp, chuột, bàn phím...",
    productCount: 34
  },
  {
    id: "465f30bd-1b64-4139-89ce-c31682bd8788",
    name: "Ultrabook",
    description: "Mỏng nhẹ hiệu năng tốt",
    productCount: 5
  }
];


const sampleBrands = [
  { id: "brand-dell", name: "Dell", count: 10 },
  { id: "brand-apple", name: "Apple", count: 8 },
  { id: "brand-ugreen", name: "Ugreen", count: 6 },
  { id: "brand-logitech", name: "Logitech", count: 5 },
];

export const categoryService = {
 
async getById(id) {
  try {
    const { data } = await api.get(`/api/categories/${encodeURIComponent(id)}`);
    const item = data?.result ?? data;
    if (item && item.id) return item;                 

 
    const fb = sampleCategories.find(c => c.id === id);
    return fb || null;
  } catch {
    const fb = sampleCategories.find(c => c.id === id);
    return fb || null;
  }
},


async list() {
  try {
    const { data } = await api.get('/api/categories');
    const out = Array.isArray(data?.result) ? data.result
              : (Array.isArray(data) ? data : null);
    return (Array.isArray(out) && out.length > 0) ? out : sampleCategories;
  } catch {
    return sampleCategories;
  }
},


  async create(payload) {
   
    try {
      const { data } = await api.post('/api/categories', payload);
      return data?.result ?? data;
    } catch {
      
      const newItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(16) + Math.random().toString(16).slice(2)),
        name: payload.name,
        description: payload.description ?? "",
        productCount: 0
      };
      sampleCategories = [newItem, ...sampleCategories];
      return newItem;
    }
  },

  async update(id, payload) {
    try {
      const { data } = await api.put(`/api/categories/${encodeURIComponent(id)}`, payload);
      return data?.result ?? data;
    } catch {
      
      sampleCategories = sampleCategories.map(c =>
        c.id === id ? { ...c, name: payload.name, description: payload.description ?? c.description } : c
      );
      return sampleCategories.find(c => c.id === id);
    }
  },

  async remove(id) {
    try {
      await api.delete(`/api/categories/${encodeURIComponent(id)}`);
      return true;
    } catch {
      sampleCategories = sampleCategories.filter(c => c.id !== id);
      return true;
    }
  },

  
  async brands() {
    try {
      const { data } = await api.get('/api/brands'); 
      const out = Array.isArray(data?.result) ? data.result : (Array.isArray(data) ? data : null);
      return out ?? sampleBrands;
    } catch {
      return sampleBrands;
    }
  }
};
