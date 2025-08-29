<template>
  <div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <h5 class="fw-bold m-0">Thông tin chi tiết sản phẩm</h5>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary" @click="$router.back()">← Quay lại</button>
        
      </div>
    </div>

    <div v-if="loading" class="alert alert-info">Đang tải dữ liệu...</div>
    <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

    <div v-else class="row g-4">
      
      <div class="col-12 col-md-4">
        <div class="border rounded p-2 text-center bg-light">
          <img
            v-if="mainImage"
            :src="mainImage"
            alt="product"
            class="img-fluid"
          />
          <div v-else class="py-5 text-muted">Ảnh sản phẩm</div>
        </div>
      </div>

     
      <div class="col-12 col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h4 class="fw-bold mb-2">{{ display(product.name) }}</h4>

            <div class="mb-3">
              <div class="text-muted small">SKU</div>
              <div>{{ display(product.sku) }}</div>
            </div>

            <div class="mb-3">
              <div class="text-muted small">Mã sản phẩm (ID)</div>
              <div class="fw-medium">{{ product.id }}</div>
            </div>

            <div class="row">
              <div class="col-sm-6 mb-3">
                <div class="text-muted small">Thương hiệu</div>
                <div>{{ display(product.brand) }}</div>
              </div>
        
              <div class="col-sm-6 mb-3">
                <div class="text-muted small">Màu sắc</div>
                <div>{{ display(product.color) }}</div>
              </div>
              <div class="col-sm-6 mb-3">
                <div class="text-muted small">Dung lượng/Lưu trữ</div>
                <div>{{ display(product.storage) }}</div>
              </div>
              <div class="col-sm-6 mb-3">
                <div class="text-muted small">Tồn kho (quantity)</div>
                <div>{{ product?.quantity ?? 0 }}</div>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-muted small mb-1">Thông số kỹ thuật</div>
              <template v-if="parsedSpecs.length">
                <ul class="mb-0">
                  <li v-for="(s, i) in parsedSpecs" :key="i">{{ s }}</li>
                </ul>
              </template>
              <template v-else>
                <pre class="mb-0" style="white-space: pre-wrap;">{{ display(product.specifications) }}</pre>
              </template>
            </div>

            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-warning" @click="editProduct">Sửa</button>
              <button class="btn btn-outline-secondary" @click="$router.back()">Quay lại</button>
              
              <button class="btn btn-outline-primary" @click="goList">Xem danh sách</button>
            </div>

            <div class="small text-muted mt-3">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { productService } from "../../services/productService";


const sampleProducts = [
  {
    id: "379230b1-879e-4148-b5d3-285127d615de",
    sku: "SKU-DXPS13",
    name: "Laptop Dell XPS 13",
    brand: "Dell",
    specifications: [
      "CPU: Intel Core i7 (U-series)",
      "RAM: 16GB LPDDR5",
      "SSD: 512GB NVMe",
      "Màn hình: 13.4\" FHD+",
      "Cân nặng: 1.2kg"
    ],
    color: "Bạc",
    storage: "512GB",
    categoryId: "465f30bd-1b64-4139-89ce-c31682bd8788",
    quantity: 8,
    images: ["https://dellxps.com.vn/library/module_new/dell-xps-13-9315-i7-1250u-ram-16gb-ssd-512gb-man-hinh-13-4-inch-fhd-ips-likenew_s4319.jpg"]
  }
];

function getSampleByIdOrDefault(id) {
  return sampleProducts.find(p => p.id === id) || sampleProducts[0];
}
function mergeWithSample(apiData, sample) {
  return { ...sample, ...apiData };
}

export default {
  name: "ProductDetail",
  data() {
    return {
      loading: true,
      errorMsg: "",
      product: {},
      mainImage: ""
    };
  },
  computed: {
    parsedSpecs() {
      const specs = this.product?.specifications;
      if (!specs) return [];
      if (Array.isArray(specs)) return specs;
      try {
        const parsed = JSON.parse(specs);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
  },
  methods: {
    display(val) {
      return val === null || val === undefined || val === "" ? "Chưa cập nhật" : val;
    },
    async fetchProduct() {
      this.errorMsg = "";
      this.loading = true;

      const id = String(this.$route.params.id || "");

      try {
      
        const apiData = await productService.getProductById(id);

        if (!apiData || !apiData.id) {
          const fallback = getSampleByIdOrDefault(id);
          this.product = fallback;
          this.mainImage = (fallback.images && fallback.images[0]) || "";
        } else {
          const sample = getSampleByIdOrDefault(id);
          const merged = mergeWithSample(apiData, sample);
          this.product = merged;
          this.mainImage = (merged.images && merged.images[0]) || (sample.images && sample.images[0]) || "";
        }
      } catch (e) {
        const fallback = getSampleByIdOrDefault(id);
        this.product = fallback;
        this.mainImage = (fallback.images && fallback.images[0]) || "";
        this.errorMsg = ""; 
      } finally {
        this.loading = false;
      }
    },
    goLogin() {
      this.$router.push("/login");
    },
    goList() {
      this.$router.push("/products");
    },
    editProduct() {
      alert("Demo: Điều hướng đến trang sửa sản phẩm");
      
    },
    buyNow() {
      alert("Demo: Mua ngay");
    }
  },
  created() {
    this.fetchProduct();
  },
  watch: {
    "$route.params.id"() {
      this.fetchProduct();
    }
  }
};
</script>

<style scoped>
.card { border-radius: 12px; }
img.img-fluid { max-height: 320px; object-fit: cover; }
</style>
