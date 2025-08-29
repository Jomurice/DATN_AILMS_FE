<template>
  <div class="container py-5">

    
    <div class="d-flex align-items-center justify-content-end flex-wrap gap-3 mb-4">
      <div class="d-flex gap-3">
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Tổng SP</div>
            <div class="fw-bold fs-5 text-dark">{{ displayed.length }}</div>
          </div>
        </div>
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Hết hàng</div>
            <div class="fw-bold fs-5 text-dark">{{ displayed.filter(x => (x.quantity ?? 0) === 0).length }}</div>
          </div>
        </div>
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Sắp hết (&lt;5)</div>
            <div class="fw-bold fs-5 text-dark">{{ displayed.filter(x => (x.quantity ?? 0) > 0 && (x.quantity ?? 0) < 5).length }}</div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="card border-0 bg-white rounded-3 p-4 mb-4">
      <h4 class="fw-bold text-dark mt-0">Tìm kiếm</h4>
      <div class="row g-3 align-items-end">
        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Tên sản phẩm</label>
          <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên sản phẩm..." />
        </div>

        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Loại sản phẩm</label>
          <select v-model="filters.category" class="form-select">
            <option value="">-- Tất cả --</option>
            <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Số lượng</label>
          <input v-model.number="filters.quantity" type="number" class="form-control" placeholder="Nhập số lượng..." min="0" />
        </div>

        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Sắp xếp</label>
          <select v-model="filters.sort" class="form-select">
            <optgroup label="Theo tên">
              <option value="name_asc">Tên A → Z</option>
              <option value="name_desc">Tên Z → A</option>
            </optgroup>
            <optgroup label="Theo loại">
              <option value="cat_asc">Loại A → Z</option>
              <option value="cat_desc">Loại Z → A</option>
            </optgroup>
            <optgroup label="Theo số lượng">
              <option value="qty_desc">Số lượng ↓</option>
              <option value="qty_asc">Số lượng ↑</option>
            </optgroup>
          </select>
        </div>

        <div class="col-md-4 col-12 ms-md-auto d-flex gap-2 mt-4 mt-md-3">
          <button class="btn btn-outline-secondary w-100" @click="resetFilters">Làm mới</button>
          <button class="btn btn-primary w-100" @click="applyFilters">Tìm kiếm</button>
          <button class="btn btn-success w-100" @click="$router.push('/products/add')">+ Thêm</button>
        </div>
      </div>
    </div>

    
    <div class="card border-0  bg-white rounded-3">
      <h4 class="fw-bold text-dark m-4">Danh sách sản phẩm</h4>
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="bg-light">
            <tr class="text-uppercase text-dark small fw-bold">
              <th class="ps-4">Mã sản phẩm</th>
              <th>Tên</th>
              <th>Loại</th>
              <th class="text-end">Số lượng</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody class="text-dark">
            <tr v-for="p in displayed" :key="p.id">
              <td class="ps-4" :data-label="'Mã sản phẩm'">{{ p.sku }}</td>
              <td :data-label="'Tên'">{{ p.name }}</td>
              <td :data-label="'Loại'">{{ categoryName(p.categoryId) }}</td>
              <td :data-label="'Số lượng'" class="text-end">{{ p.quantity ?? 0 }}</td>
              <td :data-label="'Hành động'" class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" @click="goDetail(p.id)">Chi tiết</button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="editProduct(p.id)">Sửa</button>
                <button class="btn btn-sm btn-outline-secondary" @click="hideProduct(p.id)">Ẩn sản phẩm</button>
              </td>
            </tr>

            <tr v-if="!loading && displayed.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Không có dữ liệu</td>
            </tr>
          </tbody>
        </table>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-dark" role="status"></div>
          <div class="small text-muted mt-2">Đang tải dữ liệu...</div>
        </div>

        <p v-if="error" class="text-dark small p-3">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { productService } from "../../services/productService";

const router = useRouter();

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref("");

const filters = ref({ keyword: "", category: "", quantity: null, sort: "name_asc" });
const applied = ref({ ...filters.value });

const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function categoryName(id) {
  const item = categories.value.find((c) => c.id === id);
  return item?.name || "—";
}
function qtyBadge(q) {
  return "bg-light border"; 
}
function catBadge(id) {
  return "bg-light border"; 
}
const categoryOptions = computed(() =>
  categories.value.map((x) => ({ id: x.id, name: x.name }))
);


const displayed = computed(() => {
  let list = [...products.value];

  
  if (applied.value.keyword.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase());
    list = list.filter((p) => unaccent((p.name || "").toLowerCase()).includes(kw));
  }

  
  if (applied.value.category) {
    list = list.filter((p) => p.categoryId === applied.value.category);
  }

 
  if (applied.value.quantity !== null && applied.value.quantity >= 0) {
    list = list.filter((p) => (p.quantity ?? 0) === applied.value.quantity);
  }

  
  const catName = (id) => categoryName(id);
  switch (applied.value.sort) {
    case "name_asc":  list.sort((a,b)=> (a.name||"").localeCompare(b.name||"","vi",{sensitivity:"base"})); break;
    case "name_desc": list.sort((a,b)=> (b.name||"").localeCompare(a.name||"","vi",{sensitivity:"base"})); break;
    case "cat_asc":   list.sort((a,b)=> catName(a.categoryId).localeCompare(catName(b.categoryId),"vi",{sensitivity:"base"})); break;
    case "cat_desc":  list.sort((a,b)=> catName(b.categoryId).localeCompare(catName(a.categoryId),"vi",{sensitivity:"base"})); break;
    case "qty_asc":   list.sort((a,b)=> (a.quantity??0)-(b.quantity??0)); break;
    case "qty_desc":  list.sort((a,b)=> (b.quantity??0)-(a.quantity??0)); break;
  }
  return list;
});

function applyFilters(){ applied.value = { ...filters.value }; }
function resetFilters(){
  filters.value = { keyword: "", category: "", quantity: null, sort: "name_asc" };
  applied.value = { ...filters.value };
}


function goDetail(id){ router.push({ name: "product-detail", params: { id } }); }
function editProduct(id){ alert(`Đi tới trang sửa sản phẩm: ${id}`); }
function hideProduct(id){
  if (confirm("Ẩn sản phẩm này?")) {
    products.value = products.value.filter(p => p.id !== id);
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    const [list, cats] = await Promise.all([
      productService.getAllProducts(),
      productService.getCategories(),
    ]);
    products.value = list;
    categories.value = cats;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "Tải dữ liệu thất bại";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.card:hover {
  transform: translateY(-5px);
}

.table th, .table td {
  vertical-align: middle;
}

.badge {
  font-size: 0.85rem;
  padding: 0.4em 0.8em;
}


@media (max-width: 576px) {
  .table-responsive {
    background: transparent;
  }

  .table {
    display: block;
    background: transparent;
  }

  .table thead {
    display: none;
  }

  .table tbody, .table tr, .table td {
    display: block;
    width: 100%;
  }

  .table tr {
    background: #fff;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    padding: 1rem;
  }

  .table td {
    border: none !important;
    border-bottom: 1px dashed #e9ecef !important;
    position: relative;
    padding-left: 120px !important;
    padding-right: 1rem !important;
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
    display: flex;
    align-items: center;
  }

  .table td:last-child {
    border-bottom: none !important;
  }

  .table td::before {
    content: attr(data-label);
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 100px;
    font-weight: 600;
    color: #6c757d;
    white-space: nowrap;
  }

  .table td.text-end::before {
    top: 0.75rem;
    transform: none;
  }

  .table td.text-center {
    justify-content: center;
    padding-left: 1rem !important;
  }

  .table td.text-center::before {
    display: none;
  }
}
</style>