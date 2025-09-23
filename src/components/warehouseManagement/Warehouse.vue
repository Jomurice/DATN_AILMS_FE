<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <WarehouseSide />
      <main class="main">
        <div class="crumb">
          <span class="crumb-title">Sơ đồ kho</span>
        </div>

        <!-- LIST -->
        <div v-if="ui === 'list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Danh sách kho</h4>
            <button class="btn btn-success btn-sm btn-ctl" @click="openAdd">+ Thêm</button>
          </div>

          <div class="table-responsive tbl-shell">
            <table v-if="pagedItems.length" class="table table-hover mb-0 tbl-sticky table-tight">
              <thead class="tbl-head-blue">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:220px">ID</th>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Vị trí</th>
                  <th class="nowrap">Ngày tạo</th>
                  <th class="nowrap">Ngày cập nhật</th>
                  <th class="text-center" style="width:160px">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="w in pagedItems" :key="w.id">
                  <td class="mono small nowrap">{{ w.id }}</td>
                  <td class="mono nowrap">{{ w.code || '—' }}</td>
                  <td class="nowrap">{{ w.name }}</td>
                  <td class="nowrap">{{ w.location }}</td>
                  <td class="nowrap">{{ fmtDT(w.createdAt) }}</td>
                  <td class="nowrap">{{ fmtDT(w.updatedAt) }}</td>
                  <td class="text-center">
                    <div class="row-actions">
                      <button class="btn btn-outline-info btn-icon" title="Chi tiết" @click="openDetail(w.id)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning btn-icon" title="Sửa" @click="openEdit(w)">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-danger btn-icon" title="Xoá" @click="remove(w.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                      <RouterLink class="btn btn-outline-primary btn-icon" :to="`/warehouse/${w.id}/zone`" title="Xem khu">
                        <i class="fa-solid fa-border-all"></i>
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
            <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật kho' : 'Thêm kho' }}</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <form class="row g-3" @submit.prevent="submit">
              <div class="col-md-4">
                <label class="form-label">Mã <span class="text-danger">*</span></label>
                <input v-model.trim="form.code" class="form-control" maxlength="32" required placeholder="VD: HN01" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Tên <span class="text-danger">*</span></label>
                <input v-model.trim="form.name" class="form-control" maxlength="128" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Vị trí <span class="text-danger">*</span></label>
                <input v-model.trim="form.location" class="form-control" required />
              </div>

              <div v-if="isEdit" class="col-12 small text-muted">
                <span class="me-3">Created: {{ fmtDT(detail?.createdAt) }}</span>
                <span>Updated: {{ fmtDT(detail?.updatedAt) }}</span>
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
            <h4 class="fw-bold mb-0">Chi tiết kho</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <div class="row g-3">
              <div class="col-md-4"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
              <div class="col-md-2"><small class="text-muted">Mã</small><div class="mono">{{ detail?.code || '—' }}</div></div>
              <div class="col-md-3"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
              <div class="col-md-3"><small class="text-muted">Vị trí</small><div>{{ detail?.location }}</div></div>
              <div class="col-md-3"><small class="text-muted">Ngày tạo</small><div class="nowrap">{{ fmtDT(detail?.createdAt) }}</div></div>
              <div class="col-md-3"><small class="text-muted">Ngày cập nhật</small><div class="nowrap">{{ fmtDT(detail?.updatedAt) }}</div></div>
            </div>

            <h6 class="fw-bold mt-4">Khu — {{ zones.length }}</h6>
            <div class="table-responsive tbl-shell">
              <table class="table table-sm mb-0 tbl-sticky table-tight">
                <thead class="tbl-head-blue">
                  <tr class="text-uppercase small fw-bold">
                    <th style="width:220px">ID</th>
                    <th>Tên</th>
                    <th>Mã</th>
                    <th class="nowrap">Ngày tạo</th>
                    <th class="nowrap">Ngày cập nhật</th>
                    <th style="width:120px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="z in zones" :key="z.id">
                    <td class="mono small nowrap">{{ z.id }}</td>
                    <td class="nowrap">{{ z.name }}</td>
                    <td class="mono nowrap">{{ z.code }}</td>
                    <td class="nowrap">{{ fmtDT(z.createdAt) }}</td>
                    <td class="nowrap">{{ fmtDT(z.updatedAt) }}</td>
                    <td>
                      <RouterLink class="btn btn-sm btn-outline-primary btn-ctl" :to="`/warehouse/${detail.id}/zone/${z.id}/aisle`">
                        Quản lý dãy
                      </RouterLink>
                    </td>
                  </tr>
                  <tr v-if="!zones.length"><td colspan="6" class="text-center text-muted">Chưa có khu</td></tr>
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
import { warehouseService } from "../../services/WarehouseService";
import { zoneService } from "../../services/ZoneService";
import WarehouseSide from "./WarehouseSide.vue";

const ui = ref("list");
const items = ref([]);
const zones = ref([]);
const isEdit = ref(false);
const editingId = ref(null);
const detail = ref(null);
const form = ref({ code: "", name: "", location: "" });

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

async function load() {
  items.value = await warehouseService.getAll() || [];
}
function openAdd() {
  isEdit.value = false;
  editingId.value = null;
  detail.value = null;
  form.value = { code: "", name: "", location: "" };
  ui.value = "form";
}
function openEdit(w) {
  isEdit.value = true;
  editingId.value = w.id;
  detail.value = w;
  form.value = { code: w.code || "", name: w.name || "", location: w.location || "" };
  ui.value = "form";
}
async function openDetail(id) {
  detail.value = await warehouseService.getById(String(id));
  zones.value = await zoneService.getAll(String(id)) || [];
  ui.value = "detail";
}
async function submit() {
  const payload = { code: form.value.code, name: form.value.name, location: form.value.location };
  if (isEdit.value) await warehouseService.update(editingId.value, payload);
  else await warehouseService.create(payload);
  await load();
  ui.value = "list";
}
async function remove(id) {
  if (confirm("Xoá kho này?")) {
    await warehouseService.remove(id);
    await load();
  }
}
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<pageCount.value) page.value++ }

onMounted(load);
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.crumb { display: flex; align-items: center; justify-content: space-between; }
.crumb-title { font-weight: 700; font-size: 18px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.btn-ctl { min-width: 110px; }
.pager-bar{
  display:flex; justify-content:flex-end; padding:10px 16px; gap:10px;
  border-top: 1px solid #eef2f7; background:#fafbfc;
}
@media (max-width: 992px) { .pbox { flex-direction: column; } }
</style>
