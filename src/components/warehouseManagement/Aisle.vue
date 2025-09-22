<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <WarehouseSide :selected-ids="{ wid, zid }" />
      <main class="main">
        <div class="crumb">
          <div class="crumb-left">
            <span class="crumb-chip">Kho: <b>{{ path.whName || wid }}</b></span>
            <span class="crumb-chip">Khu: <b>{{ path.zName || zid }}</b></span>
          </div>
          <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">⟵ Trở về</button>
        </div>

        <!-- LIST -->
        <div v-if="ui === 'list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Danh sách dãy</h4>
            <button class="btn btn-success btn-sm btn-ctl" @click="openAdd">+ Thêm</button>
          </div>
          <div class="table-responsive tbl-shell">
            <table v-if="pagedItems.length" class="table table-hover mb-0 tbl-sticky table-tight">
              <thead class="tbl-head-blue">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:220px">ID</th>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th class="nowrap">Ngày tạo</th>
                  <th class="nowrap">Ngày cập nhật</th>
                  <th class="text-center" style="width:160px">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="a in pagedItems" :key="a.id">
                  <td class="mono small nowrap">{{ a.id }}</td>
                  <td class="nowrap">{{ a.name }}</td>
                  <td class="mono nowrap">{{ a.code }}</td>
                  <td class="nowrap">{{ fmtDT(a.createdAt) }}</td>
                  <td class="nowrap">{{ fmtDT(a.updatedAt) }}</td>
                  <td class="text-center">
                    <div class="row-actions">
                      <button class="btn btn-outline-info btn-icon" title="Chi tiết" @click="openDetail(a.id)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning btn-icon" title="Sửa" @click="openEdit(a)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-icon" title="Xoá" @click="remove(a.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                      <RouterLink class="btn btn-outline-primary btn-icon" :to="`/warehouse/${wid}/zone/${zid}/aisle/${a.id}/shelf`" title="Xem kệ">
                        <i class="fa-solid fa-table-cells"></i>
                      </RouterLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted p-3">Không có dữ liệu…</div>
          </div>

          <!-- Pager -->
          <div class="pager-bar">
            <div class="d-flex align-items-center gap-2">
              <span class="small text-muted">Số mục</span>
              <select v-model.number="pageSize" class="form-select form-select-sm w-auto">
                <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
              </select>
              <button class="btn btn-sm btn-outline-secondary" :disabled="page<=1" @click="prevPage()">&lt;</button>
              <span class="px-2">{{ page }}</span>
              <button class="btn btn-sm btn-outline-secondary" :disabled="page>=pageCount" @click="nextPage()">&gt;</button>
            </div>
          </div>
        </div>

        <!-- FORM -->
        <div v-else-if="ui === 'form'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật dãy' : 'Thêm dãy' }}</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <form class="row g-3" @submit.prevent="submit">
              <div class="col-md-6">
                <label class="form-label">Tên dãy <span class="text-danger">*</span></label>
                <input v-model.trim="form.name" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Mã <span class="text-danger">*</span></label>
                <input v-model.trim="form.code" class="form-control" required />
              </div>

              <div v-if="isEdit" class="col-12 small text-muted">
                <span class="me-3">Created: {{ fmtDT(detail?.createdAt) }}</span>
                <span>Updated: {{ fmtDT(detail?.updatedAt) }}</span>
              </div>

              <div class="col-12 small text-muted">Kho: {{ path.whName }} — Khu: {{ path.zName }}</div>
              <div class="col-12">
                <button class="btn btn-primary btn-ctl">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
                <button type="button" class="btn btn-outline-secondary btn-ctl ms-2" @click="ui = 'list'">Huỷ</button>
              </div>
            </form>
          </div>
        </div>

        <!-- DETAIL -->
        <div v-else-if="ui === 'detail'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Chi tiết dãy</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <div class="row g-3">
              <div class="col-md-4"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
              <div class="col-md-4"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
              <div class="col-md-4"><small class="text-muted">Mã</small><div class="mono">{{ detail?.code }}</div></div>
              <div class="col-md-3"><small class="text-muted">Ngày tạo</small><div class="nowrap">{{ fmtDT(detail?.createdAt) }}</div></div>
              <div class="col-md-3"><small class="text-muted">Ngày cập nhật</small><div class="nowrap">{{ fmtDT(detail?.updatedAt) }}</div></div>
            </div>

            <h6 class="fw-bold mt-4">Kệ — {{ shelves.length }}</h6>
            <div class="table-responsive tbl-shell">
              <table class="table table-sm mb-0 tbl-sticky table-tight">
                <thead class="tbl-head-blue">
                  <tr class="text-uppercase small fw-bold">
                    <th style="width:220px">ID</th>
                    <th>Tên</th>
                    <th>Mã</th>
                    <th class="nowrap">Ngày tạo</th>
                    <th class="nowrap">Ngày cập nhật</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in shelves" :key="s.id">
                    <td class="mono small nowrap">{{ s.id }}</td>
                    <td class="nowrap">{{ s.name }}</td>
                    <td class="mono nowrap">{{ s.code }}</td>
                    <td class="nowrap">{{ fmtDT(s.createdAt) }}</td>
                    <td class="nowrap">{{ fmtDT(s.updatedAt) }}</td>
                    <td>
                      <RouterLink class="btn btn-sm btn-outline-primary btn-ctl" :to="`/warehouse/${wid}/zone/${zid}/aisle/${detail.id}/shelf/${s.id}/bin`">Quản lý ngăn</RouterLink>
                    </td>
                  </tr>
                  <tr v-if="!shelves.length"><td colspan="6" class="text-center text-muted">Chưa có kệ</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { warehouseService } from "../../services/WarehouseService";
import { zoneService } from "../../services/ZoneService";
import { aisleService } from "../../services/AisleService";
import { shelfService } from "../../services/ShelfService";
import WarehouseSide from "./WarehouseSide.vue";

const route = useRoute();
const wid = route.params.wid;
const zid = route.params.zid;

const ui = ref("list");
const items = ref([]);
const shelves = ref([]);
const isEdit = ref(false);
const editingId = ref(null);
const detail = ref(null);
const form = ref({ name: "", code: "" });
const path = ref({ whName: "", zName: "" });

// pagination
const page = ref(1);
const pageSize = ref(10);
const pageSizeOptions = [5,10,20,50];
const pageCount = computed(()=> Math.max(1, Math.ceil((items.value?.length||0)/pageSize.value)));
const pagedItems = computed(()=>{
  const start = (page.value - 1) * pageSize.value;
  return (items.value || []).slice(start, start + pageSize.value);
});
watch(pageSize, ()=> page.value = 1);

const fmtDT = (d) => {
  if (!d) return "—";
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt)) return "—";
    const pad = n => String(n).padStart(2,"0");
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  } catch { return "—"; }
};

async function loadPath() {
  try {
    const w = await warehouseService.getById(wid);
    path.value.whName = w?.name || "";
    const z = await zoneService.getById(zid);
    path.value.zName = z?.name || "";
  } catch {}
}
async function load() { items.value = await aisleService.getAll(zid) || []; }
async function openDetail(id) { detail.value = await aisleService.getById(id); shelves.value = await shelfService.getAll(id) || []; ui.value = "detail"; }
function openAdd() { isEdit.value = false; editingId.value = null; form.value = { name: "", code: "" }; detail.value=null; ui.value = "form"; }
function openEdit(a) { isEdit.value = true; editingId.value = a.id; form.value = { name: a.name, code: a.code }; detail.value=a; ui.value = "form"; }
async function submit() { if (isEdit.value) await aisleService.update(editingId.value, form.value); else await aisleService.create(zid, form.value); await load(); ui.value = "list"; }
async function remove(id) { if (confirm("Xoá dãy này?")) { await aisleService.remove(id); await load(); } }
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<pageCount.value) page.value++ }

onMounted(async () => { await loadPath(); await load(); });
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.crumb { display: flex; align-items: center; justify-content: space-between; }
.crumb-chip { background: #eef5ff; border: 1px solid #d9e6ff; padding: 6px 10px; border-radius: 10px; margin-right: 6px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.btn-ctl { min-width: 110px; }
.pager-bar{ display:flex; justify-content:flex-end; padding:10px 16px; gap:10px; border-top: 1px solid #eef2f7; background:#fafbfc; }
</style>
