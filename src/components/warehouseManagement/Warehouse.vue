<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <!-- SIDEBAR -->
      <aside class="side">
        <div class="brand"><i class="fa-solid fa-warehouse me-2"></i>Kho hàng</div>

        <nav class="tree">
          <div v-for="wh in tree" :key="wh.id" class="tree-node">
            <!-- Kho -->
            <div class="tree-item" :class="{active:isSelected(wh)}">
              <button class="toggle" @click.stop="toggle(wh)">
                <i :class="isOpen(wh)?'fa-solid fa-minus':'fa-solid fa-plus'"></i>
              </button>
              <span class="label" @click="goWarehouse(wh)">
                <i class="fa-solid fa-boxes-stacked me-2"></i>{{ wh.label }}
              </span>
            </div>

            <!-- Khu -->
            <div v-show="isOpen(wh)" class="tree-children">
              <div v-for="z in wh.children" :key="z.id" class="tree-node">
                <div class="tree-item" :class="{active:isSelected(z)}">
                  <button class="toggle" @click.stop="toggle(z)">
                    <i :class="isOpen(z)?'fa-solid fa-minus':'fa-solid fa-plus'"></i>
                  </button>
                  <span class="label" @click="goZone(wh, z)">
                    <i class="fa-solid fa-border-all me-2"></i>{{ z.label }}
                  </span>
                </div>

                <!-- Dãy -->
                <div v-show="isOpen(z)" class="tree-children">
                  <div v-for="a in z.children" :key="a.id" class="tree-node">
                    <div class="tree-item" :class="{active:isSelected(a)}">
                      <button class="toggle" @click.stop="toggle(a)">
                        <i :class="isOpen(a)?'fa-solid fa-minus':'fa-solid fa-plus'"></i>
                      </button>
                      <span class="label" @click="goAisle(wh, z, a)">
                        <i class="fa-solid fa-bars me-2"></i>{{ a.label }}
                      </span>
                    </div>

                    <!-- Kệ -->
                    <div v-show="isOpen(a)" class="tree-children">
                      <div v-for="s in a.children" :key="s.id" class="tree-node">
                        <div class="tree-item" :class="{active:isSelected(s)}">
                          <button class="toggle" @click.stop="toggle(s)">
                            <i :class="isOpen(s)?'fa-solid fa-minus':'fa-solid fa-plus'"></i>
                          </button>
                          <span class="label" @click="goShelf(wh, z, a, s)">
                            <i class="fa-solid fa-table-cells me-2"></i>{{ s.label }}
                          </span>
                        </div>

                        <!-- Ngăn -->
                        <div v-show="isOpen(s)" class="tree-children">
                          <div
                            v-for="b in s.children"
                            :key="b.id"
                            class="tree-item leaf"
                            @click="goBin(wh,z,a,s,b)"
                          >
                            <i class="fa-solid fa-box-archive me-2"></i>{{ b.label }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- /Kệ -->
                  </div>
                </div>
                <!-- /Dãy -->
              </div>
            </div>
            <!-- /Khu -->
          </div>
        </nav>
      </aside>

      <!-- MAIN -->
      <main class="main">
        <!-- Breadcrumb: bỏ các nút bên phải -->
        <div class="crumb">
          <span class="crumb-title">Sơ đồ kho</span>
        </div>

        <!-- DANH SÁCH KHO -->
        <div class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2 flex-wrap gap-2">
            <h4 class="fw-bold mb-0">Danh sách kho</h4>
            <button class="btn btn-success btn-sm btn-ctl-slim" @click="openAdd">+ Thêm</button>
          </div>

          <div class="table-responsive">
            <table v-if="items.length" class="table table-hover mb-0 w-100">
              <thead class="bg-light">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:260px">ID</th>
                  <th>Tên</th>
                  <th>Vị trí</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="w in items" :key="w.id">
                  <td class="text-monospace small">{{ w.id }}</td>
                  <td>{{ w.name }}</td>
                  <td>{{ w.location }}</td>
                  <td class="text-center">
                    <div class="d-inline-flex gap-2 flex-wrap justify-content-center">
                      <button class="btn btn-sm btn-outline-warning btn-ctl-slim" @click="openEdit(w)">Sửa</button>
                      <button class="btn btn-sm btn-outline-info btn-ctl-slim" @click="openDetail(w.id)">Chi tiết</button>
                      <RouterLink :to="`/warehouse/${w.id}/zone`" class="btn btn-sm btn-outline-secondary btn-ctl-slim">
                        Xem khu
                      </RouterLink>
                      <button class="btn btn-sm btn-outline-danger btn-ctl-slim" @click="remove(w.id)">Xoá</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted p-3">Không có dữ liệu…</div>
          </div>
        </div>

        <!-- FORM -->
        <div v-if="ui==='form'" class="section-card mt-3">
          <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
            <h4 class="fw-bold m-0">{{ isEdit ? 'Cập nhật kho' : 'Thêm kho' }}</h4>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="router.back()">⟵ Trở về trước</button>
              <button class="btn btn-outline-secondary" @click="back">← Quay lại danh sách</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form class="row g-3" @submit.prevent="submit" novalidate>
                <div class="col-md-6">
                  <label class="form-label">Tên <span class="text-danger">*</span></label>
                  <input v-model.trim="form.name" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Vị trí <span class="text-danger">*</span></label>
                  <input v-model.trim="form.location" class="form-control" required />
                </div>
                <div class="col-12">
                  <button class="btn btn-primary btn-ctl-slim">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
                  <button type="button" class="btn btn-outline-secondary ms-2" @click="back">Huỷ</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- CHI TIẾT -->
        <div v-if="ui==='detail'" class="section-card mt-3">
          <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
            <h4 class="fw-bold m-0">Chi tiết kho</h4>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="router.back()">⟵ Trở về trước</button>
              <button class="btn btn-outline-secondary" @click="back">← Quay lại danh sách</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
              <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
              <div class="mb-2"><small class="text-muted">Vị trí</small><div>{{ detail?.location }}</div></div>

              <h6 class="fw-bold mt-4">Khu — {{ zones.length }}</h6>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead class="bg-light">
                    <tr class="text-uppercase small fw-bold">
                      <th style="width:220px">ID</th><th>Tên</th><th>Mô tả</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="z in zones" :key="z.id">
                      <td class="text-monospace small">{{ z.id }}</td>
                      <td>{{ z.name }}</td>
                      <td>{{ z.description }}</td>
                      <td>
                        <RouterLink class="btn btn-sm btn-outline-primary btn-ctl-slim" :to="`/warehouse/${detail.id}/zone/${z.id}/aisle`">
                          Quản lý dãy
                        </RouterLink>
                      </td>
                    </tr>
                    <tr v-if="zones.length===0">
                      <td colspan="4" class="text-center text-muted">Chưa có khu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { warehouseService } from "../../services/WarehouseService"
import { zoneService } from "../../services/ZoneService"
import { aisleService } from "../../services/AisleService"
import { shelfService } from "../../services/ShelfService"
import { binService } from "../../services/BinService"

const router = useRouter()

/* ===== Center list/form/detail ===== */
const ui = ref("list")
const items = ref([])
const zones = ref([])
const isEdit = ref(false)
const editingId = ref(null)
const detail = ref(null)
const form = ref({ name: "", location: "" })
async function load(){ items.value = await warehouseService.getAll() }
function openAdd(){ isEdit.value=false; editingId.value=null; form.value={name:"",location:""}; ui.value="form" }
function openEdit(w){ isEdit.value=true; editingId.value=w.id; form.value={name:w.name,location:w.location}; ui.value="form" }
async function openDetail(id){ detail.value=await warehouseService.getById(String(id)); zones.value=await zoneService.getAll(String(id)); ui.value="detail" }
function back(){ ui.value="list" }
async function submit(){ if(isEdit.value) await warehouseService.update(editingId.value,form.value); else await warehouseService.create(form.value); await load(); back() }
async function remove(id){ if(confirm("Xoá kho này?")){ await warehouseService.remove(id); await load() } }
onMounted(async()=>{ await load(); await buildTree() })

/* ===== Sidebar tree (lazy load) ===== */
const tree = ref([])
const opened = ref(new Set())
const selected = ref(null)
const S = v => String(v ?? "")

function isOpen(n){ return opened.value.has(keyOf(n)) }
function keyOf(n){ return `${n.type}:${S(n.id)}` }
function toggle(n){
  if (isOpen(n)) opened.value.delete(keyOf(n))
  else { opened.value.add(keyOf(n)); ensureChildren(n) }
}
function isSelected(n){ return selected.value && keyOf(selected.value)===keyOf(n) }

async function buildTree(){
  const whs = await warehouseService.getAll() || []
  tree.value = whs.map(w=>({ id:S(w.id), label:w.name, type:'warehouse', children:[] }))
}
async function ensureChildren(n){
  if (n.children && n.children.length) return
  if (n.type==='warehouse'){
    const zs = await zoneService.getAll(S(n.id)) || []
    n.children = zs.map(z=>({ id:S(z.id), label:z.name, type:'zone', parent:n, children:[] }))
  } else if (n.type==='zone'){
    const as = await aisleService.getAll(S(n.id)) || []
    n.children = as.map(a=>({ id:S(a.id), label:a.name, type:'aisle', parent:n, children:[] }))
  } else if (n.type==='aisle'){
    const ss = await shelfService.getAll(S(n.id)) || []
    n.children = ss.map(s=>({ id:S(s.id), label:s.name, type:'shelf', parent:n, children:[] }))
  } else if (n.type==='shelf'){
    const bs = await binService.list(S(n.id)) || []
    n.children = bs.map(b=>({ id:S(b.id), label:b.name || b.code, type:'bin', parent:n, children:[] }))
  }
}

function goWarehouse(w){ selected.value=w; router.push(`/warehouse/${w.id}/zone`) }
function goZone(w,z){ selected.value=z; router.push(`/warehouse/${w.id}/zone/${z.id}/aisle`) }
function goAisle(w,z,a){ selected.value=a; router.push(`/warehouse/${w.id}/zone/${z.id}/aisle/${a.id}/shelf`) }
function goShelf(w,z,a,s){ selected.value=s; router.push(`/warehouse/${w.id}/zone/${z.id}/aisle/${a.id}/shelf/${s.id}/bin`) }
function goBin(w,z,a,s,b){ selected.value=b; router.push(`/warehouse/${w.id}/zone/${z.id}/aisle/${a.id}/shelf/${s.id}/bin`) }
</script>

<style scoped>
.pbox{ display:flex; gap:16px; width:100%; }
.side{
  width:300px; background:#ffffff; color:#000000; border-radius:14px; padding:14px;
  position:sticky; top:96px; height:calc(100vh - 110px); overflow:auto;
}
.main{ flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:16px; width:100%; }

.crumb{ display:flex; align-items:center; justify-content:space-between; }
.crumb-title{ font-weight:700; font-size:18px; }

.brand{ font-weight:700; display:flex; align-items:center; margin-bottom:10px; font-size:18px; }
.tree-item{ display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; cursor:pointer; color:#000000; }
.tree-item:hover{ background:#f0f0f0; }
.tree-item.active{ background:#1f6bff; color:#fff; }
.tree-item.leaf{ padding-left:36px; }
.toggle{ width:26px; height:26px; border-radius:6px; border:1px solid #cccccc; background:transparent; color:#000000; display:flex; align-items:center; justify-content:center; }
.tree-children{ padding-left:22px; }

.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.03); }
.table th,.table td{ vertical-align: middle; }
.btn-ctl-slim{ min-width:110px; }

@media (max-width:992px){
  .pbox{ flex-direction:column; }
  .side{ width:100%; height:auto; position:static; }
}
</style>