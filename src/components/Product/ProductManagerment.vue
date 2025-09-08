<!-- src/components/Product/ProductManagement.vue -->
<template>
  <div class="container-fluid py-4">
    <div class="pbox">
      <aside class="side">
        <div class="brand"><i class="fa-solid fa-box-archive me-2"></i><span>Danh mục</span></div>
        <nav class="tree">
          <div class="tree-item" :class="{ active: isSelected({ type:'all' }) }" @click="selectNode({ type:'all' })">
            <i class="fa-solid fa-layer-group me-2"></i> Tất cả sản phẩm
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
                  <div v-for="pp in br.children" :key="pp.id" class="tree-prod">
                    <div class="tree-item" :class="{ active: isSelected(pp) }" @click="selectNode(pp)">
                      <i class="fa-regular fa-square me-2"></i>{{ pp.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>

 
      <main class="main">
        
        <div class="card border-0 shadow-sm rounded-3 mb-3">
          <div class="card-body py-3">
            <div class="row g-3 align-items-end">
              <div class="col-lg-4 col-md-5">
                <label class="form-label fw-semibold">Tìm sản phẩm</label>
                <input v-model="filters.keyword" type="text" class="form-control" placeholder="Nhập tên sản phẩm..." />
              </div>

              <div class="col-lg-3 col-md-4">
                <label class="form-label fw-semibold">Loại sản phẩm</label>
                <select v-model="filters.category" class="form-select">
                  <option value="">-- Tất cả --</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div class="col-lg-5 col-md-12">
                <div class="d-flex gap-2 flex-wrap justify-content-lg-end">
                  <div class="badge-card"><div class="text-muted small">Tổng SP</div><div class="num">{{ totalDisplayed }}</div></div>
                  <div class="badge-card"><div class="text-muted small">Hết hàng</div><div class="num">{{ outOfStock }}</div></div>
                  <div class="badge-card"><div class="text-muted small">Sắp hết (&lt;5)</div><div class="num">{{ nearlyOut }}</div></div>
                </div>
              </div>

              <div class="col-12 d-flex flex-wrap gap-2 justify-content-end mt-2">
                <button class="btn btn-sm btn-secondary" @click="resetFilters"><i class="fa-solid fa-rotate me-1"></i> Làm mới</button>
                <button class="btn btn-sm btn-primary"   @click="applyFilters"><i class="fa-solid fa-magnifying-glass me-1"></i> Tìm kiếm</button>
              </div>
            </div>
          </div>
        </div>

        
        <div class="card border-0 shadow-sm rounded-3">
          <div class="d-flex align-items-center justify-content-between px-4 pt-4 flex-wrap gap-2">
            <h4 class="fw-bold mb-0">{{ tableTitle }}</h4>
            <div class="d-flex align-items-center gap-2">
              <select v-model="tableSort" class="form-select form-select-sm w-auto">
                <optgroup label="Theo tên">
                  <option value="name_asc">Tên A → Z</option>
                  <option value="name_desc">Tên Z → A</option>
                </optgroup>
                <optgroup label="Theo loại">
                  <option value="cat_asc">Loại A → Z</option>
                  <option value="cat_desc">Loại Z → A</option>
                </optgroup>
                <optgroup label="Theo dung lượng">
                  <option value="storage_desc">Dung lượng ↓</option>
                  <option value="storage_asc">Dung lượng ↑</option>
                </optgroup>
              </select>
              <button class="btn btn-success btn-sm" @click="$router.push('/product/add')">+ Thêm</button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover mb-0">
             
              <template v-if="tableMode==='brand'">
                <thead>
                  <tr class="text-uppercase small fw-bold">
                    <th class="ps-4">Hãng</th>
                    <th class="text-center">Tổng SP</th>
                    <th class="text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in brandRows" :key="b.key">
                    <td class="ps-4">{{ b.name }}</td>
                    <td class="text-center">{{ b.count }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-primary"
                              @click="selectNode({type:'brand', id:b.key, label:b.name, parentId:selectedNode?.id})">Xem</button>
                    </td>
                  </tr>
                  <tr v-if="!loading && brandRows.length===0">
                    <td colspan="3" class="text-center text-muted py-4">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </template>

              
              <template v-else>
                <thead>
                  <tr class="text-uppercase small fw-bold">
                    <th class="ps-4">Mã</th>
                    <th>Tên</th>
                    <th>Loại</th>
                    <th>Hãng</th>
                    <th class="text-center">Dung lượng</th>
                    <th class="text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in productRows" :key="p.id">
                    <td class="ps-4">{{ p.sku }}</td>
                    <td>{{ p.name }}</td>
                    <td>{{ catName(p.categoryId) }}</td>
                    <td>{{ p.brand || '—' }}</td>
                    <td class="text-center">{{ p.storage ?? '—' }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-info me-1"    @click="$router.push(`/product/${p.id}`)">Chi tiết</button>
                      <button class="btn btn-sm btn-outline-primary me-1" @click="$router.push(`/product/${p.id}/edit`)">Sửa</button>
                      <button class="btn btn-sm btn-outline-danger"       @click="removeProduct(p.id)">Xoá</button>
                    </td>
                  </tr>
                  <tr v-if="!loading && productRows.length===0">
                    <td colspan="6" class="text-center text-muted py-4">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </template>
            </table>

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-dark" role="status"></div>
              <div class="small text-muted mt-2">Đang tải dữ liệu...</div>
            </div>

            <p v-if="error" class="text-danger small p-3">{{ error }}</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'

const products    = ref([])
const categories  = ref([])
const loading     = ref(true)
const error       = ref('')

const filters  = ref({ keyword:'', category:'' })
const applied  = ref({ ...filters.value })
const tableSort = ref('cat_asc')

const opened       = ref(new Set())
const selectedNode = ref({ type: 'all' })

// Helpers
const S = x => String(x ?? '')
const unaccent = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
const catName  = id => categories.value.find(c => S(c.id) === S(id))?.name || '—'

// Load data (có fallback sang sample trong service)





 // giữ nguyên khi category bên BE có dữ liệu và khi có dữ liệu thì xóa hoặc comment loadAll bên dưới 

async function loadAll() {
  try {
    const [ps, cs] = await Promise.all([productService.getAll(), categoryService.getAll()])
    products.value   = Array.isArray(ps) ? ps : []
    categories.value = Array.isArray(cs) ? cs : []
  } catch (e) {
    error.value = e?.message || 'Lỗi tải dữ liệu'
  } finally {
    loading.value = false
  }
}
// async function loadAll() {
//   loading.value = true; error.value = ''
//   try {
//     const [ps, cs] = await Promise.all([
//       productService.getAll(),
//       categoryService.getAll()
//     ])
//     let P = Array.isArray(ps) ? ps : []
//     let C = Array.isArray(cs) ? cs : []

//     const isSampleCat = C.length > 0 && C.every(c => String(c.id).startsWith('cat-'))
//     const looksLikeUUID = v => typeof v === 'string' && v.includes('-')
//     const prodHasUUIDCats = P.some(p => looksLikeUUID(String(p.categoryId)))

//     // nếu categories là sample mà products đang BE (UUID) -> buộc dùng cả product sample cho đồng bộ
//     if (isSampleCat && prodHasUUIDCats) {
//       P = [
//         { id: "p-ip11", sku: "IP11",  name: "iPhone 11",      brand: "Apple",   color:"Đen",  storage:"64GB",  categoryId: "cat-phone" },
//         { id: "p-ip12", sku: "IP12",  name: "iPhone 12",      brand: "Apple",   color:"Trắng",storage:"128GB", categoryId: "cat-phone" },
//         { id: "p-s21",  sku: "SS21",  name: "Galaxy S21",     brand: "Samsung", color:"Tím",  storage:"128GB", categoryId: "cat-phone" },
//         { id: "p-a78",  sku: "OP78",  name: "OPPO A78",       brand: "OPPO",    color:"Xanh", storage:"256GB", categoryId: "cat-phone" },
//         { id: "p-mba",  sku: "MBA",   name: "MacBook Air 13", brand: "Apple",   color:"Bạc",  storage:"256GB", categoryId: "cat-laptop" },
//         { id: "p-xps",  sku: "DXPS",  name: "Dell XPS 13",    brand: "Dell",    color:"Bạc",  storage:"512GB", categoryId: "cat-laptop" },
//       ]
//     }
//     products.value   = P
//     categories.value = C
//   } catch (e) {
//     error.value = e?.message || 'Lỗi tải dữ liệu'
//   } finally {
//     loading.value = false
//   }
// }

onMounted(loadAll)

const treeData = computed(() =>
  categories.value.map(cat => {
    const prods = products.value.filter(p => S(p.categoryId) === S(cat.id))
    const brandNames = [...new Set(prods.map(p => (p.brand || '').trim()).filter(Boolean))]
      .sort((a,b)=>a.localeCompare(b,'vi',{sensitivity:'base'}))
    const brands = brandNames.map(bn => ({
      id: `${S(cat.id)}::${bn}`,
      label: bn,
      type: 'brand',
      parentId: S(cat.id),
      children: prods
        .filter(p => (p.brand || '').trim().toLowerCase() === bn.toLowerCase())
        .map(p => ({ id: S(p.id), label: p.name, type: 'product' }))
    }))
    return { id: S(cat.id), label: cat.name, type:'category', children: brands }
  })
)
const isOpen = id => opened.value.has(S(id))
const toggle  = id => isOpen(id) ? opened.value.delete(S(id)) : opened.value.add(S(id))
const selectNode = node => {
  selectedNode.value = node
  if (node.parentId) opened.value.add(S(node.parentId))
  if (node.id)       opened.value.add(S(node.id))
}
const isSelected = node => selectedNode.value?.type === node?.type && S(selectedNode.value?.id) === S(node?.id)

// Filter + Sort + Mode
function applyFilters(){ applied.value = { ...filters.value } }
function resetFilters(){ filters.value = { keyword:'', category:'' }; applyFilters() }

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
    case 'name_asc':  list.sort((a,b)=>(a.name||'').localeCompare(b.name||'','vi',{sensitivity:'base'})); break
    case 'name_desc': list.sort((a,b)=>(b.name||'').localeCompare(a.name||'','vi',{sensitivity:'base'})); break
    case 'cat_asc': {
      const cmap = new Map(categories.value.map(c=>[S(c.id), c.name]))
      list.sort((a,b)=>(cmap.get(S(a.categoryId))||'').localeCompare(cmap.get(S(b.categoryId))||'','vi',{sensitivity:'base'})); break
    }
    case 'cat_desc': {
      const cmap = new Map(categories.value.map(c=>[S(c.id), c.name]))
      list.sort((a,b)=>(cmap.get(S(b.categoryId))||'').localeCompare(cmap.get(S(a.categoryId))||'','vi',{sensitivity:'base'})); break
    }
    case 'storage_asc':  list.sort((a,b)=> S(a.storage).localeCompare(S(b.storage))); break
    case 'storage_desc': list.sort((a,b)=> S(b.storage).localeCompare(S(a.storage))); break
  }
  return list
})

const tableMode  = computed(() => selectedNode.value?.type === 'category' ? 'brand' : 'product')
const tableTitle = computed(() => {
  const sel = selectedNode.value
  if (sel?.type === 'category') return `Hãng trong “${sel.label}”`
  if (sel?.type === 'brand')     return `Sản phẩm của “${sel.label}”`
  if (sel?.type === 'product')   return `Sản phẩm: ${baseFiltered.value[0]?.name || ''}`
  return 'Danh sách sản phẩm'
})

const productRows = computed(() => baseFiltered.value)
const brandRows   = computed(() => {
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
    .sort((a,b)=>a.name.localeCompare(b.name,'vi',{sensitivity:'base'}))
})

const totalDisplayed = computed(()=> tableMode.value==='brand' ? brandRows.value.length : productRows.value.length)
const outOfStock     = computed(()=> tableMode.value==='brand' ? 0 : productRows.value.filter(x => (x.quantity ?? 0) === 0).length)
const nearlyOut      = computed(()=> tableMode.value==='brand' ? 0 : productRows.value.filter(x => (x.quantity ?? 0) > 0 && (x.quantity ?? 0) < 5).length)


async function removeProduct(id){
  if (!confirm('Xoá sản phẩm này?')) return
  try {
    await productService.removeProduct(id)
    products.value = products.value.filter(p => S(p.id) !== S(id))
  } catch {}
}
</script>

<style scoped>
.pbox{ display:flex; gap:16px; }
.side{
  width:280px; background:#0f1f2a; color:#e9eef3; border-radius:14px; padding:14px;
  position:sticky; top:96px; height:calc(100vh - 110px); overflow:auto;
}
.main{ flex:1 1 auto; min-width:0; }
.brand{ font-weight:700; display:flex; align-items:center; margin-bottom:10px; font-size:18px; }
.tree-item{ display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; cursor:pointer; color:#e9eef3; }
.tree-item:hover{ background:#173249; }
.tree-item.active{ background:#1f6bff; color:#fff; }
.toggle{ width:26px; height:26px; border-radius:6px; border:1px solid #214060; background:transparent; color:#8fb5ff; display:flex; align-items:center; justify-content:center; }
.tree-children{ padding-left:22px; }

.badge-card{ background:#fff; border:1px solid #eef2f7; border-radius:10px; padding:8px 14px; min-width:110px; text-align:center; }
.badge-card .num{ font-weight:700; color:#1f2937; }

.table th, .table td { vertical-align: middle; }

@media (max-width:992px){
  .pbox{ flex-direction:column; }
  .side{ width:100%; height:auto; position:static; }
}
</style>
