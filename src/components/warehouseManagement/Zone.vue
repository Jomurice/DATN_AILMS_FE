<template>
  <div class="container-fluid px-3 py-4">
    <div class="pbox">
      <WarehouseSide :selected-ids="{ wid }" />
      <main class="main">
        <div class="crumb">
          <span class="crumb-chip">Kho: <b>{{ path.whName || wid }}</b></span>
          <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">⟵ Trở về</button>
        </div>

        <!-- LIST -->
        <div v-if="ui === 'list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Danh sách khu</h4>
            <button class="btn btn-success btn-sm btn-ctl" @click="openAdd">+ Thêm</button>
          </div>
          <div class="table-responsive">
            <table v-if="pagedItems.length" class="table table-hover mb-0">
              <thead class="bg-light">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:260px">ID</th>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="z in pagedItems" :key="z.id">
                  <td class="text-monospace small">{{ z.id }}</td>
                  <td>{{ z.name }}</td>
                  <td>{{ z.code }}</td>
                  <td class="text-center">
                    <div class="row-actions">
                      <button class="btn btn-sm btn-outline-info btn-ctl" @click="openDetail(z.id)">Chi tiết</button>
                      <button class="btn btn-sm btn-outline-warning btn-ctl" @click="openEdit(z)">Sửa</button>
                      <button class="btn btn-sm btn-outline-danger btn-ctl" @click="remove(z.id)">Xoá</button>
                      <!-- Xem dãy (ICON như sidebar) -->
                      <RouterLink
                        class="icon-view"
                        :to="`/warehouse/${wid}/zone/${z.id}/aisle`"
                        title="Xem dãy"
                      >
                        <i class="fa-solid fa-bars"></i>
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
            <h4 class="fw-bold mb-0">{{ isEdit ? 'Cập nhật khu' : 'Thêm khu' }}</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <form class="row g-3" @submit.prevent="submit">
              <div class="col-md-6">
                <label class="form-label">Tên khu <span class="text-danger">*</span></label>
                <input v-model.trim="form.name" class="form-control" required />
              </div>
              <div class="col-md-6">
                <label class="form-label">Mã</label>
                <input v-model.trim="form.code" class="form-control" />
              </div>
              <div class="col-12 small text-muted">Kho: {{ wid }} — {{ path.whName }}</div>
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
            <h4 class="fw-bold mb-0">Chi tiết khu</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
            <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
            <div class="mb-2"><small class="text-muted">Mã</small><div>{{ detail?.code }}</div></div>
            <div class="mb-2"><small class="text-muted">Kho</small><div>{{ path.whName || '—' }}</div></div>
            <h6 class="fw-bold mt-4">Dãy — {{ aisles.length }}</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="bg-light">
                  <tr class="text-uppercase small fw-bold">
                    <th style="width:220px">ID</th>
                    <th>Tên</th>
                    <th>Mã</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="a in aisles" :key="a.id">
                    <td class="text-monospace small">{{ a.id }}</td>
                    <td>{{ a.name }}</td>
                    <td>{{ a.code }}</td>
                    <td>
                      <RouterLink class="btn btn-sm btn-outline-primary btn-ctl" :to="`/warehouse/${wid}/zone/${detail.id}/aisle/${a.id}/shelf`">Quản lý kệ</RouterLink>
                    </td>
                  </tr>
                  <tr v-if="!aisles.length"><td colspan="4" class="text-center text-muted">Chưa có dãy</td></tr>
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
import { useRoute, useRouter } from "vue-router";
import { warehouseService } from "../../services/WarehouseService";
import { zoneService } from "../../services/ZoneService";
import { aisleService } from "../../services/AisleService";
// import WarehouseSide from "./_WarehouseSide.vue";

const router = useRouter();
const wid = useRoute().params.wid;
const ui = ref("list");
const items = ref([]);
const aisles = ref([]);
const isEdit = ref(false);
const editingId = ref(null);
const detail = ref(null);
const form = ref({ name: "", code: "" });
const path = ref({ whName: "" });

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

async function loadPath() {
  try { const w = await warehouseService.getById(wid); path.value.whName = w?.name || ""; } catch {}
}
async function load() { items.value = await zoneService.getAll(wid) || []; }
async function openDetail(id) { detail.value = await zoneService.getById(id); aisles.value = await aisleService.getAll(id) || []; ui.value = "detail"; }
function openAdd() { isEdit.value = false; editingId.value = null; form.value = { name: "", code: "" }; ui.value = "form"; }
function openEdit(z) { isEdit.value = true; editingId.value = z.id; form.value = { name: z.name, code: z.code }; ui.value = "form"; }
async function submit() { if (isEdit.value) await zoneService.update(editingId.value, form.value); else await zoneService.create(wid, form.value); await load(); ui.value = "list"; }
async function remove(id) { if (confirm("Xoá khu này?")) { await zoneService.remove(id); await load(); } }
function prevPage(){ if(page.value>1) page.value-- }
function nextPage(){ if(page.value<pageCount.value) page.value++ }

onMounted(async () => { await loadPath(); await load(); });
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.crumb { display: flex; align-items: center; justify-content: space-between; }
.crumb-chip { background: #eef5ff; border: 1px solid #d9e6ff; padding: 6px 10px; border-radius: 10px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.table th, .table td { vertical-align: middle; }
.btn-ctl { min-width: 110px; }

/* actions */
.row-actions{ display:flex; gap:8px; justify-content:center; align-items:center; }
.icon-view{
  width:34px;height:34px;border:1px solid #d7dbe6;border-radius:8px;
  background:#fff;display:inline-flex;align-items:center;justify-content:center;
}
.icon-view:hover{ background:#f5f7fb; }

/* pager */
.pager-bar{
  display:flex; justify-content:flex-end; padding:10px 16px; gap:10px;
  border-top: 1px solid #eef2f7; background:#fafbfc;
}
</style>
