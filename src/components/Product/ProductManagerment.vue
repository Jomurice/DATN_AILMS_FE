<!-- src/components/Product/ProductManagement.vue -->
<template>
  <div class="pbox">

    <div class="d-flex mb-2 justify-content-between">
      <div class=" col-md-3 p-0">
        <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên sản phẩm..." />
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

      <aside class=" card d-flex gap-3 border-0 shadow-sm rounded-3 p-2 side">

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

        <div class="asideChildren">
          <h5>Sắp xếp</h5>

          <select v-model="tableSort" class=" form-select form-select-sm w-100">
            <optgroup label="Theo tên">
              <option value="name_asc">Tên A → Z</option>
              <option value="name_desc">Tên Z → A</option>
            </optgroup>
            <optgroup label="Theo loại">
              <option value="cat_asc">Loại A → Z</option>
              <option value="cat_desc">Loại Z → A</option>
            </optgroup>
          </select>

        </div>
      </aside>


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

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr class="text-uppercase table-primary small fw-bold">
                <th class="ps-4">Mã</th>
                <th>Ô</th>
                <th>Trạng thái</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in productRows" :key="p.id">
                <td class="ps-4">{{ p.serialNumber }}</td>
                <td>{{ p.binId }}</td>
                <td>{{ p.status }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-info me-1" title="Chi tiết hàng hóa"
                    @click="isDetailProduct = true, getProductById(p.productId)">
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
              <tr v-if="!loading && productRows.length === 0">
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

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-dark" role="status"></div>
            <div class="small text-muted mt-2">Đang tải dữ liệu...</div>
          </div>

          <p v-if="error" class="text-danger small p-3">{{ error }}</p>
        </div>
      </div>
    </div>


    <div v-if="isDetailProduct" class="d-flex align-items-center justify-content-center modal-overlay">
      <div class="card w-50 p-2">
        <div class="d-flex align-items-center justify-content-between">
          <h3>Chi tiết hàng hóa</h3>
          <p class="fs-4 exit" @click="exitModal()">X</p>
        </div>
        <nav class="product-info gap-4 mt-3">
          <p><span class="fw-bold">Mã SKU:</span> {{ product.sku }}</p>
          <p><span class="fw-bold">Tên:</span> {{ product.name }}</p>
          <p><span class="fw-bold">Loại:</span> {{ product.categoryName }}</p>
          <p><span class="fw-bold">Màu:</span></p>
          <p><span class="fw-bold">Hãng:</span> {{ product.brandName }}</p>
          <p><span class="fw-bold">Thuộc tính khác:</span></p>
          <p><span class="fw-bold">Thông số kỹ thuật:</span> {{ product.specifications }}</p>
        </nav>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import TreeItem from '../menu/TreeItem.vue'
import { productDetailService } from '../../services/productDetailService'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'
import { menuService } from '../../services/MenuService'

const products = ref([]);
const product = ref({});
const categories = ref([]);
const menus = ref([]);
const loading = ref(true)
const error = ref('')
const isDetailProduct = ref(false);
const isStatus = ref('all');
const filters = ref({ keyword: '', category: '' })
const applied = ref({ ...filters.value })
const tableSort = ref('cat_asc')

const opened = ref(new Set())
const selectedNode = ref({ type: 'all' })

// Helpers
const S = x => String(x ?? '')
const unaccent = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const catName = id => categories.value.find(c => S(c.id) === S(id))?.name || '—'

// Load data (có fallback sang sample trong service)


const displayed = computed(() => {
  let list = [...products.value];
  list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" }))

  if (applied.value.keyword?.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase());
    list = list.filter((p) => unaccent((p.name || "").toLowerCase()).includes(kw));
  }

  if (applied.value.category) {
    list = list.filter((p) => (p.categoryId) === applied.value.category);
  }

  // if (applied.value.quantity !== null && applied.value.quantity >= 0) {
  //   list = list.filter((p) => (p.quantity ?? 0) === applied.value.quantity);
  // }


  switch (applied.value.sort) {
    case "name_asc": list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi", { sensitivity: "base" })); break;
    case "name_desc": list.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi", { sensitivity: "base" })); break;
    case "cat_asc": list = sortProductByNameCategories(list, "asc"); break;
    case "cat_desc": list = sortProductByNameCategories(list, "desc"); break;
    // case "qty_asc": list.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0)); break;
    // case "qty_desc": list.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0)); break;
  }
  return list;
});

function applyFilters() { applied.value = { ...filters.value }; }
function resetFilters() {
  filters.value = { keyword: "", category: "", quantity: null, sort: "cat_asc" };
  applied.value = { ...filters.value };
}

// giữ nguyên khi category bên BE có dữ liệu và khi có dữ liệu thì xóa hoặc comment loadAll bên dưới 
function selectStatus(value) {
  isStatus.value = value
}

const isOpen = id => opened.value.has(S(id))
const toggle = id => isOpen(id) ? opened.value.delete(S(id)) : opened.value.add(S(id))
const selectNode = node => {
  selectedNode.value = node
}

const isSelected = node => selectedNode.value?.title === node?.title && S(selectedNode.value?.id) === S(node?.id)

async function loadAll() {
  try {
    products.value = await productDetailService.getAllProduct();
    // product.value = await productService.getById(product.value.productId);
    categories.value = await categoryService.getAll();
    menus.value = await menuService.getAllMenuTree();

  } catch (e) {
    error.value = e?.message || 'Lỗi tải dữ liệu'
  } finally {
    loading.value = false
  }

  console.log(isDetailProduct.value)
}


function getProductByIdTree() {
  if (selectedNode.value.title === 'Menu') return loadAll();
}

async function getProductById(id) {
  try {
    product.value = await productService.getById(id);
    console.log(product.value);
  } catch (error) {
    console.log("error", error);
  }
}

function exitModal() {
  isDetailProduct.value = false;
}

onMounted(() => {
  loadAll();
})

const treeData = computed(() =>
  categories.value.map(cat => {
    const prods = products.value.filter(p => S(p.categoryId) === S(cat.id))
    const brandNames = [...new Set(prods.map(p => (p.brand || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }))
    const brands = brandNames.map(bn => ({
      id: `${S(cat.id)}::${bn}`,
      label: bn,
      type: 'brand',
      parentId: S(cat.id),
      children: prods
        .filter(p => (p.brand || '').trim().toLowerCase() === bn.toLowerCase())
        .map(p => ({ id: S(p.id), label: p.name, type: 'product' }))
    }))
    return { id: S(cat.id), label: cat.name, type: 'category', children: brands }
  })
)



const baseFiltered = computed(() => {
  let list = [...products.value]

  if (applied.value.keyword.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase())
    list = list.filter(p => unaccent((p.name || '').toLowerCase()).includes(kw))
  }
  if (applied.value.category) list = list.filter(p => S(p.categoryId) === S(applied.value.category))

  const sel = selectedNode.value
  if (sel?.type === 'category') {
    list = list.filter(p => S(p.categoryId) === S(sel.id))
  } else if (sel?.type === 'brand') {
    const [catId, brand] = S(sel.id).split('::')
    list = list.filter(p => S(p.categoryId) === S(catId) && (p.brand || '').trim().toLowerCase() === brand.trim().toLowerCase())
  } else if (sel?.type === 'product') {
    list = list.filter(p => S(p.id) === S(sel.id))
  }

  switch (tableSort.value) {
    case 'name_asc': list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi', { sensitivity: 'base' })); break
    case 'name_desc': list.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'vi', { sensitivity: 'base' })); break
    case 'cat_asc': {
      const cmap = new Map(categories.value.map(c => [S(c.id), c.name]))
      list.sort((a, b) => (cmap.get(S(a.categoryId)) || '').localeCompare(cmap.get(S(b.categoryId)) || '', 'vi', { sensitivity: 'base' })); break
    }
    case 'cat_desc': {
      const cmap = new Map(categories.value.map(c => [S(c.id), c.name]))
      list.sort((a, b) => (cmap.get(S(b.categoryId)) || '').localeCompare(cmap.get(S(a.categoryId)) || '', 'vi', { sensitivity: 'base' })); break
    }
    case 'storage_asc': list.sort((a, b) => S(a.storage).localeCompare(S(b.storage))); break
    case 'storage_desc': list.sort((a, b) => S(b.storage).localeCompare(S(a.storage))); break
  }
  return list
})

const tableMode = computed(() => selectedNode.value?.type === 'category' ? 'brand' : 'product')
const tableTitle = computed(() => {
  const sel = selectedNode.value
  if (sel?.type === 'category') return `Hãng trong “${sel.label}”`
  if (sel?.type === 'brand') return `Sản phẩm của “${sel.label}”`
  if (sel?.type === 'product') return `Sản phẩm: ${baseFiltered.value[0]?.name || ''}`
  return 'Danh sách sản phẩm'
})

const productRows = computed(() => baseFiltered.value)

productRows.value = computed(() => {
  const sel = selectedNode.value
  if (sel?.type !== 'category') return []
  const inCat = products.value.filter(p => S(p.categoryId) === S(sel.id))
  const map = new Map()
  for (const p of inCat) {
    const bn = (p.brand || '').trim() || '—'
    const key = `${S(sel.id)}::${bn}`
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, name: key.split('::')[1], count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }))
})

const totalDisplayed = computed(() => tableMode.value === 'brand' ? productRows.value.length : productRows.value.length)
const outOfStock = computed(() => tableMode.value === 'brand' ? 0 : productRows.value.filter(x => (x.quantity ?? 0) === 0).length)
const nearlyOut = computed(() => tableMode.value === 'brand' ? 0 : productRows.value.filter(x => (x.quantity ?? 0) > 0 && (x.quantity ?? 0) < 5).length)


async function removeProduct(id) {
  if (!confirm('Xoá sản phẩm này?')) return
  try {
    await productService.removeProduct(id)
    products.value = products.value.filter(p => S(p.id) !== S(id))
  } catch { }
}


</script>

<style scoped>
/* .pbox {
  display: flex;
  flex-direction: column;
  gap: 16px;
} */

.side {
  width: 18%;
  height: calc(100vh - 200px);
  overflow: auto;
}

.main {
  flex: 1 1 auto;
  min-width: 0;
  height: calc(100vh - 200px);
  overflow: auto;
}

.product-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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

.form-control {
  width: 270px;
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

.table th,
.table td {
  vertical-align: middle;
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