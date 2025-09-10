<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <WarehouseSide :selected-ids="{ wid, zid, aid }" />

      <main class="main">
        <div class="crumb">
          <div class="crumb-left">
            <span class="crumb-chip">Kho: <b>{{ path.whName || wid }}</b></span>
            <span class="crumb-chip">Khu: <b>{{ path.zName || zid }}</b></span>
            <span class="crumb-chip">Dãy: <b>{{ path.aName || aid }}</b></span>
          </div>
          <div class="crumb-right">
            <button class="btn btn-outline-secondary btn-sm" @click="router.back()">⟵ Trở về trước</button>
          </div>
        </div>

        <!-- DANH SÁCH KỆ -->
        <div v-if="ui==='list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2 flex-wrap gap-2">
            <h4 class="fw-bold mb-0">Danh sách kệ</h4>
            <button class="btn btn-success btn-sm btn-ctl-slim" @click="openAdd">+ Thêm</button>
          </div>

          <div class="table-responsive">
            <table v-if="items.length" class="table table-hover mb-0 w-100">
              <thead class="bg-light">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:260px">ID</th>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th>Dãy</th>
                  <th class="text-end">#Ngăn</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in items" :key="s.id">
                  <td class="text-monospace small">{{ s.id }}</td>
                  <td>{{ s.name }}</td>
                  <td>{{ s.code }}</td>
                  <td>{{ path.aName || '—' }}</td>
                  <td class="text-end">{{ s.bins?.length ?? 0 }}</td>
                  <td class="text-center text-nowrap">
                    <!-- Căn đều các nút -->
                    <div class="row-actions">
                      <button class="btn btn-sm btn-outline-warning act" @click="openEdit(s)">Sửa</button>
                      <button class="btn btn-sm btn-outline-info act" @click="openDetail(s.id)">Chi tiết</button>
                      <RouterLink class="btn btn-sm btn-outline-secondary act" :to="`/warehouse/${wid}/zone/${zid}/aisle/${aid}/shelf/${s.id}/bin`">
                        Ngăn
                      </RouterLink>
                      <button class="btn btn-sm btn-outline-danger act" @click="remove(s.id)">Xoá</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted p-3">Không có dữ liệu…</div>
          </div>
        </div>

        <!-- FORM -->
        <div v-else-if="ui==='form'" class="section-card">
          <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
            <h4 class="fw-bold m-0">{{ isEdit ? 'Cập nhật kệ' : 'Thêm kệ' }}</h4>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="router.back()">⟵ Trở về trước</button>
              <button class="btn btn-outline-secondary" @click="back">← Quay lại danh sách</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <form class="row g-3" @submit.prevent="submit">
                <div class="col-md-6"><label class="form-label">Tên</label><input v-model.trim="form.name" class="form-control" required></div>
                <div class="col-md-6"><label class="form-label">Mã (SHELF-x)</label><input v-model.trim="form.code" class="form-control" required></div>
                <div class="col-12 small text-muted">Kho: {{ path.whName }} — Khu: {{ path.zName }} — Dãy: {{ path.aName }}</div>
                <div class="col-12">
                  <button class="btn btn-primary btn-ctl-slim">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
                  <button class="btn btn-outline-secondary ms-2" type="button" @click="back">Huỷ</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- CHI TIẾT -->
        <div v-else-if="ui==='detail'" class="section-card">
          <div class="d-flex justify-content-between align-items-center px-3 pt-3 pb-2">
            <h4 class="fw-bold m-0">Chi tiết kệ</h4>
            <div>
              <button class="btn btn-outline-secondary me-2" @click="router.back()">⟵ Trở về trước</button>
              <button class="btn btn-outline-secondary" @click="back">← Quay lại danh sách</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
              <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
              <div class="mb-2"><small class="text-muted">Mã</small><div>{{ detail?.code }}</div></div>
              <div class="mb-2"><small class="text-muted">Dãy</small><div>{{ path.aName || '—' }}</div></div>

              <h6 class="fw-bold mt-4">Ngăn — {{ bins.length }}</h6>
              <div class="table-responsive">
                <table class="table table-sm mb-0">
                  <thead class="bg-light">
                    <tr class="text-uppercase small fw-bold">
                      <th style="width:220px">ID</th><th>Tên</th><th>Mã</th><th class="text-end">Sức chứa</th><th class="text-end">Hiện có</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="b in bins" :key="b.id">
                      <td class="text-monospace small">{{ b.id }}</td>
                      <td>{{ b.name }}</td>
                      <td>{{ b.code }}</td>
                      <td class="text-end">{{ b.capacity ?? '—' }}</td>
                      <td class="text-end">{{ b.currentQty ?? '—' }}</td>
                    </tr>
                    <tr v-if="bins.length===0"><td colspan="5" class="text-center text-muted">Chưa có ngăn</td></tr>
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
import { useRoute, useRouter } from "vue-router"
import { warehouseService } from "../../services/WarehouseService"
import { zoneService } from "../../services/ZoneService"
import { aisleService } from "../../services/AisleService"
import { shelfService } from "../../services/ShelfService"
import { binService } from "../../services/BinService"
import WarehouseSide from "./_WarehouseSide.vue"

const route = useRoute()
const router = useRouter()
const wid = route.params.wid || route.params.id
const zid = route.params.zid || route.params.id
const aid = route.params.aid

const ui = ref("list")
const items = ref([])
const bins = ref([])
const isEdit = ref(false)
const editingId = ref(null)
const detail = ref(null)
const form = ref({ name:"", code:"" })

const path = ref({ whName:"", zName:"", aName:"" })
async function loadPath(){
  try{ const w = await warehouseService.getById(String(wid)); path.value.whName = w?.name || "" }catch{}
  try{ const z = await zoneService.getById(String(zid)); path.value.zName = z?.name || "" }catch{}
  try{ const a = await aisleService.getById(String(aid)); path.value.aName = a?.name || "" }catch{}
}

async function load(){ items.value = await shelfService.getAll(String(aid)) }

function openAdd(){ isEdit.value=false; editingId.value=null; form.value={name:"",code:""}; ui.value="form" }
function openEdit(s){ isEdit.value=true; editingId.value=s.id; form.value={name:s.name, code:s.code}; ui.value="form" }
async function openDetail(id){ detail.value = await shelfService.getById(String(id)); bins.value = await binService.list(String(id)); ui.value="detail" }
function back(){ ui.value="list" }

async function submit(){
  if (isEdit.value) await shelfService.update(String(editingId.value), { ...form.value, aisleId: aid })
  else await shelfService.create(String(aid), form.value)
  await load(); back()
}
async function remove(id){ if(confirm("Xoá kệ này?")){ await shelfService.remove(String(id)); await load() } }

onMounted(async()=>{ await loadPath(); await load() })
</script>

<style scoped>
.pbox{ display:flex; gap:16px; width:100%; }
.main{ flex:1 1 0; min-width:0; display:flex; flex-direction:column; gap:16px; width:100%; }

.crumb{ display:flex; align-items:center; justify-content:space-between; }
.crumb-chip{ background:#eef5ff; border:1px solid #d9e6ff; padding:6px 10px; border-radius:10px; margin-right:6px; }

.section-card{ background:#fff; border:1px solid #eef2f7; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,.03); }
.table th,.table td{ vertical-align: middle; }
.btn-ctl-slim{ min-width:110px; }

/* Căn đều nút hành động trong bảng */
.row-actions{ display:flex; gap:8px; justify-content:center; align-items:center; flex-wrap:nowrap; }
.row-actions .act{ min-width:110px; }
</style>