<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-end flex-wrap gap-3 mb-4">

      <!-- thong ke san pham -->
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
            <div class="fw-bold fs-5 text-dark">{{displayed.filter(x => (x.quantity ?? 0) === 0).length}}</div>
          </div>
        </div>
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="card-body py-2 px-4 text-center">
            <div class="text-muted small">Sắp hết (&lt;5)</div>
            <div class="fw-bold fs-5 text-dark">{{displayed.filter(x => (x.quantity ?? 0) > 0 && (x.quantity ?? 0) <
                5).length }}</div>
            </div>
          </div>
        </div>
      </div>


      <!-- tim kiem san pham -->
      <div class="card border-0 shadow-sm bg-white rounded-3 p-4 mb-4">
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
            <input v-model.number="filters.quantity" type="number" class="form-control" placeholder="Nhập số lượng..."
              min="0" />
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
            <button class="btn btn-success w-100" @click="$router.push('product/add')">+ Thêm</button>
          </div>
        </div>
      </div>


      <!-- list san pham -->
      <div class="card border-0  bg-white rounded-3">
        <h4 class="fw-bold text-dark m-4">Danh sách sản phẩm</h4>
        <div class="card border-0 shadow-sm bg-white rounded-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="bg-light">
                <tr class="text-uppercase text-dark small fw-bold">
                  <th class="ps-4">Mã sản phẩm</th>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th class="text-center">Số lượng</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody class="text-dark">
                <tr v-for="p in displayed" :key="p.id">
                  <td class="ps-4" :data-label="'Mã sản phẩm'">{{ p.sku }}</td>
                  <td :data-label="'Tên'">{{ p.name }}</td>
                  <td :data-label="'Loại'">{{ categories.find(c => c.id === p.categoryId)?.name }}</td>
                  <td :data-label="'Lưu trữ'" class="text-center">{{ p.storage ?? 0 }}</td>
                  <td :data-label="'Hành động'" class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" @click="$router.push(`/product/${p.id}/detail`)">Sửa</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { productService } from '../../services/productService';
import { categoryService } from "../../services/categoryService";

const router = useRouter();
const route = useRoute();

const products = ref([]);
const categories = ref([]);
const brands = ref([]); 
const loading = ref(true);
const error = ref("");

// form filters có sẵn
const filters = ref({ keyword: "", category: "", quantity: null, sort: "cat_asc" });
const applied = ref({ ...filters.value });

const unaccent = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const categoryOptions = computed(() => categories.value.map(x => ({ id: x.id, name: x.name })));

// ---- Thêm: filter đến từ URL (?categoryId, ?brandId, ?brand)
// const routeFilters = computed(() => {
//   const categoryId = route.query.categoryId ? String(route.query.categoryId) : "";
//   const brandId = route.query.brandId ? String(route.query.brandId) : "";
//   const brandNameQ = route.query.brand ? String(route.query.brand) : "";
//   return { categoryId, brandId, brandNameQ };
// });

// const brandNameById = (id) => brands.value.find(b => b.id === id)?.name || "";

// // ---- baseFiltered: lọc theo URL TRƯỚC
// const baseFiltered = computed(() => {
//   let list = [...products.value];

//   // Lọc theo categoryId (URL)
//   if (routeFilters.value.categoryId) {
//     list = list.filter(p => p.category?.id === routeFilters.value.categoryId);
//   }

//   // Lọc theo brandId (URL): map brandId -> brand name, vì product.brand là string
//   if (routeFilters.value.brandId) {
//     const bn = brandNameById(routeFilters.value.brandId).toLowerCase();
//     if (bn) list = list.filter(p => (p.brand || "").toLowerCase() === bn);
//   }

//   // Hoặc nếu URL truyền thẳng ?brand=Apple/Dell…
//   if (routeFilters.value.brandNameQ) {
//     const bn = routeFilters.value.brandNameQ.toLowerCase();
//     list = list.filter(p => (p.brand || "").toLowerCase() === bn);
//   }

//   return list;
// });


function sortProductByNameCategories(listProduct,typeSort = "asc"){
  const categoryMap = new Map(categories.value.map(c => [c.id,c.name]));

  return listProduct.sort((a, b) => {
     const A = categoryMap.get(a.categoryId) || "";
     const B = categoryMap.get(b.categoryId) || "";
      return  typeSort === 'asc' ? A.localeCompare(B, "vi" , {sensitivity: "base"}) 
      : B.localeCompare(A, "vi" , {sensitivity: "base"})  ;
    });

}


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
  filters.value = { keyword: "", category: "", quantity: null, sort: "name_asc" };
  applied.value = { ...filters.value };
}


async function loadAll() {
  loading.value = true; error.value = ''
  try {
    products.value = await productService.getAll();
    categories.value = await categoryService.getAll();
  } catch (error) {
    console.log("error",error);
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
.card {
  transition: transform 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
}

.table th,
.table td {
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

  .table tbody,
  .table tr,
  .table td {
    display: block;
    width: 100%;
  }

  .table tr {
    background: #fff;
    margin-bottom: 1rem;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.table th,.table td{ vertical-align: middle; }

/* (giữ CSS responsive table như bạn đã làm nếu muốn) */
</style>