<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex mb-3 align-items-center justify-content-between">
      <div class="search">
        <input
          type="text"
          class="form-control"
          placeholder="Nhập tên hàng hóa"
          v-model="keyword"
          @input="onSearch"
        />
      </div>

      <h2>Hàng hóa</h2>

      <div class="badge-card">
        <div class="text-muted small">
          Tổng sản phẩm:
          <span class="num">{{ pages?.totalElements || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- MAIN -->
    <div class="card border-0 shadow-sm rounded-3">
      <!-- FILTER BAR -->
      <div class="p-3 d-flex gap-3 justify-content-end align-items-center">
        <!-- BRAND -->
        <select
          class="form-select rounded-3"
          style="max-width: 200px"
          v-model="selectedBrandId"
          @change="onFilterChange"
        >
          <option :value="null">-- Hãng --</option>
          <option v-for="b in brands" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>

        <!-- CATEGORY -->
        <select
          class="form-select rounded-3"
          style="max-width: 200px"
          v-model="selectedCategoryId"
          @change="onFilterChange"
        >
          <option :value="null">-- Loại --</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <!-- ADD -->
        <button
          v-if="rolesLoaded && (role === 'ADMIN')"
          class="btn btn-success btn-sm"
          @click="$router.push('/product/add')"
        >
          + Thêm
        </button>

        <!-- PAGE SIZE -->
        <div class="d-flex align-items-center">
          <span class="me-2">Số mục</span>
          <select
            class="form-select"
            style="max-width: 90px"
            v-model="size"
            @change="changeSize"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-wrapper">
        <table class="table table-hover mb-0">
          <thead>
            <tr class="table-primary text-uppercase small fw-bold">
              <th class="ps-4">SKU</th>
              <th>Tên</th>
              <th>Hãng</th>
              <th>Loại</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td class="ps-4">{{ p.sku }}</td>
              <td>{{ p.name }}</td>
              <td>{{ p.brandName }}</td>
              <td>{{ p.categoryName }}</td>
              <td class="text-center">
                <button
                  class="btn btn-sm btn-outline-info me-1"
                  @click="openDetail(p.id)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button v-if="rolesLoaded && (role === 'ADMIN')"
                  class="btn btn-sm btn-outline-warning"
                  @click="$router.push(`/product/${p.id}/edit`)"
                >
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>

            <tr v-if="isLoading">
              <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </td>
            </tr>

            <tr v-if="!isLoading && products.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="d-flex justify-content-end p-3 bg-light">
        <nav v-if="pages?.totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="pages.number === 0"
            @click="changePage(pages.number - 1)"
          >
            ‹
          </button>

          <button
            v-for="p in pages.totalPages"
            :key="p"
            class="page-btn"
            :class="{ active: p - 1 === pages.number }"
            @click="changePage(p - 1)"
          >
            {{ p }}
          </button>

          <button
            class="page-btn"
            :disabled="pages.number === pages.totalPages - 1"
            @click="changePage(pages.number + 1)"
          >
            ›
          </button>
        </nav>
      </div>
    </div>

    <!-- DETAIL -->
    <div v-if="isDetailProduct" class="modal-overlay">
      <product-detail :node="product" @close="isDetailProduct = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProductDetail from './ProductDetail.vue'
import { productService } from '../../services/product/productService'
import { brandService } from '../../services/brandService'
import { categoryService } from '../../services/categoryService'
import { toast } from 'vue-sonner'
import { tokenService } from '../../services/TokenService'

/* STATE */
const products = ref([])
const product = ref({})

const brands = ref([])
const categories = ref([])

const keyword = ref('')
const selectedBrandId = ref(null)
const selectedCategoryId = ref(null)

const page = ref(0)
const size = ref(10)
const pages = ref(null)

const isLoading = ref(false)
const isDetailProduct = ref(false)


const role = ref("");
const rolesLoaded = ref(false);

const authState = tokenService();


function loadUserRole() {

  role.value = authState.role || "";  
  rolesLoaded.value = true;
}

/* LOAD PRODUCTS */
async function loadProducts() {
  isLoading.value = true
  try {
    pages.value = await productService.searchProducts({
      page: page.value,
      size: size.value,
      name: keyword.value || null,
      brandId: selectedBrandId.value,
      categoryId: selectedCategoryId.value
    })
    products.value = pages.value?.content || []
  } catch {
    toast.error('Lỗi tải dữ liệu')
  } finally {
    isLoading.value = false
  }
}
async function loadFilters() {
  try {
    brands.value = await brandService.getAllBrand()
    categories.value = await categoryService.getAll()
  } catch {
    toast.error('Lỗi tải dữ liệu lọc')
  }
}



/* SEARCH */
let timeout = null
function onSearch() {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    page.value = 0
    loadProducts()
  }, 400)
}

function onFilterChange() {
  page.value = 0
  loadProducts()
}

/* PAGINATION */
function changePage(p) {
  if (p < 0 || p >= pages.value.totalPages) return
  page.value = p
  loadProducts()
}

function changeSize() {
  page.value = 0
  loadProducts()
}

/* DETAIL */
async function openDetail(id) {
  product.value = await productService.getById(id)
  isDetailProduct.value = true
}

/* INIT */
onMounted(async () => {
  loadUserRole();
  loadFilters();
  loadProducts();
})
</script>

<style scoped>
.search {
  width: 220px;
}

.badge-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 6px 14px;
}

.badge-card .num {
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
}

/* PAGINATION */
.pagination {
  display: flex;
  gap: 6px;
}

.page-btn {
  border: none;
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
}

.page-btn:hover:not(:disabled) {
  background: #e9f2ff;
}

.page-btn.active {
  background: #0d6efd;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
