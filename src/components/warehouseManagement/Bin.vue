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
        <div v-if="ui === 'list'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Danh sách ngăn</h4>
            <button class="btn btn-success btn-sm btn-ctl" @click="openAdd">+ Thêm</button>
          </div>
          <div class="table-responsive">
            <table v-if="items.length" class="table table-hover mb-0">
              <thead class="bg-light">
                <tr class="text-uppercase small fw-bold">
                  <th style="width:260px">ID</th>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th class="text-end">Sức chứa</th>
                  <th class="text-end">Hiện có</th>
                  <th class="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in items" :key="b.id">
                  <td class="text-monospace small">{{ b.id }}</td>
                  <td>{{ b.name }}</td>
                  <td>{{ b.code }}</td>
                  <td class="text-end">{{ b.capacity }}</td>
                  <td class="text-end">{{ b.currentQty }}</td>
                  <td class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                      <button class="btn btn-sm btn-outline-warning btn-ctl" @click="openEdit(b)">Sửa</button>
                      <button class="btn btn-sm btn-outline-info btn-ctl" @click="openDetail(b.id)">Chi tiết</button>
                      <button class="btn btn-sm btn-outline-danger btn-ctl" @click="remove(b.id)">Xoá</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-muted p-3">Không có dữ liệu…</div>
          </div>
        </div>
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
                <input v-model.number="form.currentQty" type="number" min="0" :max="form.capacity || 1" class="form-control" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Preferred Product ID</label>
                <input v-model.number="form.preferredProductId" type="number" class="form-control" />
              </div>
              <div class="col-12 small text-muted">Kho: {{ path.whName }} — Khu: {{ path.zName }} — Dãy: {{ path.aName }} — Kệ: {{ path.sName }}</div>
              <div class="col-12">
                <button class="btn btn-primary btn-ctl">{{ isEdit ? 'Cập nhật' : 'Thêm mới' }}</button>
                <button type="button" class="btn btn-outline-secondary btn-ctl ms-2" @click="ui = 'list'">Huỷ</button>
              </div>
            </form>
          </div>
        </div>
        <div v-else-if="ui === 'detail'" class="section-card">
          <div class="d-flex align-items-center justify-content-between px-3 pt-3 pb-2">
            <h4 class="fw-bold mb-0">Chi tiết ngăn</h4>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" @click="$router.back()">⟵ Trở về</button>
              <button class="btn btn-outline-secondary btn-sm" @click="ui = 'list'">← Quay lại</button>
            </div>
          </div>
          <div class="card border-0 shadow-sm p-4">
            <div class="mb-2"><small class="text-muted">ID</small><div class="fw-medium">{{ detail?.id }}</div></div>
            <div class="mb-2"><small class="text-muted">Tên</small><div>{{ detail?.name }}</div></div>
            <div class="mb-2"><small class="text-muted">Mã</small><div>{{ detail?.code }}</div></div>
            <div class="mb-2"><small class="text-muted">Sức chứa</small><div>{{ detail?.capacity }}</div></div>
            <div class="mb-2"><small class="text-muted">Hiện có</small><div>{{ detail?.currentQty }}</div></div>
            <div class="mb-2"><small class="text-muted">Kệ</small><div>{{ path.sName || '—' }}</div></div>
            <div class="mb-2"><small class="text-muted">Preferred Product</small><div>{{ detail?.preferredProductId ?? '—' }}</div></div>
            <h6 class="fw-bold mt-4">Serial trong ngăn — {{ detail?.productDetails?.length || 0 }}</h6>
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="bg-light">
                  <tr class="text-uppercase small fw-bold">
                    <th>Serial</th>
                    <th>Sản phẩm</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in detail?.productDetails || []" :key="d.id">
                    <td>{{ d.serialNumber }}</td>
                    <td>{{ d.product?.sku }} — {{ d.product?.name }}</td>
                    <td>{{ toViStatus(d.status) }}</td>
                  </tr>
                  <tr v-if="!detail?.productDetails?.length"><td colspan="3" class="text-center text-muted">Chưa có serial</td></tr>
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
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { warehouseService } from "../../services/WarehouseService";
import { zoneService } from "../../services/ZoneService";
import { aisleService } from "../../services/AisleService";
import { shelfService } from "../../services/ShelfService";
import { binService, viStatus } from "../../services/BinService";
import WarehouseSide from "./_WarehouseSide.vue";

const router = useRouter();
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

async function loadPath() {
  try {
    const w = await warehouseService.getById(wid);
    path.value.whName = w?.name || "";
    const z = await zoneService.getById(zid);
    path.value.zName = z?.name || "";
    const a = await aisleService.getById(aid);
    path.value.aName = a?.name || "";
    const s = await shelfService.getById(sid);
    path.value.sName = s?.name || "";
  } catch {}
}
async function load() {
  items.value = await binService.list(sid) || [];
}
async function openDetail(id) {
  detail.value = await binService.getById(id);
  ui.value = "detail";
}
function openAdd() {
  isEdit.value = false;
  editingId.value = null;
  form.value = { name: "", code: "", capacity: 1, currentQty: 0, preferredProductId: null };
  ui.value = "form";
}
function openEdit(b) {
  isEdit.value = true;
  editingId.value = b.id;
  form.value = { name: b.name || "", code: b.code || "", capacity: b.capacity ?? 1, currentQty: b.currentQty ?? 0, preferredProductId: b.preferredProductId ?? null };
  ui.value = "form";
}
async function submit() {
  if (form.value.currentQty > form.value.capacity) {
    alert("Số lượng hiện có không được vượt quá sức chứa");
    return;
  }
  if (isEdit.value) await binService.update(editingId.value, { ...form.value, shelfId: sid });
  else await binService.create(sid, form.value);
  await load();
  ui.value = "list";
}
async function remove(id) {
  if (confirm("Xoá ngăn này?")) {
    await binService.remove(id);
    await load();
  }
}
function toViStatus(s) {
  return viStatus(s);
}

watch(() => form.value.capacity, (c) => {
  if (form.value.currentQty > c) form.value.currentQty = c || 0;
});

onMounted(async () => {
  await loadPath();
  await load();
});
</script>

<style scoped>
.pbox { display: flex; gap: 16px; width: 100%; }
.main { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.crumb { display: flex; align-items: center; justify-content: space-between; }
.crumb-chip { background: #eef5ff; border: 1px solid #d9e6ff; padding: 6px 10px; border-radius: 10px; margin-right: 6px; }
.section-card { background: #fff; border: 1px solid #eef2f7; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.table th, .table td { vertical-align: middle; }
.btn-ctl { min-width: 110px; }
</style>