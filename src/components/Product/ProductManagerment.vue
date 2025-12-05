<template>
  <div>

    <div class="d-flex mb-2 align-items-center justify-content-between">

      <div class=" search p-0">
        <input type="text" class="form-control" placeholder="Nhập tên hàng hóa" />
      </div>

      <h2>Hàng hóa</h2>

      <div class="d-flex gap-2">
        <div class="badge-card">
          <div class="text-muted small">Tổng sản phẩm: <span class="num">{{ totalDisplayed }}</span></div>
        </div>
        <div class="badge-card">
          <div class="text-muted small">Hết hàng: <span class="num">{{ outOfStock }}</span></div>
        </div>
        <div class="badge-card">
          <div class="text-muted small">Sắp hết (&lt;5) : <span class="num">{{ nearlyOut }}</span></div>
        </div>
      </div>

    </div>


    <div class="d-flex gap-4">

      <aside class=" card d-flex gap-3 border-0 shadow-sm rounded-3 p-2 side" v-if="isAsideOpen">

        <button v-if="isAsideOpen" class="btn toggle-btn" @click="toggleAside">
          <i class="fas fa-angle-left"></i>
        </button>

        <div class="asideChildren">
          <tree-item v-if="menus" :node="menus" :toggle="toggle" :is-open="isOpen" :is-selected="isSelected"
            :select-node="selectNode" />
        </div>

        <div class="asideChildren">
          <h5>Trạng thái</h5>
          <button @click="selectStatus('all')" :class="{ active: isStatus === 'all' }">Tất cả</button>
          <button @click="selectStatus(true)" :class="{ active: isStatus === true }">Hoạt động</button>
          <button @click="selectStatus(false)" :class="{ active: isStatus === false }">Khóa</button>
        </div>

      </aside>
      <button v-if="!isAsideOpen" class="btn p-0 open-btn" @click="toggleAside">
        <i class="fas fa-angle-right"></i>
      </button>


      <div class="main card border-0 shadow-sm rounded-3">
        <div class="m-2 d-flex gap-3 align-items-center justify-content-end">
          <button class="btn btn-success btn-sm col-md-1 " @click="$router.push('/product/add')">+ Thêm</button>
          <!-- page -->
          <div class="sizePage p-2 d-flex align-items-center rounded-3 justify-content-end">
            Số mục
            <select class="form-select mx-2 rounded-3">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table table-hover mb-0">
            <thead class="scroll-body">
              <tr class="text-uppercase table-primary small fw-bold">
                <th class="ps-4">Mã</th>
                <th class="name" @click="selectSort()">
                  Tên
                  <i v-if="isSort" class="fa-solid fa-arrow-up ms-2"></i>
                  <i v-else class="fa-solid fa-arrow-down ms-2"></i>
                </th>
                <th>Hãng</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id">
                <td class="ps-4">{{ p.sku }}</td>
                <td>{{ p.name }}</td>
                <td>{{ p.brandName }}</td>
                <td>{{ p.categoryName }}</td>
                <td>{{ p.status }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-info me-1" title="Chi tiết hàng hóa"
                    @click="isDetailProduct = true, getByProductId(p.id)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-warning me-1" title="Sửa thông tin hàng hóa"
                    @click="$router.push(`/product/${p.id}/edit`)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="removeProduct(p.id)" title="Ẩn hàng hóa">
                    <i class="fas fa-eye-slash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="isLoading" class="text-center py-3">
                <td colspan="6">
                  <div class="spinner-border text-primary" role="status"></div>
                  <div class="small mx-2 fs-5 text-primary mt-2">Đang tải...</div>
                </td>
              </tr>
              <tr v-if="!isLoading && products.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>

          <!-- page -->
          <div class="sizePage bg-danger-subtle p-2 d-flex align-items-center justify-content-end">
            <nav v-if="pages?.totalPages > 1" class="page d-flex fs-4 gap-2">
              <!-- Last -->
              <p class="fw-bold" :class="{ 'text-muted': pages.number === 0 }" @click="changePage(pages.number - 1)">
                &lt;
              </p>

              <nav class="d-flex gap-2">
                <p v-for="p in visiblePages" :key="p"
                  :class="[{ 'fw-bold text-primary': p !== '...' && pages.number === p - 1 }, p === '...' ? 'text-muted' : '']"
                  @click="p !== '...' && changePage(p - 1)" class="m-0">
                  <span class="fs-5">{{ p }}</span>
                </p>
              </nav>

              <!-- Next -->
              <p class="fw-bold" :class="{ 'text-muted': pages.number === pages.totalPages - 1 }"
                @click="changePage(pages.number + 1)">
                &gt;
              </p>
            </nav>
          </div>

          <p v-if="error" class="text-danger small p-3">{{ error }}</p>
        </div>
      </div>


      <div v-if="isDetailProduct" class="d-flex align-items-center justify-content-center modal-overlay">
        <product-detail :node="product" @close="isDetailProduct = false" />
      </div>

      <!-- <div v-if="isLoading" class="modal-overlay text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <div class="small mx-2 fs-5 text-info mt-2">Đang tải...</div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import TreeItem from '../menu/TreeItem.vue'
import ProductDetail from './ProductDetail.vue'
import { productService } from '../../services/product/productService'
import { menuService } from '../../services/MenuService'
import { productDetailService } from '../../services/product/productDetailService'

const products = ref([]);
const product = ref([]);
const menus = ref([]);
const isLoading = ref(true)
const error = ref('')
const isDetailProduct = ref(false);
const isStatus = ref('all');
const isSort = ref(true);
const isAsideOpen = ref(true);
const tableSort = ref('cat_asc')


const S = x => String(x ?? '')
const unaccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// giữ nguyên khi category bên BE có dữ liệu và khi có dữ liệu thì xóa hoặc comment loadAll bên dưới 
const openNodes = reactive(new Set());
const selectedNodeId = ref(null);

function isOpen(id) {
  return openNodes.has(id);
}

function toggle(id, children = []) {
  if (openNodes.has(id)) {
    // Nếu đang mở → đóng lại
    closeChildrenRecursively(children);
    openNodes.delete(id);
  } else {
    openNodes.add(id);
  }
}

function toggleAside() {
  isAsideOpen.value = !isAsideOpen.value;
  console.log(isAsideOpen.value)
}

function closeChildrenRecursively(children) {
  for (const child of children) {
    // Nếu con đang mở thì đóng lại
    openNodes.delete(child.id);

    // Nếu node đang chọn là 1 trong các con thì clear selection
    if (selectedNodeId.value === child.id) {
      selectedNodeId.value = null;
    }

    // Kiểm tra sâu hơn
    if (child.children?.length) {
      closeChildrenRecursively(child.children);
    }
  }
}

function isSelected(node) {
  return selectedNodeId.value === node.id;
}

function selectNode(node) {
  selectedNodeId.value = node.id;
}

function selectSort() {
  if (isSort.value) {
    isSort.value = false;
    payload.value.pageable.sort = 'name,desc';
  } else {
    isSort.value = true;
    payload.value.pageable.sort = 'name,asc';
  }
}


async function loadAll() {
  isLoading.value = true
  try {
    products.value = await productService.getAll();
    menus.value = await menuService.getAllMenuTree();

  } catch (e) {
    error.value = e?.message || 'Lỗi tải dữ liệu'
  } finally {
    isLoading.value = false
  }

  console.log(isDetailProduct.value)
}


async function getByProductId(id) {
  try {
    product.value = await productService.getById(id);
    console.log('dsad', product.value);
    const p = await productDetailService.getByProductId(product.value.id);
    if (p) product.value = { ...product.value, ...p };
    console.log(product.value);
  } catch (error) {
    console.log("error", error);
  }
}

onMounted(() => {
  loadAll();
})

</script>

<style scoped>
.side {
  position: relative;
  max-width: 18%;
  height: calc(100vh - 200px);
  /* overflow: auto; */
  overflow: visible;
  transition: all 0.3s ease;
}

.toggle-btn {
  position: absolute;
  top: 50%;
  right: -16px;
  /* đẩy nút ra ngoài aside */
  transform: translateY(-50%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background: white;
  border: 1px solid #ddd;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 20;
}

.side:hover .toggle-btn {
  opacity: 1;
}

.toggle-btn:hover {
  border: 1px solid blue;
  color: blue;
}

.open-btn {
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translate(-50%, -50%);
  border-radius: 0 50% 50% 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background: white;
  border: 1px solid #ddd;
  width: 32px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.open-btn:hover {
  border: 1px solid blue;
  color: blue;
}

.main {
  flex: 1 1 auto;
  min-width: 0;
  /* height: calc(100vh - 200px);
  overflow: auto; */
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  background: rgba(0, 0, 0, 0.147);
  align-items: center;
  justify-content: center;
  z-index: 9999;
}


.asideChildren {
  min-width: 200px;
}

.asideChildren>h5 {
  margin-bottom: 10px;
}

.asideChildren>button {
  padding-left: 10px;
  padding-right: 10px;
  margin: 4px;
  border-radius: 30px;
  background-color: white;
  min-width: 70px;
  border: 1px solid grey;
}

.asideChildren>button.active {
  background-color: blue;
  color: white;
}

.exit {
  cursor: pointer !important;
}

.brand {
  font-weight: 700;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 18px;
}

.search {
  flex: 0 0 18%;
}

.form-control {
  width: 100%;
  border: none;
  border-radius: 10px;
}

.badge-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  padding: 8px 14px;
  max-width: 170px;
  max-height: 40px;
  text-align: center;
}

.badge-card .num {
  font-weight: 700;
  color: #1f2937;
}


.sizePage {
  max-height: 650px;
}

.page>p {
  max-height: 10px;
}

.page>nav>p>span {
  cursor: pointer;
}

.sizePage>.form-select {
  max-width: 70px;
}

.btn {
  max-height: 40px;
  min-width: 40px;
}

.table-wrapper {
  overflow-x: auto;
}

.table-wrapper table {
  width: fit-content;
  min-width: 100%;
}

.table {
  table-layout: fixed;
}

.name {
  cursor: pointer;
}

/* Sticky header */
/* .table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
} */

.table th,
.table td {
  min-width: 200px;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scroll-body {
  position: sticky;
  top: 0;
  z-index: 10;
}

@media (max-width:992px) {
  .pbox {
    flex-direction: column;
  }

  .side {
    width: 100%;
    height: auto;
    position: static;
  }
}
</style>