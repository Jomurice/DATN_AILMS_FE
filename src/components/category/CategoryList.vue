<!-- src/components/category/CategoryList.vue -->
<template>
<<<<<<< HEAD
  <div class="">

    <div class="d-flex align-items-center justify-content-between mb-2">
      <div>
        <input type="text" class="form-control" placeholder="Tìm theo tên loại hàng hóa">
      </div>

      <h2>Loại hàng hóa</h2>

      <div class="d-flex gap-2">
        <div class="badge-card">
          <div class="text-muted small">Tổng loại hàng hóa: <span class="num"></span></div>
        </div>
      </div>
    </div>

    <div class="d-flex gap-4">

      <aside class="card d-flex gap-3 border-0 p-2 shadow-sm rounded-3 side ">
            <div class="asideChildren">
              <label class="form-label fw-semibold text-dark">Sắp xếp</label>
              <select v-model="filters.sort" class="form-select">
                <option value="name_asc">Tên A → Z</option>
                <option value="name_desc">Tên Z → A</option>
              </select>
            </div>

      </aside>

      <!-- LIST -->
      <div class="card border-0 shadow-sm rounded-3 main">
        <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
          <button class="btn btn-success btn-sm" @click="$router.push('/category/add')">+ Thêm loại</button>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr class="text-uppercase table-primary small fw-bold">
                <th>Tên loại</th>
                <th>Mô tả</th>
                <th class="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in displayed" :key="c.id">
                <td :data-label="'Tên loại'">{{ c.name }}</td>
                <td :data-label="'Mô tả'">{{ c.description || '—' }}</td>
                <td class="text-center" :data-label="'Hành động'">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="$router.push(`/category/${c.id}/detail`)">Sửa</button>
                  <button class="btn btn-sm btn-outline-danger" @click="removeItem(c.id)">Xoá</button>
                </td>
              </tr>
              <tr v-if="!isLoading && displayed.length === 0">
                <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
              </tr>
            </tbody>
          </table>

          <!-- page -->
          <div class="sizePage p-2 d-flex align-items-center justify-content-end">
            Số mục
            <select class="form-select mx-2 rounded-3">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>

            <nav class="page d-flex fs-4 gap-2">
              <p class="fw-bold"> &lt; </p>
              <p>1</p>
              <p class="fw-bold"> &gt; </p>
            </nav>
=======
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <!-- SIDEBAR: Danh mục -> Thương hiệu -> Model -->
      <aside class="side">
        <div class="brand">
          <i class="fa-solid fa-sitemap me-2"></i><span>Danh mục & Hãng</span>
        </div>

        <nav class="tree">
          <div class="tree-item" :class="{ active: isSelected({ type:'all' }) }" @click="selectNode({ type:'all' })">
            <i class="fa-solid fa-layer-group me-2"></i> Tất cả loại
          </div>

          <div v-for="cat in treeData" :key="cat.id" class="tree-cat">
            <div class="tree-item" :class="{ active: isSelected(cat) }">
              <button class="toggle" v-if="cat.children.length" @click.stop="toggle(cat.id)">
                <i :class="isOpen(cat.id) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
              </button>
              <span class="label" @click="selectNode(cat)">
                <i class="fa-solid fa-folder me-2"></i>{{ cat.label }}
              </span>
            </div>

            <div v-show="isOpen(cat.id)" class="tree-children">
              <div v-for="br in cat.children" :key="br.id" class="tree-brand">
                <div class="tree-item" :class="{ active: isSelected(br) }">
                  <button class="toggle" v-if="br.children.length" @click.stop="toggle(br.id)">
                    <i :class="isOpen(br.id) ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
                  </button>
                  <span class="label" @click="selectNode(br)">
                    <i class="fa-solid fa-tags me-2"></i>{{ br.label }}
                  </span>
                </div>

                <div v-show="isOpen(br.id)" class="tree-children">
                  <div v-for="m in br.children" :key="m.id" class="tree-prod">
                    <div class="tree-item" :class="{ active: isSelected(m) }" @click="selectNode(m)">
                      <i class="fa-regular fa-square me-2"></i>{{ m.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <!-- MAIN -->
      <main class="main">
        <!-- FILTER -->
        <div class="card section-card mb-3">
          <div class="card-body py-3">
            <div class="row g-3 align-items-end">
              <div class="col-lg-4 col-md-6">
                <label class="form-label fw-semibold text-dark">Tìm kiếm tên loại</label>
                <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên loại..." />
              </div>

              <div class="col-lg-3 col-md-6">
                <label class="form-label fw-semibold text-dark">Sắp xếp</label>
                <select v-model="filters.sort" class="form-select">
                  <option value="name_asc">Tên A → Z</option>
                  <option value="name_desc">Tên Z → A</option>
                </select>
              </div>

              <div class="col-lg-5">
                <div class="d-flex gap-2 justify-content-lg-end">
                  <button class="btn btn-sm btn-secondary btn-ctl-slim" @click="resetFilters">
                    <i class="fa-solid fa-rotate me-1"></i> Làm mới
                  </button>
                  <button class="btn btn-sm btn-primary btn-ctl-slim" @click="applyFilters">
                    <i class="fa-solid fa-magnifying-glass me-1"></i> Tìm kiếm
                  </button>
                </div>
              </div>
            </div>

            <!-- Chip trạng thái lựa chọn -->
            <div v-if="selectionLabel" class="small mt-2 text-muted">
              Đang lọc: <span class="badge bg-primary-subtle text-primary">{{ selectionLabel }}</span>
            </div>
          </div>
        </div>

        <!-- LIST -->
        <div class="card section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2 flex-wrap gap-2">
            <h4 class="fw-bold mb-0">{{ tableTitle }}</h4>
            <button class="btn btn-success btn-sm btn-ctl-slim" @click="$router.push('/category/add')">+ Thêm loại</button>
          </div>

          <div class="table-responsive">
            <table class="table table-hover mb-0 w-100">
              <thead class="bg-light">
                <tr class="text-uppercase text-dark small fw-bold">
                  <th class="ps-3">Mã loại</th>
                  <th>Tên loại</th>
                  <th>Mô tả</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in displayed" :key="c.id" :class="{ 'row-hidden': c.hidden }">
                  <td class="ps-3" :data-label="'Mã loại'">{{ c.id }}</td>
                  <td :data-label="'Tên loại'">{{ c.name }}</td>
                  <td :data-label="'Mô tả'">{{ c.description || '—' }}</td>
                  <td class="text-center" :data-label="'Hành động'">
                    <button class="btn btn-sm btn-outline-warning me-1" @click="$router.push(`/category/${c.id}/detail`)">Sửa</button>
                    <button class="btn btn-sm btn-outline-danger" @click="toggleHidden(c)">{{ c.hidden ? 'Hiện' : 'Ẩn' }}</button>
                  </td>
                </tr>
                <tr v-if="!isLoading && displayed.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">Không có dữ liệu</td>
                </tr>
              </tbody>
            </table>

            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-dark" role="status"></div>
              <div class="small text-muted mt-2">Đang tải...</div>
            </div>

            <p v-if="error" class="text-danger small p-3">{{ error }}</p>
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
          </div>

          <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-dark" role="status"></div>
            <div class="small text-muted mt-2">Đang tải...</div>
          </div>

          <p v-if="error" class="text-danger small p-3">{{ error }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { categoryService } from '../../services/categoryService'
<<<<<<< HEAD

const categories = ref([])
const isLoading = ref(false)
const error = ref('')

const filters = ref({ keyword: '', sort: 'name_asc' })
const applied  = ref({ ...filters.value })

const unaccent = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')

const displayed = computed(() => {
  let list = [...categories.value]
=======
import { productService } from '../../services/productService'

/* ===== data ===== */
const categories = ref([])
const products   = ref([])
const isLoading  = ref(false)
const error      = ref('')

/* ===== sidebar tree state ===== */
const opened       = ref(new Set())
const selectedNode = ref({ type: 'all' })

const S = x => String(x ?? '')
const unaccent = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')

/* ===== filters ===== */
const filters = ref({ keyword: '', sort: 'name_asc' })
const applied = ref({ ...filters.value })

/* ===== load ===== */
async function loadAll(){
  isLoading.value = true; error.value = ''
  try {
    categories.value = (await categoryService.getAll() || []).map(x => ({ hidden:false, ...x }))
    products.value   = await productService.getAll() || []
  } catch(e){ error.value = e?.message || 'Lỗi tải dữ liệu.' }
  finally { isLoading.value = false }
}
onMounted(loadAll)

/* ===== build tree: Category -> Brand -> Model ===== */
const treeData = computed(() => {
  return categories.value.map(cat => {
    const inCat = products.value.filter(p => S(p.categoryId) === S(cat.id))
    const brandNames = [...new Set(inCat.map(p => (p.brand || '').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,'vi',{sensitivity:'base'}))

    const brands = brandNames.map(bn => {
      const models = [...new Set(
        inCat.filter(p => (p.brand || '').trim().toLowerCase() === bn.toLowerCase())
             .map(p => (p.name || '').trim()).filter(Boolean)
      )].sort((a,b)=>a.localeCompare(b,'vi',{sensitivity:'base'}))

      return {
        id: `${S(cat.id)}::${bn}`, label: bn, type:'brand', parentId: S(cat.id),
        children: models.map(m => ({ id:`${S(cat.id)}::${bn}::${m}`, label:m, type:'model', parentId:`${S(cat.id)}::${bn}` }))
      }
    })

    return { id:S(cat.id), label:cat.name, type:'category', children:brands }
  })
})

/* ===== tree helpers ===== */
const isOpen   = id => opened.value.has(S(id))
const toggle   = id => isOpen(id) ? opened.value.delete(S(id)) : opened.value.add(S(id))
const isSelected = node => selectedNode.value?.type === node?.type && S(selectedNode.value?.id) === S(node?.id)
function selectNode(node){
  selectedNode.value = node
  if (node.parentId) opened.value.add(S(node.parentId))
  if (node.id)       opened.value.add(S(node.id))
}

/* ===== displayed list ===== */
const displayed = computed(() => {
  let list = [...categories.value]

  // lọc theo node
  const sel = selectedNode.value
  if (sel?.type === 'category') {
    list = list.filter(c => S(c.id) === S(sel.id))
  } else if (sel?.type === 'brand') {
    const [catId, brand] = S(sel.id).split('::')
    // các loại có sản phẩm của brand này (trong cat đang chọn)
    const hasBrand = new Set(
      products.value
        .filter(p => S(p.categoryId) === S(catId) && (p.brand || '').trim().toLowerCase() === (brand || '').toLowerCase())
        .map(p => S(p.categoryId))
    )
    list = list.filter(c => hasBrand.has(S(c.id)))
  } else if (sel?.type === 'model') {
    const [catId, brand, model] = S(sel.id).split('::')
    const belong = products.value.some(p =>
      S(p.categoryId) === S(catId) &&
      (p.brand || '').trim().toLowerCase() === (brand || '').toLowerCase() &&
      (p.name  || '').trim().toLowerCase()  === (model || '').toLowerCase()
    )
    list = belong ? list.filter(c => S(c.id) === S(catId)) : []
  }

  // lọc keyword
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
  if (applied.value.keyword.trim()) {
    const kw = unaccent(applied.value.keyword.trim().toLowerCase())
    list = list.filter(c => unaccent((c.name || '').toLowerCase()).includes(kw))
  }
<<<<<<< HEAD
=======

  // sort
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
  switch (applied.value.sort) {
    case 'name_asc':  list.sort((a,b)=>(a.name||'').localeCompare(b.name||'','vi',{sensitivity:'base'})); break
    case 'name_desc': list.sort((a,b)=>(b.name||'').localeCompare(a.name||'','vi',{sensitivity:'base'})); break
  }
  return list
})

<<<<<<< HEAD
async function loadAll(){
  isLoading.value = true
  error.value = ''
  try { categories.value = await categoryService.getAll() }
  catch(e){ error.value = e?.message || 'Lỗi tải danh mục.' }
  finally { isLoading.value = false }
}

function applyFilters(){ applied.value = { ...filters.value } }
function resetFilters(){ filters.value = { keyword:'', sort:'name_asc' }; applied.value = { ...filters.value } }

async function removeItem(id){
  if (!confirm('Xoá loại này?')) return
  await categoryService.remove(id)
  categories.value = categories.value.filter(c => String(c.id) !== String(id))
}

onMounted(loadAll)
</script>

<style scoped>
/* Kéo sát navbar (triệt padding của layout ngoài) */
.category-page{ padding-top:8px !important; margin-top:-150px; }
:deep(.container-fluid.py-4){ padding-top:0 !important; }

.side {
  width: 18%;
  height: calc(100vh - 200px);
  overflow: auto;
=======
/* ===== labels/titles ===== */
const tableTitle = computed(() => {
  const sel = selectedNode.value
  if (sel?.type === 'category') return `Hãng trong “${treeData.value.find(x=>S(x.id)===S(sel.id))?.label || ''}”`
  if (sel?.type === 'brand')     return `Loại có sản phẩm của “${sel.label}”`
  if (sel?.type === 'model')     return `Loại chứa “${sel.label}”`
  return 'Danh sách loại'
})
const selectionLabel = computed(() => {
  const sel = selectedNode.value
  if (sel?.type === 'category') return `Danh mục: ${sel.label}`
  if (sel?.type === 'brand')     return `Thương hiệu: ${sel.label}`
  if (sel?.type === 'model')     return `Model: ${sel.label}`
  return ''
})

/* ===== filter actions ===== */
function applyFilters(){ applied.value = { ...filters.value } }
function resetFilters(){ filters.value = { keyword:'', sort:'name_asc' }; applied.value = { ...filters.value } }

/* ===== item actions ===== */
async function toggleHidden(c){
  const next = !c.hidden
  const action = next ? 'ẩn' : 'hiện'
  if (!confirm(`Bạn có chắc muốn ${action} loại “${c.name}”?`)) return
  try{ await categoryService.update(c.id, { hidden: next }); c.hidden = next }catch(e){}
}
</script>

<style scoped>
/* Bố cục rộng và cân đối giống Product */
.pbox{ display:flex; gap:16px; width:100%; }
.side{
  width:280px; background:#ffffff; color:#000000; border-radius:14px; padding:14px;
  position:sticky; top:96px; height:calc(100vh - 110px); overflow:auto;
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
}
.main{ flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:16px; width:100%; }

<<<<<<< HEAD
.main {
  flex: 1 1 auto;
  min-width: 0;
  height: calc(100vh - 200px);
  overflow: auto;
}

.form-control {
  width: 270px;
  border: none;
  border-radius: 10px;
}

.asideChildren{
  min-width: 200px;
}
.asideChildren>h5{
  margin-bottom: 10px;
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

.sizePage{
  background-color: #f9e7e7;
}

.page>p{
  margin: 0;
  cursor: pointer;
}

.sizePage>.form-select{
  max-width: 70px;
}

/* Hai khối xếp dọc, rộng 100% */
.stack{ display:flex; flex-direction:column; gap:14px; width:90%; }

/* Card trắng dùng chung */
.section-card{
  width:100%;
  background:#fff;
  border:1px solid #eef2f7;
  border-radius:12px;
  box-shadow:0 1px 2px rgba(0,0,0,.03);
}
.section-card .card-body{ padding:16px 20px; }

.table th, .table td { 
  vertical-align:middle; 
}

/* Mobile: bảng thành thẻ */
@media (max-width: 576px){
=======
/* Tree styles (đồng bộ với Product) */
.brand{ font-weight:700; display:flex; align-items:center; margin-bottom:10px; font-size:18px; }
.tree-item{ display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; cursor:pointer; color:#000000; }
.tree-item:hover{ background:#f0f0f0; }
.tree-item.active{ background:#1f6bff; color:#fff; }
.toggle{ width:26px; height:26px; border-radius:6px; border:1px solid #cccccc; background:transparent; color:#000000; display:flex; align-items:center; justify-content:center; }
.tree-children{ padding-left:22px; }

.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.03); }
.section-card .card-body{ padding:16px 20px; }

.table th, .table td { vertical-align:middle; }
.btn-ctl-slim{ min-width:110px; }
.row-hidden{ opacity:.6; }

/* Mobile */
@media (max-width: 576px){
  .pbox{ flex-direction:column; }
  .side{ width:100%; height:auto; position:static; }
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
  .table thead{ display:none; }
  .table, .table tbody, .table tr, .table td{ display:block; width:100%; }
  .table tr{
    background:#fff; margin-bottom:1rem; border:1px solid #e9ecef;
    border-radius:.5rem; box-shadow:0 2px 4px rgba(0,0,0,.05); padding:.75rem;
  }
  .table td{
    border:none !important; border-bottom:1px dashed #e9ecef !important;
    display:flex; justify-content:space-between; align-items:center; padding:.5rem .25rem;
  }
  .table td:last-child{ border-bottom:none !important; }
  .section-card .card-body{ padding:12px; }
}
<<<<<<< HEAD
</style>
=======
</style>
>>>>>>> 989a55af60ed7303b16d542cf23bf937cd440561
