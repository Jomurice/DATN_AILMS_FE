<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <WarehouseSide :selected-ids="{ wid, zid, aid, sid }" />
      <main class="main">
        <div class="crumb">
          <div class="crumb-left">
            <span class="crumb-chip">Kho: <b>{{ path.whName || wid }}</b></span>
            <span class="crumb-chip">Khu: <b>{{ path.zName || zid }}</b></span>
            <span class="crumb-chip">Dãy: <b>{{ path.aName || aid }}</b></span>
            <span class="crumb-chip">Kệ: <b>{{ path.sName || sid }}</b></span>
          </div>
          <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">⟵ Trở về</button>
        </div>

        <!-- LIST -->
        <div v-if="ui === 'list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Danh sách ngăn</h4>
            <button class="btn btn-success btn-sm btn-ctl" @click="openAdd">+ Thêm</button>
          </div>

          <div class="table-responsive tbl-shell">
            <table v-if="pagedItems.length" class="table table-hover mb-0 tbl-sticky table-tight">
              <thead class="tbl-head-blue">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:220px">ID</th>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th class="text-end">Sức chứa</th>
                  <th class="text-end">Hiện có</th>
                  <th class="nowrap">Ngày tạo</th>
                  <th class="nowrap">Ngày cập nhật</th>
                  <th class="text-center" style="width:160px">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in pagedItems" :key="b.id">
                  <td class="mono small nowrap">{{ b.id }}</td>
                  <td class="nowrap">{{ b.name }}</td>
                  <td class="mono nowrap">{{ b.code }}</td>
                  <td class="text-end nowrap">{{ b.capacity }}</td>
                  <td class="text-end nowrap">{{ b.currentQty }}</td>
                  <td class="nowrap">{{ fmtDT(b.createdAt) }}</td>
                  <td class="nowrap">{{ fmtDT(b.updatedAt) }}</td>
                  <td class="text-center">
                    <div class="row-actions">
                      <button class="btn btn-outline-info btn-icon" title="Chi tiết" @click="openDetail(b.id)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning btn-icon" title="Sửa" @click="openEdit(b)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-icon" title="Xoá" @click="remove(b.id)">
                        <i class="fas fa-trash"></i>
                      </button>
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
            <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật ngăn' : 'Thêm ngăn' }}</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <form class="row g-3" @submit.prevent="submit">
              <div class="col-md-6">
                <label class="form-label">Tên ngăn <span class="text-danger">*</span></label>
                <input v-model.trim="form.name" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Mã <span class="text-danger">*</span></label>
                <input v-model.trim="form.code" class="form-control" placeholder="VD: BIN-A1-S1" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Sức chứa <span class="text-danger">*</span></label>
                <input v-model.number="form.capacity" type="number" min="1" class="form-control" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Hiện có <span class="text-danger">*</span></label>
                <input
                  v-model.number="form.currentQty"
                  type="number"
                  min="0"
                  :max="form.capacity || 1"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">Preferred Product ID</label>
                <input v-model.trim="form.preferredProductId" class="form-control" />
              </div>

              <div v-if="isEdit" class="col-12 small text-muted">
                <span class="me-3">Created: {{ fmtDT(detail?.createdAt) }}</span>
                <span>Updated: {{ fmtDT(detail?.updatedAt) }}</span>
              </div>

              <div class="col-12 small text-muted">
                Kho: {{ path.whName }} — Khu: {{ path.zName }} — Dãy: {{ path.aName }} — Kệ: {{ path.sName }}
              </div>
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
            <h4 class="fw-bold mb-0">Chi tiết ngăn</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <div class="row g-3">
              <div class="col-md-3"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
              <div class="col-md-3"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
              <div class="col-md-3"><small class="text-muted">Mã</small><div class="mono">{{ detail?.code }}</div></div>
              <div class="col-md-3"><small class="text-muted">Preferred Product</small><div>{{ detail?.preferredProductId ?? '—' }}</div></div>
              <div class="col-md-3"><small class="text-muted">Sức chứa</small><div>{{ detail?.capacity }}</div></div>
              <div class="col-md-3"><small class="text-muted">Hiện có</small><div>{{ detail?.currentQty }}</div></div>
              <div class="col-md-3"><small class="text-muted">Ngày tạo</small><div class="nowrap">{{ fmtDT(detail?.createdAt) }}</div></div>
              <div class="col-md-3"><small class="text-muted">Ngày cập nhật</small><div class="nowrap">{{ fmtDT(detail?.updatedAt) }}</div></div>
            </div>

            <h6 class="fw-bold mt-4">Serial trong ngăn — {{ detail?.productDetails?.length || 0 }}</h6>
            <div class="table-responsive tbl-shell">
              <table class="table table-sm mb-0 tbl-sticky table-tight">
                <thead class="tbl-head-blue">
                  <tr class="text-uppercase small fw-bold">
                    <th class="nowrap">Serial</th>
                    <th class="nowrap">Sản phẩm</th>
                    <th class="nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in detail?.productDetails || []" :key="d.id">
                    <td class="nowrap">{{ d.serialNumber }}</td>
                    <td class="nowrap">{{ d.product?.sku }} — {{ d.product?.name }}</td>
                    <td class="nowrap">{{ toViStatus(d.status) }}</td>
                  </tr>
                  <tr v-if="!detail?.productDetails?.length">
                    <td colspan="3" class="text-center text-muted">Chưa có serial</td>
                  </tr>
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
import { binService, viStatus } from "../../services/BinService";
import WarehouseSide from "./WarehouseSide.vue";

const route = useRoute();
const wid = route.params.wid;
const zid = route.params.zid;
const aid = route.params.aid;
const sid = route.params.sid;

const ui = ref("list");
const items = ref([]);
const detail = ref(null);
const isEdit = ref(false);
const editingId = ref(null);
const form = ref({ name: "", code: "", capacity: 1, currentQty: 0, preferredProductId: null });
const path = ref({ whName: "", zName: "", aName: "", sName: "" });

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
    const w = await warehouseService.getById(wid); path.value.whName = w?.name || "";
    const z = await zoneService.getById(zid); path.value.zName = z?.name || "";
    const a = await aisleService.getById(aid); path.value.aName = a?.name || "";
    const s = await shelfService.getById(sid); path.value.sName = s?.name || "";
  } catch {}
}
async function load() { items.value = await binService.list(sid) || []; }
async function openDetail(id) { detail.value = await binService.getById(id); ui.value = "detail"; }
function openAdd() {
  isEdit.value = false; editingId.value = null; detail.value = null;
  form.value = { name: "", code: "", capacity: 1, currentQty: 0, preferredProductId: null };
  ui.value = "form";
}
function openEdit(b) {
  isEdit.value = true; editingId.value = b.id; detail.value = b;
  form.value = {
    name: b.name || "",
    code: b.code || "",
    capacity: Number(b.capacity ?? 1),
    currentQty: Number(b.currentQty ?? 0),
    preferredProductId: b.preferredProductId ?? null
  };
  ui.value = "form";
}
async function submit() {
  if (form.value.currentQty > form.value.capacity) { alert("Số lượng hiện có không được vượt quá sức chứa"); return; }
  if (isEdit.value) await binService.update(editingId.value, { ...form.value, shelfId: sid });
  else await binService.create(sid, form.value);
  await load(); ui.value = "list";
}
async function remove(id) { if (confirm("Xoá ngăn này?")) { await binService.remove(id); await load(); } }
function toViStatus(s) { return viStatus(s); }
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<pageCount.value) page.value++ }

watch(() => form.value.capacity, (c) => { if (form.value.currentQty > c) form.value.currentQty = c || 0; });
onMounted(async () => { await loadPath(); await load(); });
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }

/* crumb */
.crumb { display: flex; align-items: center; justify-content: space-between; }
.crumb-left { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.crumb-chip { background: #eef5ff; border: 1px solid #d9e6ff; padding: 6px 10px; border-radius: 10px; }

/* cards / containers */
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.btn-ctl { min-width: 110px; }
.pager-bar{
  display:flex; justify-content:flex-end; padding:10px 16px; gap:10px;
  border-top: 1px solid #eef2f7; background:#fafbfc;
}

/* TABLE — shared look like product */
.tbl-shell {
  max-height: 60vh;
  overflow: auto;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.tbl-head-blue tr { background: var(--bs-primary-bg-subtle, #cfe2ff); }
.tbl-head-blue th { color: var(--bs-primary-text, #0a58ca); font-weight: 700; }
.tbl-sticky thead th { position: sticky; top: 0; z-index: 2; }
.table th, .table td { vertical-align: middle; }
.table-tight td, .table-tight th { padding-top: .6rem; padding-bottom: .6rem; }
.nowrap { white-space: nowrap !important; }
.mono { font-family: ui-monospace, Menlo, Consolas, "Courier New", monospace; }

/* action icons */
.btn-icon{
  width:34px; height:34px; padding:0;
  display:inline-flex; align-items:center; justify-content:center;
  border-radius:8px;
}
.row-actions{ display:flex; align-items:center; justify-content:center; gap:8px; }

@media (max-width: 992px) {
  .pbox { flex-direction: column; }
  .tbl-shell { max-height: unset; }
}
</style>
