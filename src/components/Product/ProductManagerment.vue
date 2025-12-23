<template>
  <div>
    <div class="d-flex mb-3 align-items-center justify-content-between flex-wrap gap-2">
      <div class="search p-0">
        <input 
          type="text" 
          class="form-control shadow-sm" 
          placeholder="Nhập tên hàng hóa..." 
          v-model="keyword"
          @keyup.enter="handleSearch"
        />
      </div>

      <h2 class="m-0 text-uppercase fw-bold" style="color: #444;">Hàng hóa</h2>

      <div class="badge-card shadow-sm">
        <div class="text-muted small">Tổng sản phẩm: <span class="num text-primary">{{ pages?.totalElements || 0 }}</span></div>
      </div>
    </div>

    <div class="main card border-0 shadow-sm rounded-3">
      
      <div class="m-2 d-flex gap-3 align-items-center justify-content-between flex-wrap p-2 border-bottom">
        
        <div class="d-flex gap-3 align-items-center">
          

          <div class="d-flex align-items-center gap-2">
            <span class="small fw-bold text-muted">Loại hàng:</span>
            <select class="form-select form-select-sm border shadow-sm rounded-3" 
                    style="width: 160px;" v-model="selectedCategoryId" @change="handleFilterChange">
              <option :value="null">Tất cả loại</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="d-flex align-items-center gap-2">
            <span class="small fw-bold text-muted">Thương hiệu:</span>
            <select class="form-select form-select-sm border shadow-sm rounded-3" 
                    style="width: 140px;" v-model="selectedBrandId" @change="handleFilterChange">
              <option :value="null">Tất cả hãng</option>
              <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <div class="d-flex gap-3 align-items-center">
          <button v-if="rolesLoaded && (role === 'ADMIN')" class="btn btn-success btn-sm px-3 rounded-3 shadow-sm" @click="$router.push('/product/add')">
            + Thêm mới
          </button>

          <div class="sizePage d-flex align-items-center rounded-3">
            <span class="small fw-bold text-muted"></span>
            <select class="form-select mx-2 rounded-3 border shadow-sm" 
                    style="width: 75px;" v-model="size" @change="handleFilterChange">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="table table-hover mb-0">
          <thead class="table-primary">
            <tr class="text-uppercase small fw-bold">
              <th class="ps-4">Mã SKU</th>
              <th class="cp" @click="selectSort()">
                Tên sản phẩm
                <i v-if="isSort" class="fa-solid fa-arrow-up ms-2 text-primary"></i>
                <i v-else class="fa-solid fa-arrow-down ms-2 text-primary"></i>
              </th>
              <th>Thương hiệu</th>
              <th>Loại hàng</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td class="ps-4 fw-bold text-muted small">{{ p.sku }}</td>
              <td class="text-wrap" style="max-width: 350px;">{{ p.name }}</td>
              <td>{{ p.brandName }}</td>
              <td>{{ p.categoryName }}</td>
              
              <td class="text-center">
                <button class="btn btn-sm btn-light border-0 text-info me-1" @click="isDetailProduct = true, getByProductId(p.id)">
                  <i class="fas fa-eye"></i>
                </button>
                <button v-if=" rolesLoaded && (role === 'ADMIN')" class="btn btn-sm btn-light border-0 text-warning me-1" @click="$router.push(`/product/${p.id}/edit`)">
                  <i class="fas fa-edit"></i>
                </button>

              </td>
            </tr>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="bg-light p-2 d-flex align-items-center justify-content-end border-top">
          <nav v-if="pages?.totalPages > 1" class="page d-flex fs-5 gap-3">
            <span class="cp fw-bold" :class="{ 'text-muted': page === 0 }" @click="changePage(page - 1)">&lt;</span>
            <div class="d-flex gap-2">
              <span v-for="p in pages.totalPages" :key="p"
                 class="cp px-2"
                 :class="{ 'text-primary fw-bold border-bottom border-2 border-primary': page === p - 1 }"
                 @click="changePage(p - 1)">
                {{ p }}
              </span>
            </div>
            <span class="cp fw-bold" :class="{ 'text-muted': page === pages.totalPages - 1 }" @click="changePage(page + 1)">&gt;</span>
          </nav>
        </div>
      </div>
    </div>

    <div v-if="isDetailProduct" class="modal-overlay" @click.self="isDetailProduct = false">
      <product-detail :node="product" @close="isDetailProduct = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ProductDetail from './ProductDetail.vue'
import { productService } from '../../services/product/productService'
import { brandService } from '../../services/brandService'
import { categoryService } from '../../services/categoryService'
import { productDetailService } from '../../services/product/productDetailService'
import { toast } from 'vue-sonner'
import { tokenService } from "../../services/TokenService";

const role = ref("");
const rolesLoaded = ref(false);

const authState = tokenService();


function loadUserRole() {

  role.value = authState.role || "";  
  rolesLoaded.value = true;
}

const products = ref([]);
const product = ref({});
const categories = ref([]); 
const brands = ref([]);
const pages = ref(null);

const isLoading = ref(false);
const isDetailProduct = ref(false);

const keyword = ref('');
const page = ref(0);
const size = ref(10);
const selectedBrandId = ref(null);
const selectedCategoryId = ref(null);
const isStatus = ref('all');
const isSort = ref(true);

async function loadProducts() {
  isLoading.value = true;
  try {
    const response = await productService.searchProducts({
      page: page.value,
      size: size.value,
      name: keyword.value || null,
      brandId: selectedBrandId.value,
      categoryId: selectedCategoryId.value
    });
    pages.value = response;
    products.value = response?.content || [];
  } catch (e) {
    toast.error('Lỗi tải danh sách sản phẩm');
  } finally {
    isLoading.value = false;
  }
}


async function loadFilters() {
  try {
    const brandData = await brandService.getAllBrand();
    const categoryData = await categoryService.getAll();
    
    // Если API возвращает { code, result: [...] }, извлекаем result
    brands.value = brandData.result || brandData;
    categories.value = categoryData.result || categoryData;
    
  } catch (e) {
    toast.error('Lỗi tải dữ liệu lọc');
    console.error(e);
  }
}

const handleSearch = () => { page.value = 0; loadProducts(); };
const handleFilterChange = () => { page.value = 0; loadProducts(); };
const selectStatus = (val) => { isStatus.value = val; handleFilterChange(); };
const selectSort = () => { isSort.value = !isSort.value; };

function changePage(newPage) {
  if (newPage >= 0 && newPage < (pages.value?.totalPages || 0)) {
    page.value = newPage;
    loadProducts();
  }
}

async function getByProductId(id) {
  try {
    const pBase = await productService.getById(id);
    const pDetail = await productDetailService.getByProductId(id);
    product.value = { ...pBase, ...pDetail };
  } catch (error) {
    toast.error('Không tìm thấy chi tiết sản phẩm');
  }
}

onMounted(() => {
  loadUserRole();
  loadFilters();
  loadProducts();
});
</script>

<style scoped>
.search { flex: 0 0 350px; }
.form-control { border: none; border-radius: 10px; padding: 10px 15px; }
.badge-card { background: #fff; border-radius: 10px; padding: 10px 20px; font-weight: bold; }
.btn-status { padding: 4px 12px; border: none; background: transparent; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; }
.btn-status.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #0d6efd; font-weight: bold; }
.cp { cursor: pointer; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.text-wrap { white-space: normal !important; word-break: break-word; }
</style>