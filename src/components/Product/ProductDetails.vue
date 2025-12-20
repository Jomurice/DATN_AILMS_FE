<template>
  <div class="container-fluid py-4 bg-light min-vh-100">
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h5 class="mb-0">Danh sách chi tiết sản phẩm</h5>

        <!-- Bộ lọc (шаблон) -->
        <div class="d-flex gap-2 align-items-center flex-wrap">
          <!-- Бренд -->
          <div class="input-group input-group-sm" style="width: 220px;">
            <label class="input-group-text bg-white fw-semibold" for="brandFilter">
              Thương hiệu
            </label>
            <select id="brandFilter" class="form-select">
              <option value="">Tất cả</option>
              <option v-for="brand in brandList" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>

          <!-- Категория -->
          <div class="input-group input-group-sm" style="width: 220px;">
            <label class="input-group-text bg-white fw-semibold" for="categoryFilter">
              Danh mục
            </label>
            <select id="categoryFilter" class="form-select">
              <option value="">Tất cả</option>
              <option v-for="category in categoryList" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Поиск -->
          <div class="input-group input-group-sm" style="width: 260px;">
            <input type="text" class="form-control" placeholder="Nhập để tìm kiếm..." />
            <button class="btn btn-outline-secondary" type="button">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Số Serial</th>
              <th>Sản phẩm</th>
              <th>Kho</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Ngày cập nhật</th>
              <th>Người quét</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in productDetails" :key="item.serialNumber">
              <td>{{ item.serialNumber }}</td>
              <td>{{ productNames[item.productId] || 'Đang tải...' }}</td>
              <td>{{ warehouseNames[item.warehouseId] || 'Đang tải...' }}</td>
              <td>
                <span class="badge" :class="item.status === 'IN_WAREHOUSE' ? 'bg-success' : 'bg-secondary'">
                  {{ item.status }}
                </span>
              </td>
              <td>{{ formatDate(item.createdAt) }}</td>
              <td>{{ formatDate(item.updatedAt) }}</td>
              <td>{{ userNames[item.scannedByUserId] || 'Đang tải...' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border text-primary" role="status"> </div>
          <div class="small mx-2 fs-5 text-primary mt-2">Đang tải...</div>
        </div>

        <div v-if="!loading && productDetails.length === 0" class="text-center text-muted">
          Không có dữ liệu
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { productDetailsService } from "../../services/product/productDetailsService";
import { warehouseService } from "../../services/WarehouseService";
import { userService } from "../../services/UserService";
import { productService } from "../../services/product/productService";
import { brandService } from "../../services/BrandService";
import { categoryService } from "../../services/categoryService";
import { toast } from "vue-sonner";


const productDetails = ref([]);
const warehouseNames = ref({});
const userNames = ref({});
const productNames = ref({});
const brandList = ref([]);
const categoryList = ref([]);
const loading = ref(false);

onMounted(async () => {
  await getAllBrands();
  await getAllCategories(); 
  await getProductDetails();
});

async function getAllBrands() {
  try {
    const res = await brandService.getAllBrand();
    brandList.value = res || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách thương hiệu:", error);
  }
}

async function getAllCategories() {
  try {
    const res = await categoryService.getAll
    categoryList.value = res || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách danh mục:", error);
  }
}

async function getProductDetails() {
  try {
    loading.value = true;
    const result = await productDetailsService.getAll();
    productDetails.value = result;

    for (const item of result) {
      if (item.warehouseId && !warehouseNames.value[item.warehouseId]) {
        fetchWarehouseName(item.warehouseId);
      }
      if (item.scannedByUserId && !userNames.value[item.scannedByUserId]) {
        fetchUserName(item.scannedByUserId);
      }
      if (item.productId && !productNames.value[item.productId]) {
        fetchProductName(item.productId);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải product details:", error);
    toast.error("Lỗi tải danh sách chi tiết sản phẩm");
  } finally {
    loading.value = false;
  }
}

async function fetchWarehouseName(id) {
  try {
    const res = await warehouseService.getWarehouseById(id);
    warehouseNames.value[id] = res?.name || "Không rõ kho";
  } catch {
    warehouseNames.value[id] = "Không rõ kho";
  }
}

async function fetchUserName(id) {
  try {
    const res = await userService.getUserById(id);
    userNames.value[id] = res?.username || "Không rõ người quét";
  } catch {
    userNames.value[id] = "Không rõ người quét";
    toast.error("Lỗi tải tên người dùng");
  }
}

async function fetchProductName(id) {
  try {
    const res = await productService.getById(id);
    productNames.value[id] = res?.name || "Không rõ sản phẩm";
  } catch {
    productNames.value[id] = "Không rõ sản phẩm";
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("vi-VN");
}
</script>

<style scoped>
.table {
  vertical-align: middle;
}
.input-group-text {
  min-width: 90px;
}
</style>
