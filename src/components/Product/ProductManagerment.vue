<!-- src/components/Product/ProductManagement.vue -->
<template>
  <div class="container py-5">
    <!-- Header + Stats -->
    <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
      <h4 class="fw-bold text-dark mb-0">Danh sách sản phẩm</h4>
      <!-- ... 3 thẻ thống kê Tổng SP / Hết hàng / Sắp hết ... -->
    </div>

    <!-- >>> ĐẶT KHỐI "ĐANG LỌC" Ở ĐÂY <<< -->
    <!-- >>> KHỐI "ĐANG LỌC" + NÚT QUAY LẠI <<< -->
<div class="d-flex align-items-center justify-content-between small mb-2">
  <div class="d-flex align-items-center gap-2 text-muted">
    <template v-if="$route.query.categoryId || $route.query.brandId || $route.query.brand">
      <span class="me-1">Đang lọc:</span>
      <span v-if="$route.query.categoryId" class="badge bg-light text-dark border">
        Loại: {{ categories.find(c => c.id === $route.query.categoryId)?.name || $route.query.categoryId }}
      </span>
      <span v-if="$route.query.brandId" class="badge bg-light text-dark border">
        Thương hiệu: {{ (brands.find(b => b.id === $route.query.brandId)?.name) || $route.query.brandId }}
      </span>
      <span v-else-if="$route.query.brand" class="badge bg-light text-dark border">
        Thương hiệu: {{ $route.query.brand }}
      </span>
    </template>
  </div>

  <div class="d-flex gap-2" v-if="$route.query.categoryId || $route.query.brandId || $route.query.brand">
    <button
      class="btn btn-sm btn-outline-secondary"
      @click="goBackSmart"
      title="Quay lại trang trước (hoặc về trang Loại hàng nếu không có lịch sử)"
    >← Quay lại</button>
    <button
      class="btn btn-sm btn-outline-secondary"
      @click="$router.push({ name: 'products', query: {} })"
    >Xoá lọc</button>
  </div>
</div>
<!-- Breadcrumb -->


    <!-- FILTER BAR -->
    <div class="card border-0 shadow-sm bg-white rounded-3 p-4 mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Tìm theo tên</label>
          <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên sản phẩm..." />
        </div>

        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Lọc theo loại</label>
          <select v-model="filters.category" class="form-select">
            <option value="">-- Tất cả --</option>
            <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="col-md-3 col-12">
          <label class="form-label fw-semibold text-dark">Tìm theo số lượng</label>
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
          <button class="btn btn-success w-100" @click="$router.push({ name: 'product-form' })">+ Thêm</button>
        </div>
      </div>
    </div>

    <!-- TABLE -->
    <div class="card border-0 shadow-sm bg-white rounded-3">
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
              <td :data-label="'Loại'">{{ p.category?.name || "—" }}</td>
              <td :data-label="'Số lượng'" class="text-end">{{ p.quantity ?? 0 }}</td>
              <td :data-label="'Hành động'" class="text-center">
                <button class="btn btn-sm btn-outline-primary me-1" @click="goDetail(p.id)">Chi tiết</button>
                <button class="btn btn-sm btn-outline-warning me-1" @click="editProduct(p.id)">Sửa</button>
                <button class="btn btn-sm btn-outline-danger" @click="removeProduct(p.id)">Xoá</button>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { productService } from '../../services/productService'; 
import { categoryService } from "../../services/categoryService";

const router = useRouter();
const route  = useRoute();

const products = ref([]);
const categories = ref([]);
const brands = ref([]); // để map brandId -> brand name
const loading = ref(true);
const error = ref("");

// form filters có sẵn
const filters = ref({ keyword: "", category: "", quantity: null, sort: "name_asc" });
const applied = ref({ ...filters.value });

const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const categoryOptions = computed(() => categories.value.map((x) => ({ id: x.id, name: x.name })));

// ---- Thêm: filter đến từ URL (?categoryId, ?brandId, ?brand)
const routeFilters = computed(() => {
  const categoryId = route.query.categoryId ? String(route.query.categoryId) : "";
  const brandId    = route.query.brandId    ? String(route.query.brandId)    : "";
  const brandNameQ = route.query.brand      ? String(route.query.brand)      : "";
  return { categoryId, brandId, brandNameQ };
});

const brandNameById = (id) => brands.value.find(b => b.id === id)?.name || "";

// ---- baseFiltered: lọc theo URL TRƯỚC
const baseFiltered = computed(() => {
  let list = [...products.value];

  // Lọc theo categoryId (URL)
  if (routeFilters.value.categoryId) {
    list = list.filter(p => p.category?.id === routeFilters.value.categoryId);
  }

  // Lọc theo brandId (URL): map brandId -> brand name, vì product.brand là string
  if (routeFilters.value.brandId) {
    const bn = brandNameById(routeFilters.value.brandId).toLowerCase();
    if (bn) list = list.filter(p => (p.brand || "").toLowerCase() === bn);
  }

  // Hoặc nếu URL truyền thẳng ?brand=Apple/Dell…
  if (routeFilters.value.brandNameQ) {
    const bn = routeFilters.value.brandNameQ.toLowerCase();
    list = list.filter(p => (p.brand || "").toLowerCase() === bn);
  }

  return list;
});

// ---- displayed: áp dụng filter form TRÊN KẾT QUẢ baseFiltered
const displayed = computed(() => {
  let list = [...baseFiltered.value];

  if (applied.value.keyword?.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase());
    list = list.filter((p) => unaccent((p.name || "").toLowerCase()).includes(kw));
  }

  if (applied.value.category) {
    list = list.filter((p) => (p.category?.id) === applied.value.category);
  }

  if (applied.value.quantity !== null && applied.value.quantity >= 0) {
    list = list.filter((p) => (p.quantity ?? 0) === applied.value.quantity);
  }

  const catName = (id) => categories.value.find(c => c.id === id)?.name || "—";
  switch (applied.value.sort) {
    case "name_asc":  list.sort((a,b)=> (a.name||"").localeCompare(b.name||"","vi",{sensitivity:"base"})); break;
    case "name_desc": list.sort((a,b)=> (b.name||"").localeCompare(a.name||"","vi",{sensitivity:"base"})); break;
    case "cat_asc":   list.sort((a,b)=> catName(a.category?.id).localeCompare(catName(b.category?.id),"vi",{sensitivity:"base"})); break;
    case "cat_desc":  list.sort((a,b)=> catName(b.category?.id).localeCompare(catName(a.category?.id),"vi",{sensitivity:"base"})); break;
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

function goDetail(id){
  const p = displayed.value.find(x => x.id === id)
  router.push({
    name: 'product-detail',
    params: { id },
    state: { product: p || null }   // 👈 truyền kèm state để trang detail dùng ngay
  })
}



function editProduct(id){ router.push({ name: "product-form", params: { id } }); }
async function removeProduct(id){
  if (!confirm("Xoá sản phẩm này?")) return;
  await productService.removeProduct(id);
  products.value = products.value.filter(p => p.id !== id);
}
function goBackSmart() {
  // Nếu có lịch sử trình duyệt để quay lại trang trước
  if (window.history.length > 1) {
    router.back();
  } else {
    // Vào thẳng link (không có history), fallback về trang danh sách loại
    router.push({ name: 'category-list' }); // hoặc { path: '/categories' }
  }
}

// Tải dữ liệu + brands để map brandId -> name
async function loadAll() {
  try {
    loading.value = true;
    const [list, cats, brs] = await Promise.all([
      productService.getAllProducts(),
      categoryService.list(),
      categoryService.brands()
    ]);
    products.value  = list;
    categories.value = cats;
    brands.value     = brs;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || "Tải dữ liệu thất bại";
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);

// Khi đổi query (?categoryId/?brandId/?) thì tự lọc lại
watch(() => route.query, () => {
  // chỉ cần recompute, vì displayed dựa trên computed
}, { deep: true });
</script>


<style scoped>
.card { transition: transform 0.2s ease; }
.card:hover { transform: translateY(-2px); }
.table th, .table td { vertical-align: middle; }
/* (giữ CSS responsive table như bạn đã làm nếu muốn) */
</style>
